import { UsuarioModel } from './src/models/PerfilModel';
import bcrypt from 'bcryptjs';

async function createTestUser() {
  try {
    const userData = {
      nombre: 'Admin',
      apellido: 'Test',
      email: 'admin@test.com',
      genero: 'M' as const,
      fecha_nacimiento: '1990-01-01',
      cedula: '1234567890',
      usuario: 'admin',
      contraseña: '1234',
      perfil: 'admin',
      permisos: 'Inicio,Asignar,Cliente,Ventas,Productos,Servicios,Proveedores,Reportes'
    };

    const user = await UsuarioModel.create(userData);
    console.log('Usuario de prueba creado:', user);
  } catch (error) {
    console.error('Error creando usuario:', error);
  }
}

createTestUser();
