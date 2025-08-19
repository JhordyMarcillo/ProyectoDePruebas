const bcrypt = require('bcryptjs');

async function createTestUser() {
  // Hashear la contraseña "1234"
  const hashedPassword = await bcrypt.hash('1234', 12);
  //('Hash para contraseña "1234":', hashedPassword);
  
  // También crear hash para "admin"
  const hashedAdmin = await bcrypt.hash('admin', 12);
  //('Hash para contraseña "admin":', hashedAdmin);
}

createTestUser();
