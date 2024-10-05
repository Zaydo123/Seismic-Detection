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
  host: "10.1.116.93",
  database: "postgres",
  password: "postgres",
  port: 5432,
});

// Redis 
const redisClient = await createClient({
    host: "10.1.116.93",
    database: 0,
    port: 6379,
});

await redisClient.connect();
//ping redis
console.log(await redisClient.ping());
let id = "1";
await redisClient.publish('intraservice', '1');

// subscribe to redis channel named finished_processing and log the message
await redisClient.subscribe('finished_processing');
await redisClient.on('message', (channel, message) => {
    console.log(`Received message from channel ${channel}: ${message}`);
}
);

await redisClient.quit();

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
          await client.query(
            `INSERT INTO public.files (name, content, created_at) 
             VALUES ($1, $2, NOW())`,
            [
              filename,
              JSON.stringify(rows), // Convert the array of rows to a JSON string
            ]
          );

          client.release();
          console.log('Data successfully inserted into the database.');
          resolve();
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
    await parseAndInsertCsv(filePath);
    res.status(200).send('File uploaded and data inserted successfully.');
  } catch (error) {
    console.error('Error during file processing:', error);
    res.status(500).send('Internal Server Error while processing the file.');
  }
});

// Define a root route (optional)
app.get('/', (req, res) => {
  res.send('Welcome to the File Upload Server');
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
