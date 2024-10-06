import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import pkg from 'pg'; // Importing the CommonJS module as a default import
import csv from 'csv-parser';
import cors from 'cors';
import { createClient } from 'redis';

const { Pool } = pkg; // Destructuring Pool from the imported package

const app = express();
const port = 5000;

// Enable CORS for all origins
app.use(cors());

// Set up PostgreSQL connection pool
const pool = new Pool({
  user: "postgres",
  host: "172.23.96.1",
  database: "postgres",
  password: "postgres",
  port: 5432,
});

// Set up storage with multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.resolve('uploads');

    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }

    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

// Function to parse and insert data into PostgreSQL
async function parseAndInsertCsv(filePath) {
  const filename = path.basename(filePath);
  const rows = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        rows.push({
          time_abs: row['time_abs(%Y-%m-%dT%H:%M:%S.%f)'],
          time_rel: parseFloat(row['time_rel(sec)']),
          velocity: parseFloat(row['velocity(m/s)']),
        });
      })
      .on('end', async () => {
        console.log(`CSV file ${filename} successfully parsed.`);

        try {
          const client = await pool.connect();
          const insertQuery = `
            INSERT INTO public.files (name, content, created_at) 
            VALUES ($1, $2, NOW()) RETURNING id, name, created_at;
          `;
          const result = await client.query(insertQuery, [filename, JSON.stringify(rows)]);

          client.release();
          console.log('Data successfully inserted into the database.');
          resolve(result.rows[0]); // Resolve with the inserted row's metadata
        } catch (err) {
          console.error('Error inserting data into the database:', err);
          reject(err); // Reject the promise with the error
        }
      })
      .on('error', (err) => {
        console.error('Error reading the CSV file:', err);
        reject(err); // Reject the promise with the error
      });
  });
}

// Define a route to handle file upload and parsing
app.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    console.error('No file received');
    return res.status(400).send('No file uploaded.');
  }

  const filePath = req.file.path; // Get the path of the uploaded file

  try {
    const fileMetadata = await parseAndInsertCsv(filePath);
    res.status(200).json(fileMetadata); // Return file metadata (including ID)
  } catch (error) {
    console.error('Error during file processing:', error);
    res.status(500).send('Internal Server Error while processing the file.');
  }
});

// Route to get graph data for plotting
app.get('/api/graph-data', async (req, res) => {
  try {
    // Query to select the necessary data from the database
    const query = `
      SELECT 
        files.name, 
        files.content, 
        files.created_at, 
        detections.start_time 
      FROM 
        files 
      LEFT JOIN 
        detections ON files.id = detections.file;
    `;

    const result = await pool.query(query);

    // Parse JSON content for each row
    const formattedData = result.rows.map(row => {
      // Parse JSON content stored in the 'content' column
      const content = JSON.parse(row.content);

      // Log each data point along with other details
      console.log(`Name: ${row.name}`);
      console.log(`Created At: ${row.created_at}`);
      console.log(`Start Time: ${row.start_time}`);

      content.forEach(item => {
        console.log(`Relative Time: ${item.time_rel}, Absolute Time: ${item.time_abs}, Velocity: ${item.velocity}`);
      });

      return {
        name: row.name,
        created_at: row.created_at,
        start_time: row.start_time,
        data: content, // Array of objects with velocity, time_abs, and time_rel
      };
    });

    // Send the formatted data as a JSON response
    res.json(formattedData);
  } catch (error) {
    console.error('Error fetching data for graphing:', error);
    res.status(500).send('Internal Server Error while fetching data for graphing.');
  }
});

// Route to get all files
app.get('/files', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, created_at FROM public.files ORDER BY created_at DESC');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching files from the database:', error);
    res.status(500).send('Internal Server Error while fetching files.');
  }
});

// Define a route to delete a file by ID
app.delete('/files/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const client = await pool.connect();
    const deleteQuery = 'DELETE FROM public.files WHERE id = $1';
    const result = await client.query(deleteQuery, [id]);

    client.release();

    if (result.rowCount > 0) {
      res.status(200).send('File deleted successfully');
    } else {
      res.status(404).send('File not found');
    }
  } catch (error) {
    console.error('Error deleting file from the database:', error);
    res.status(500).send('Internal Server Error while deleting file.');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
