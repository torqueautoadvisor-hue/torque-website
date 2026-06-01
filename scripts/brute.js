const crypto = require('crypto');

const hashes = {
  'Master Admin (8000811331)': 'dbc47ac081c64fc5829ba6d17ca47326',
  'SONALI KANZARIYA (9727264373)': 'c5efa17f4ce6469ac5c5777a41517954',
  'PARVEZ BELIM (8320666616)': 'ade0e7707d713736dc4a9c98425d5f1a'
};

const commonPasswords = [
  'admin', 'admin123', 'admin@123', 'admin1234', 'admin@1234',
  '123456', '12345678', '123456789', '12345', '123',
  'torque', 'torque123', 'torque@123', 'torqueautoadvisor',
  'torque2018', 'torque2019', 'torque2020', 'torque2021', 'torque2022', 'torque2023', 'torque2024', 'torque2025', 'torque2026',
  'torque@2018', 'torque@2022', 'torque@2023', 'torque@2024',
  'password', 'pass', '111111', '8000811331', '9727264373', '8320666616',
  'master', 'masteradmin', 'master@123',
  'sonali', 'sonali@123', 'sonali123', 'sonali@1234',
  'parvez', 'parvez@123', 'parvez123', 'parvez@1234',
  'torqueofficemorbi', 'torquemanager2526', 'torquecrm28',
  'info@torqueautoadvisor.com', 'T@rk#123$45'
];

for (const p of commonPasswords) {
  const md5 = crypto.createHash('md5').update(p).digest('hex');
  for (const [user, hash] of Object.entries(hashes)) {
    if (md5 === hash) {
      console.log(`FOUND password for ${user}: "${p}"`);
    }
  }
}
