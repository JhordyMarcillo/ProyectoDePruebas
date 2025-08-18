import { executeQuery } from '../config/database';
import { Proveedor } from '../types';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export class ProveedorModel {
  static async findAll(
    limit: number = 10,
    offset: number = 0,
    search?: string
  ): Promise<{ proveedores: Proveedor[]; total: number }> {
    let query = `
      SELECT id, nombre_empresa, email, numero, web, estado, fecha_creacion
      FROM proveedores
    `;
    let countQuery = 'SELECT COUNT(*) as total FROM proveedores';
    const params: any[] = [];

    if (search) {
      const searchCondition = ` WHERE (nombre_empresa LIKE ? OR email LIKE ? OR numero LIKE ?)`;
      query += searchCondition;
      countQuery += searchCondition;
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam);
    }

    query += ' ORDER BY fecha_creacion DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [proveedores, totalResult] = await Promise.all([
      executeQuery<RowDataPacket[]>(query, params),
      executeQuery<RowDataPacket[]>(countQuery, search ? params.slice(0, 3) : [])
    ]);

    return {
      proveedores: proveedores.map(this.mapRowToProveedor),
      total: totalResult[0]?.total || 0
    };
  }

  static async findById(id: number): Promise<Proveedor | null> {
    const query = `
      SELECT id, nombre_empresa, email, numero, web, estado, fecha_creacion
      FROM proveedores
      WHERE id = ?
    `;
    const result = await executeQuery<RowDataPacket[]>(query, [id]);
    return result.length > 0 ? this.mapRowToProveedor(result[0]!) : null;
  }

  static async create(proveedor: Omit<Proveedor, 'id' | 'fecha_creacion'>): Promise<number> {
    const query = `
      INSERT INTO proveedores (
        nombre_empresa, email, numero, web, estado
      ) VALUES (?, ?, ?, ?, ?)
    `;
    const params = [
      proveedor.nombre_empresa,
      proveedor.email,
      proveedor.numero,
      proveedor.web,
      proveedor.estado
    ];

    const result = await executeQuery<ResultSetHeader>(query, params);
    return result.insertId;
  }

  static async update(id: number, proveedor: Partial<Proveedor>): Promise<boolean> {
    const fields = [];
    const params = [];

    if (proveedor.nombre_empresa) {
      fields.push('nombre_empresa = ?');
      params.push(proveedor.nombre_empresa);
    }
    if (proveedor.email) {
      fields.push('email = ?');
      params.push(proveedor.email);
    }
    if (proveedor.numero) {
      fields.push('numero = ?');
      params.push(proveedor.numero);
    }
    if (proveedor.web) {
      fields.push('web = ?');
      params.push(proveedor.web);
    }
    if (proveedor.estado) {
      fields.push('estado = ?');
      params.push(proveedor.estado);
    }

    if (fields.length === 0) return false;

    const query = `UPDATE proveedores SET ${fields.join(', ')} WHERE id = ?`;
    params.push(id);

    const result = await executeQuery<ResultSetHeader>(query, params);
    return result.affectedRows > 0;
  }

  static async delete(id: number): Promise<boolean> {
    const query = 'DELETE FROM proveedores WHERE id = ?';
    const result = await executeQuery<ResultSetHeader>(query, [id]);
    return result.affectedRows > 0;
  }

  static async getActiveCount(): Promise<number> {
    const query = "SELECT COUNT(*) as total FROM proveedores WHERE estado = 'activo'";
    const result = await executeQuery<RowDataPacket[]>(query);
    return result[0]?.total || 0;
  }

  private static mapRowToProveedor(row: RowDataPacket): Proveedor {
    return {
      id: row.id,
      nombre_empresa: row.nombre_empresa,
      email: row.email,
      numero: row.numero,
      web: row.web,
      estado: row.estado,
      fecha_creacion: row.fecha_creacion
    };
  }
}
