import fs from 'fs';
import csv from 'csv-parser';
import pkg from 'pg';
import dotenv from 'dotenv';
const { Pool } = pkg;

dotenv.config(); // Load environment variables from .env file

// Database connection using environment variables
const pool = new Pool({
    user: "postgres",
    host: "10.1.118.70",
    database: "postgres",
    password: "postgres",
    port: 5432,
  });

// Path to the CSV file
const csvFilePath = './dummy_data/seismic_data_sample.csv';

// Function to insert data into the database
async function insertData(fileId, createdAt, startTime) {
  const query = `
    INSERT INTO detections (file, created_at, start_time)
    VALUES ($1, $2, $3)
  `;

  try {
    const client = await pool.connect();
    await client.query(query, [fileId, createdAt, startTime]);
    client.release();
    console.log(`Inserted data: file_id=${fileId}, created_at=${createdAt}, start_time=${startTime}`);
  } catch (err) {
    console.error('Error inserting data into database:', err);
  }
}

// Function to parse the CSV file and insert data into PostgreSQL
function parseAndInsertCsv(filePath) {
  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (row) => {
      // Extract data from the CSV row
      const fileId = parseInt(row['file_id']);
      const createdAt = new Date(row['created_at']);
      const startTime = parseFloat(row['start_time']);

      // Insert data into the database
      insertData(fileId, createdAt, startTime);
    })
    .on('end', () => {
      console.log('CSV file successfully processed and data inserted.');
    })
    .on('error', (err) => {
      console.error('Error reading the CSV file:', err);
    });
}

// Run the function
parseAndInsertCsv(csvFilePath);
