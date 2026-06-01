const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const SQL_FILE_PATH = path.join(__dirname, '../db/happyh50_vehicleinsurance.sql');
const DB_CONNECTION_STRING = 'postgresql://postgres.odounznpgoesbpzouqef:OATWakZAWgVuMwUF@aws-1-ap-south-1.pooler.supabase.com:6543/postgres';

async function runMigration() {
  console.log('Reading MySQL SQL dump...');
  const sqlContent = fs.readFileSync(SQL_FILE_PATH, 'utf8');

  // Step 1: Extract all Auto Increment mappings from the end of the dump
  const autoIncrements = {};
  const aiRegex = /ALTER TABLE\s+`([\w-]+)`\s+MODIFY\s+`([\w-]+)`[^,]*AUTO_INCREMENT/gi;
  let match;
  while ((match = aiRegex.exec(sqlContent)) !== null) {
    const tableName = match[1];
    const columnName = match[2];
    autoIncrements[tableName] = columnName;
  }
  console.log(`Extracted auto-increment mappings for ${Object.keys(autoIncrements).length} tables.`);

  // Step 2: Parse the file line-by-line and convert CREATE TABLE and INSERT INTO blocks
  const lines = sqlContent.split('\n');
  let currentTable = null;
  let convertedQueries = [];
  let currentQuery = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Ignore MySQL commands and comments
    if (line.startsWith('--') || line.startsWith('/*') || line.startsWith('SET ') || line.startsWith('START TRANSACTION') || line.startsWith('COMMIT;')) {
      continue;
    }

    // Ignore legacy ALTER TABLE constraints since primary keys and sequences are made inline
    if (line.startsWith('ALTER TABLE ') && (line.includes('ADD KEY') || line.includes('ADD PRIMARY KEY') || line.includes('MODIFY '))) {
      continue;
    }

    // CREATE TABLE start
    const createTableMatch = /CREATE TABLE\s+`([\w-]+)`/i.exec(line);
    if (createTableMatch) {
      currentTable = createTableMatch[1];
      currentQuery = `CREATE TABLE "${currentTable}" (\n`;
      continue;
    }

    if (currentTable) {
      // If table definition ends
      if (line.startsWith(')') || line.endsWith(';')) {
        currentQuery = currentQuery.trim().replace(/,$/, '') + '\n);';
        convertedQueries.push(currentQuery);
        currentQuery = '';
        currentTable = null;
        continue;
      }

      // Column definitions
      const colMatch = /^`([\w-]+)`\s+(.*)/i.exec(line);
      if (colMatch) {
        const colName = colMatch[1];
        let colDef = colMatch[2];

        // Clean character sets and collate clauses
        colDef = colDef.replace(/CHARACTER SET \w+/gi, '');
        colDef = colDef.replace(/COLLATE \w+/gi, '');

        // Determine if it is the primary key and auto-increment
        if (autoIncrements[currentTable] === colName) {
          currentQuery += `  "${colName}" SERIAL PRIMARY KEY,\n`;
        } else {
          // Convert types to PostgreSQL
          let pgType = colDef;
          pgType = pgType.replace(/int\(\d+\)/gi, 'integer');
          pgType = pgType.replace(/tinyint\(\d+\)/gi, 'smallint');
          pgType = pgType.replace(/double/gi, 'double precision');
          pgType = pgType.replace(/datetime/gi, 'timestamp without time zone');
          pgType = pgType.replace(/enum\([^)]*\)/gi, 'varchar(50)');
          pgType = pgType.replace(/varbinary\(\d+\)/gi, 'varchar(255)');
          pgType = pgType.replace(/varbinary/gi, 'varchar(255)');

          // Remove trailing comma from input to format nicely
          pgType = pgType.trim().replace(/,$/, '');
          currentQuery += `  "${colName}" ${pgType},\n`;
        }
      }
      continue;
    }

    // INSERT INTO statements
    if (line.startsWith('INSERT INTO ')) {
      // Replace MySQL backticks in table/column declarations with double quotes (handling hyphens)
      let convertedInsert = line.replace(/`([\w-]+)`/g, '"$1"');
      
      // Accumulate multi-line inserts until a semicolon is found
      while (!convertedInsert.endsWith(';') && i < lines.length - 1) {
        i++;
        convertedInsert += '\n' + lines[i].trim().replace(/`([\w-]+)`/g, '"$1"');
      }
      
      // Escape single quotes for PostgreSQL standard strings
      convertedInsert = convertedInsert.replace(/\\'/g, "''");
      
      convertedQueries.push(convertedInsert);
    }
  }

  console.log(`Converted SQL into ${convertedQueries.length} distinct PostgreSQL operations.`);

  // Step 3: Execute on Supabase
  const client = new Client({
    connectionString: DB_CONNECTION_STRING,
    ssl: { rejectUnauthorized: false } // Required for Supabase ssl pooler connections
  });

  try {
    console.log('Connecting to Supabase PostgreSQL database...');
    await client.connect();
    
    console.log('Resetting and cleaning public schema for a fresh install...');
    await client.query('DROP SCHEMA IF EXISTS public CASCADE;');
    await client.query('CREATE SCHEMA public;');
    await client.query('GRANT ALL ON SCHEMA public TO postgres;');
    await client.query('GRANT ALL ON SCHEMA public TO public;');
    
    console.log('Connected! Executing schema setup & data seeding...');

    // We execute in sequence
    for (let index = 0; index < convertedQueries.length; index++) {
      let query = convertedQueries[index];
      
      // Replace legacy MySQL zero-dates with NULL (PostgreSQL does not support 0000-00-00 dates)
      query = query.replace(/'0000-00-00 00:00:00'/g, "NULL");
      query = query.replace(/'0000-00-00'/g, "NULL");
      query = query.replace(/DEFAULT '0000-00-00 00:00:00'/gi, "DEFAULT NULL");
      query = query.replace(/DEFAULT '0000-00-00'/gi, "DEFAULT NULL");

      // Logging progress for table setups
      if (query.startsWith('CREATE TABLE')) {
        const tableName = /CREATE TABLE "([\w-]+)"/i.exec(query)[1];
        console.log(`[${index + 1}/${convertedQueries.length}] Creating table "${tableName}"...`);
      }

      try {
        await client.query(query);
      } catch (err) {
        // Log query errors for inspection
        console.error(`Error executing query index ${index}:`, err.message);
        console.error('Query snippet:', query.substring(0, 300));
        throw err;
      }
    }

    console.log('Database Migration & Import Completed Successfully!');
  } catch (err) {
    console.error('Database migration failed:', err.message);
  } finally {
    await client.end();
  }
}

runMigration();
