const db = require('./src/database/connection').db;

async function checkTable() {
  try {
    // Check if table exists
    const hasTable = await db.schema.hasTable('kriteria');
    console.log('Table exists:', hasTable);
    
    // Get table info
    const columns = await db.raw('DESCRIBE kriteria');
    console.log('\nTable structure:');
    console.log(columns[0]);
    
    // Check migrations
    const migrations = await db('knex_migrations').select('*').orderBy('id', 'desc').limit(5);
    console.log('\nRecent migrations:');
    console.log(migrations);
    
    await db.destroy();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkTable();
