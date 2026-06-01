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
    const res = await client.query('SELECT adm_id, adm_username, adm_contact, adm_password, adm_type, adm_status FROM admin_login LIMIT 10');
    console.log(JSON.stringify(res.rows, null, 2));
    await client.end();
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
