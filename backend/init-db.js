const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;

console.log('Initializing database...');
console.log('Connection string:', connectionString ? 'Set' : 'Not set');

const pool = new Pool({
  connectionString: connectionString,
  ssl: { rejectUnauthorized: false }
});

const createTables = async () => {
  try {
    const client = await pool.connect();
    console.log('Connected to database');

    // Read and execute the SQL file
    const fs = require('fs').promises;
    const sql = await fs.readFile('./database.sql', 'utf8');
    
    console.log('Executing SQL commands...');
    await client.query(sql);
    
    console.log('✅ Database tables created successfully!');
    
    // Test the connection
    const result = await client.query('SELECT table_name FROM information_schema.tables WHERE table_schema = $1', ['public']);
    console.log('Tables created:', result.rows.map(row => row.table_name));
    
    client.release();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating tables:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
};

createTables();