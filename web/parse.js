import fs from 'fs';
import path from 'path';
import pkg from 'pg'; // Importing the CommonJS module as a default import
import csv from 'csv-parser';

const { Pool } = pkg; // Destructuring Pool from the imported package

// Set up PostgreSQL connection pool
const pool = new Pool({
  user: "postgres",
  host: "10.40.223.199",
  database: "postgres",
  password: "postgres", // Explicitly ensuring this is a string
  port: 5432,
});

// Simple connection test
(async () => {
  try {
    const client = await pool.connect();
    console.log('Successfully connected to the database');
    client.release();
  } catch (err) {
    console.error('Database connection error:', err);
  }
})();

// Function to read CSV, parse, and insert data into the database
async function parseAndInsertCsv(filePath) {
  const filename = path.basename(filePath);
  const rows = [];

  // Parse the CSV file
  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (row) => {
      // Add row to rows array
      rows.push({
        time_abs: row['time_abs(%Y-%m-%dT%H:%M:%S.%f)'],
        time_rel: parseFloat(row['time_rel(sec)']),
        velocity: parseFloat(row['velocity(m/s)']),
      });
    })
    .on('end', async () => {
      console.log(`CSV file ${filename} successfully parsed.`);

      try {
        // Insert data into the database
        const client = await pool.connect();

        // Insert the content into the database
        await client.query(
          `INSERT INTO public.files (name, content, created_at) 
           VALUES ($1, $2, NOW())`,
          [
            filename,
            JSON.stringify(rows), // Converting the array of rows to JSON string
          ]
        );

        client.release();
        console.log('Data successfully inserted into the database.');
      } catch (err) {
        console.error('Error inserting data into the database:', err);
      }
    });
}

// Run the function
const filePath = './datafiles/data.csv'; 
parseAndInsertCsv(filePath);
