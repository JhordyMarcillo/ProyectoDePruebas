import { executeQuery } from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  genero: 'M' | 'F';
  fecha_nacimiento: Date;
  cedula: string;
  usuario: string;
  password?: string; // Opcional por seguridad - no se expone en respuestas
  perfil: string;
  permisos: string[];
  estado: 'activo' | 'inactivo';
  fecha_creacion: Date;
}

export interface CreateUsuarioRequest {
  nombre: string;
  apellido: string;
  email: string;
  genero: 'M' | 'F';
  fecha_nacimiento: string;
  cedula: string;
  usuario: string;
  password: string;
  perfil: string;
  permisos?: string;
}

export interface UpdateUsuarioRequest {
  nombre?: string;
  apellido?: string;
  email?: string;
  genero?: 'M' | 'F';
  fecha_nacimiento?: string;
  cedula?: string;
  usuario?: string;
  password?: string;
  perfil?: string;
  permisos?: string;
  estado?: 'activo' | 'inactivo';
}

export class UsuarioModel {
  static async findAll(
    limit: number = 10,
    offset: number = 0,
    search?: string
  ): Promise<{ usuarios: Usuario[]; total: number }> {
    let query = `
      SELECT id, nombre, apellido, email, genero, fecha_nacimiento, 
             cedula, usuario, contraseña, perfil, permisos, estado, fecha_creacion
      FROM perfiles
    `;
    let countQuery = 'SELECT COUNT(*) as total FROM perfiles';
    const params: any[] = [];

    if (search) {
      const searchCondition = ` WHERE (nombre LIKE ? OR apellido LIKE ? OR email LIKE ? OR usuario LIKE ?)`;
      query += searchCondition;
      countQuery += searchCondition;
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam, searchParam);
    }

    query += ' ORDER BY fecha_creacion DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [usuarios, totalResult] = await Promise.all([
      executeQuery<RowDataPacket[]>(query, params),
      executeQuery<RowDataPacket[]>(countQuery, search ? params.slice(0, 4) : [])
    ]);

    return {
      usuarios: usuarios.map(this.mapRowToUsuario),
      total: totalResult[0]?.total || 0
    };
  }

  static async findById(id: number): Promise<Usuario | null> {
    const query = `
      SELECT id, nombre, apellido, email, genero, fecha_nacimiento,
             cedula, usuario, contraseña, perfil, permisos, estado, fecha_creacion
      FROM perfiles
      WHERE id = ?
    `;
    const result = await executeQuery<RowDataPacket[]>(query, [id]);
    
    return result.length > 0 ? this.mapRowToUsuario(result[0]!) : null;
  }

  static async findByUsername(usuario: string): Promise<Usuario | null> {
    const query = `
      SELECT id, nombre, apellido, email, genero, fecha_nacimiento,
             cedula, usuario, contraseña, perfil, permisos, estado, fecha_creacion
      FROM perfiles
      WHERE usuario = ?
    `;
    const result = await executeQuery<RowDataPacket[]>(query, [usuario]);
    
    if (result.length === 0 || !result[0]) {
      return null;
    }
    
    return this.mapRowToUsuario(result[0]);
  }

  static async findByUsernameWithPassword(usuario: string): Promise<Usuario | null> {
    const query = `
      SELECT id, nombre, apellido, email, genero, fecha_nacimiento,
             cedula, usuario, contraseña, perfil, permisos, estado, fecha_creacion
      FROM perfiles
      WHERE usuario = ?
    `;
    const result = await executeQuery<RowDataPacket[]>(query, [usuario]);
    
    if (result.length === 0 || !result[0]) {
      return null;
    }
    
    return this.mapRowToUsuarioWithPassword(result[0]);
  }

  static async findByEmail(email: string): Promise<Usuario | null> {
    const query = `
      SELECT id, nombre, apellido, email, genero, fecha_nacimiento,
             cedula, usuario, contraseña, perfil, permisos, estado, fecha_creacion
      FROM perfiles
      WHERE email = ?
    `;
    const result = await executeQuery<RowDataPacket[]>(query, [email]);
    
    if (result.length === 0 || !result[0]) {
      return null;
    }
    
    return this.mapRowToUsuario(result[0]);
  }

  static async findByCedula(cedula: string): Promise<Usuario | null> {
    const query = `
      SELECT id, nombre, apellido, email, genero, fecha_nacimiento,
             cedula, usuario, contraseña, perfil, permisos, estado, fecha_creacion
      FROM perfiles
      WHERE cedula = ?
    `;
    const result = await executeQuery<RowDataPacket[]>(query, [cedula]);
    
    if (result.length === 0 || !result[0]) {
      return null;
    }
    
    return this.mapRowToUsuario(result[0]);
  }

  static async create(usuarioData: CreateUsuarioRequest): Promise<Usuario> {
    
    const query = `
      INSERT INTO perfiles (nombre, apellido, email, genero, fecha_nacimiento, 
                           cedula, usuario, contraseña, perfil, permisos)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
      usuarioData.nombre,
      usuarioData.apellido,
      usuarioData.email,
      usuarioData.genero,
      usuarioData.fecha_nacimiento,
      usuarioData.cedula,
      usuarioData.usuario,
      usuarioData.perfil,
      usuarioData.permisos || ''
    ];
    
    const result = await executeQuery<ResultSetHeader>(query, params);
    const newUsuario = await this.findById(result.insertId);
    
    if (!newUsuario) {
      throw new Error('Error al crear el usuario');
    }
    
    return newUsuario;
  }

  static async update(id: number, usuarioData: UpdateUsuarioRequest): Promise<Usuario | null> {
    const fields: string[] = [];
    const params: any[] = [];
    
    Object.entries(usuarioData).forEach(([key, value]) => {
      if (value !== undefined) {
        if (key === 'password') {
          fields.push(`contraseña = ?`);
        } else {
          fields.push(`${key} = ?`);
          params.push(value);
        }
      }
    });
    
    if (fields.length === 0) {
      return this.findById(id);
    }
    
    const query = `UPDATE perfiles SET ${fields.join(', ')} WHERE id = ?`;
    params.push(id);
    
    const result = await executeQuery<ResultSetHeader>(query, params);
    
    if (result.affectedRows === 0) {
      return null;
    }
    
    return this.findById(id);
  }

  static async delete(id: number): Promise<boolean> {
    const query = 'DELETE FROM perfiles WHERE id = ?';
    const result = await executeQuery<ResultSetHeader>(query, [id]);
    return result.affectedRows > 0;
  }

  static async toggleStatus(id: number): Promise<Usuario | null> {
    const usuario = await this.findById(id);
    if (!usuario) {
      return null;
    }
    
    const newStatus = usuario.estado === 'activo' ? 'inactivo' : 'activo';
    return this.update(id, { estado: newStatus });
  }


  static async getPermissions(userId: number): Promise<string[]> {
    const usuario = await this.findById(userId);
    if (!usuario || !usuario.permisos) {
      return [];
    }
    
    // Si ya es un array, devolverlo directamente
    if (Array.isArray(usuario.permisos)) {
      return usuario.permisos;
    }
    
    // Si es string, parsearlo (esto no debería pasar ya que mapRowToUsuario lo convierte)
    return [];
  }

  static async updateLastAccess(userId: number): Promise<void> {
    // Funcionalidad deshabilitada - la tabla perfiles original no tiene campo ultimo_acceso
    // const query = 'UPDATE perfiles SET ultimo_acceso = NOW() WHERE id = ?';
    // await executeQuery(query, [userId]);
    return Promise.resolve();
  }

  static async getStats(): Promise<{
    total: number;
    activos: number;
    inactivos: number;
    porPerfil: { perfil: string; cantidad: number }[];
    porGenero: { genero: string; cantidad: number }[];
  }> {
    try {
      // Total de usuarios
      const totalResult = await executeQuery<RowDataPacket[]>(
        'SELECT COUNT(*) as total FROM perfiles'
      );
      const total = totalResult?.[0]?.total || 0;

      // Usuarios activos/inactivos
      const estadoStats = await executeQuery<RowDataPacket[]>(
        'SELECT estado, COUNT(*) as cantidad FROM perfiles GROUP BY estado'
      );

      // Usuarios por perfil
      const perfilStats = await executeQuery<RowDataPacket[]>(
        'SELECT perfil, COUNT(*) as cantidad FROM perfiles GROUP BY perfil'
      );

      // Usuarios por género
      const generoStats = await executeQuery<RowDataPacket[]>(
        'SELECT genero, COUNT(*) as cantidad FROM perfiles GROUP BY genero'
      );

      const activos = estadoStats.find(s => s.estado === 'activo')?.cantidad || 0;
      const inactivos = estadoStats.find(s => s.estado === 'inactivo')?.cantidad || 0;

      return {
        total,
        activos,
        inactivos,
        porPerfil: perfilStats.map(p => ({
          perfil: p.perfil,
          cantidad: p.cantidad
        })),
        porGenero: generoStats.map(g => ({
          genero: g.genero === 'M' ? 'Masculino' : 'Femenino',
          cantidad: g.cantidad
        }))
      };
    } catch (error) {
      //('Error obteniendo estadísticas de usuarios:', error);
      throw error;
    }
  }

  private static mapRowToUsuario(row: RowDataPacket): Usuario {
    let permisos: string[] = [];
    
    // Parsear permisos si es un string JSON
    if (row.permisos) {
      try {
        if (typeof row.permisos === 'string') {
          // Si es string, intentar parsearlo como JSON
          permisos = JSON.parse(row.permisos);
        } else if (Array.isArray(row.permisos)) {
          // Si ya es array, usarlo directamente
          permisos = row.permisos;
        }
      } catch (error) {
        // Si hay error parseando, dividir por comas como fallback
        permisos = row.permisos.toString().split(',').map((p: string) => p.trim()).filter((p: string) => p);
      }
    }

    const usuario: Usuario = {
      id: row.id,
      nombre: row.nombre,
      apellido: row.apellido,
      email: row.email,
      genero: row.genero,
      fecha_nacimiento: row.fecha_nacimiento,
      cedula: row.cedula,
      usuario: row.usuario,
      perfil: row.perfil,
      permisos: permisos,
      estado: row.estado,
      fecha_creacion: row.fecha_creacion
    };

    // No incluir la contraseña por seguridad
    return usuario;
  }

  private static mapRowToUsuarioWithPassword(row: RowDataPacket): Usuario {
    let permisos: string[] = [];
    
    // Parsear permisos si es un string JSON
    if (row.permisos) {
      try {
        if (typeof row.permisos === 'string') {
          // Si es string, intentar parsearlo como JSON
          permisos = JSON.parse(row.permisos);
        } else if (Array.isArray(row.permisos)) {
          // Si ya es array, usarlo directamente
          permisos = row.permisos;
        }
      } catch (error) {
        // Si hay error parseando, dividir por comas como fallback
        permisos = row.permisos.toString().split(',').map((p: string) => p.trim()).filter((p: string) => p);
      }
    }

    return {
      id: row.id,
      nombre: row.nombre,
      apellido: row.apellido,
      email: row.email,
      genero: row.genero,
      fecha_nacimiento: row.fecha_nacimiento,
      cedula: row.cedula,
      usuario: row.usuario,
      password: row.contraseña, // Incluir contraseña para verificación
      perfil: row.perfil,
      permisos: permisos,
      estado: row.estado,
      fecha_creacion: row.fecha_creacion
    };
  }
}
