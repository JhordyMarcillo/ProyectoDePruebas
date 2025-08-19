const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

async function createAdmin() {
  try {
    // Conexión a la base de datos
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'root',
      database: 'spa_base'
    });

    console.log('Conectado a la base de datos');

    // Verificar si ya existe un admin
    const [existing] = await connection.execute(
      'SELECT * FROM perfiles WHERE usuario = ? OR perfil = ?',
      ['admin', 'admin']
    );

    if (existing.length > 0) {
      console.log('Ya existe un usuario admin');
      await connection.end();
      return;
    }

    // Crear contraseña hasheada
    const hashedPassword = await bcrypt.hash('1234', 10);

    // Permisos completos
    const permisos = [
      'Inicio',
      'Asignar', 
      'Cliente',
      'Ventas',
      'Productos',
      'Servicios',
      'Proveedores',
      'Reportes'
    ].join(',');

    // Insertar usuario admin
    const insertQuery = `
      INSERT INTO perfiles (
        nombre, apellido, email, genero, fecha_nacimiento, 
        cedula, usuario, contraseña, perfil, permisos, estado
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await connection.execute(insertQuery, [
      'Administrador',
      'Sistema',
      'admin@spa.com',
      'M',
      '1990-01-01',
      '12345678',
      'admin',
      hashedPassword,
      'admin',
      permisos,
      'activo'
    ]);

    await connection.end();
    console.log('Conexión cerrada');

  } catch (error) {
  }
}

createAdmin();
