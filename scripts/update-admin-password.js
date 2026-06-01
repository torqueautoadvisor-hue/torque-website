const { Client } = require('/Users/utkarshmakwana/Downloads/vehicle-bk/torque-next/node_modules/pg');

const databaseUrl = 'postgresql://postgres.odounznpgoesbpzouqef:OATWakZAWgVuMwUF@aws-1-ap-south-1.pooler.supabase.com:6543/postgres';

const client = new Client({
  connectionString: databaseUrl,
  ssl: {
    rejectUnauthorized: false
  }
});

client.connect()
  .then(async () => {
    // Update Master Admin (adm_id = 1) password hash to md5('admin123')
    const knownHash = '0192023a7bbd73250516f069df18b500'; // MD5 for 'admin123'
    const res = await client.query('UPDATE admin_login SET adm_password = $1 WHERE adm_id = 1', [knownHash]);
    console.log('Password update status:', res.rowCount === 1 ? 'SUCCESS' : 'FAILED');
    
    // Select to verify
    const verify = await client.query('SELECT adm_username, adm_contact, adm_password FROM admin_login WHERE adm_id = 1');
    console.log('Verified user data:', verify.rows[0]);
    
    await client.end();
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
