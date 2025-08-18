import { executeQuery } from '../config/database';
import { Cliente } from '../types';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export class ClienteModel {
  static async findAll(
    limit: number = 10,
    offset: number = 0,
    search?: string
  ): Promise<{ clientes: Cliente[]; total: number }> {
    let query = `
      SELECT id, nombre, apellido, cedula, numero, email, fecha_nacimiento,
             genero, locacion, estado, fecha_creacion
      FROM clientes
    `;
    let countQuery = 'SELECT COUNT(*) as total FROM clientes';
    const params: any[] = [];

    if (search) {
      const searchCondition = ` WHERE (nombre LIKE ? OR apellido LIKE ? OR cedula LIKE ? OR email LIKE ?)`;
      query += searchCondition;
      countQuery += searchCondition;
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam, searchParam);
    }

    query += ' ORDER BY fecha_creacion DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [clientes, totalResult] = await Promise.all([
      executeQuery<RowDataPacket[]>(query, params),
      executeQuery<RowDataPacket[]>(countQuery, search ? params.slice(0, 4) : [])
    ]);

    return {
      clientes: clientes.map(this.mapRowToCliente),
      total: totalResult[0]?.total || 0
    };
  }

  static async findById(id: number): Promise<Cliente | null> {
    const query = `
      SELECT id, nombre, apellido, cedula, numero, email, fecha_nacimiento,
             genero, locacion, estado, fecha_creacion
      FROM clientes
      WHERE id = ?
    `;
    const result = await executeQuery<RowDataPacket[]>(query, [id]);
    return result.length > 0 ? this.mapRowToCliente(result[0]!) : null;
  }

  static async findByCedula(cedula: string): Promise<Cliente | null> {
    const query = `
      SELECT id, nombre, apellido, cedula, numero, email, fecha_nacimiento,
             genero, locacion, estado, fecha_creacion
      FROM clientes
      WHERE cedula = ?
    `;
    const result = await executeQuery<RowDataPacket[]>(query, [cedula]);
    return result.length > 0 ? this.mapRowToCliente(result[0]!) : null;
  }

  static async create(cliente: Omit<Cliente, 'id' | 'fecha_creacion'>): Promise<number> {
    const query = `
      INSERT INTO clientes (
        nombre, apellido, cedula, numero, email, fecha_nacimiento,
        genero, locacion, estado
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      cliente.nombre,
      cliente.apellido,
      cliente.cedula,
      cliente.numero,
      cliente.email || null,
      cliente.fecha_nacimiento || null,
      cliente.genero || null,
      cliente.locacion || null,
      cliente.estado || 'activo'
    ];

    const result = await executeQuery<ResultSetHeader>(query, params);
    return result.insertId;
  }

  static async update(id: number, cliente: Partial<Cliente>): Promise<boolean> {
    const fields = [];
    const params = [];

    if (cliente.nombre) {
      fields.push('nombre = ?');
      params.push(cliente.nombre);
    }
    if (cliente.apellido) {
      fields.push('apellido = ?');
      params.push(cliente.apellido);
    }
    if (cliente.cedula) {
      fields.push('cedula = ?');
      params.push(cliente.cedula);
    }
    if (cliente.numero) {
      fields.push('numero = ?');
      params.push(cliente.numero);
    }
    if (cliente.email) {
      fields.push('email = ?');
      params.push(cliente.email);
    }
    if (cliente.fecha_nacimiento) {
      fields.push('fecha_nacimiento = ?');
      params.push(cliente.fecha_nacimiento);
    }
    if (cliente.genero) {
      fields.push('genero = ?');
      params.push(cliente.genero);
    }
    if (cliente.locacion) {
      fields.push('locacion = ?');
      params.push(cliente.locacion);
    }
    if (cliente.estado) {
      fields.push('estado = ?');
      params.push(cliente.estado);
    }

    if (fields.length === 0) return false;

    const query = `UPDATE clientes SET ${fields.join(', ')} WHERE id = ?`;
    params.push(id);

    const result = await executeQuery<ResultSetHeader>(query, params);
    return result.affectedRows > 0;
  }

  static async delete(id: number): Promise<boolean> {
    const query = 'DELETE FROM clientes WHERE id = ?';
    const result = await executeQuery<ResultSetHeader>(query, [id]);
    return result.affectedRows > 0;
  }

  static async getActiveCount(): Promise<number> {
    const query = "SELECT COUNT(*) as total FROM clientes WHERE estado = 'activo'";
    const result = await executeQuery<RowDataPacket[]>(query);
    return result[0]?.total || 0;
  }

  private static mapRowToCliente(row: RowDataPacket): Cliente {
    return {
      id: row.id,
      nombre: row.nombre,
      apellido: row.apellido,
      cedula: row.cedula,
      numero: row.numero,
      email: row.email,
      fecha_nacimiento: row.fecha_nacimiento,
      genero: row.genero,
      locacion: row.locacion,
      estado: row.estado,
      fecha_creacion: row.fecha_creacion
    };
  }
}
