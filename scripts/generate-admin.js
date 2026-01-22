const bcrypt = require('bcryptjs');

const password = 'admin123'; // Ganti dengan password yang diinginkan
const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) {
    console.error('Error hashing password:', err);
    return;
  }
  console.log('--- GENERATOR USER ADMIN PERTAMA ---');
  console.log('Password Asli:', password);
  console.log('Hashed Password:', hash);
  console.log('------------------------------------');
  console.log('\nSilakan buka Google Sheet Anda, buat TAB baru bernama "Users".');
  console.log('Isi baris pertama (HEADER) dengan:');
  console.log('Username | Password | Name | Role | Desa');
  console.log('\nLalu isi baris kedua dengan data ini:');
  console.log(`admin | ${hash} | Super Admin | Admin | ALL`);
});
