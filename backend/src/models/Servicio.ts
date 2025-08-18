import { executeQuery } from '../config/database';
import { Servicio } from '../types';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export class ServicioModel {
  static async findAll(
    limit: number = 10,
    offset: number = 0,
    search?: string
  ): Promise<{ servicios: Servicio[]; total: number }> {
    let query = `
      SELECT id, nombre, descripcion, productos, coste_total, estado,
             fecha_creacion, costo_servicio
      FROM servicios
    `;
    let countQuery = 'SELECT COUNT(*) as total FROM servicios';
    const params: any[] = [];

    if (search) {
      const searchCondition = ` WHERE (nombre LIKE ? OR descripcion LIKE ?)`;
      query += searchCondition;
      countQuery += searchCondition;
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam);
    }

    query += ' ORDER BY fecha_creacion DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [servicios, totalResult] = await Promise.all([
      executeQuery<RowDataPacket[]>(query, params),
      executeQuery<RowDataPacket[]>(countQuery, search ? params.slice(0, 2) : [])
    ]);

    return {
      servicios: servicios.map(this.mapRowToServicio),
      total: totalResult[0]?.total || 0
    };
  }

  static async findById(id: number): Promise<Servicio | null> {
    const query = `
      SELECT id, nombre, descripcion, productos, coste_total, estado,
             fecha_creacion, costo_servicio
      FROM servicios
      WHERE id = ?
    `;
    const result = await executeQuery<RowDataPacket[]>(query, [id]);
    return result.length > 0 ? this.mapRowToServicio(result[0]!) : null;
  }

  static async create(servicio: Omit<Servicio, 'id' | 'fecha_creacion'>): Promise<number> {
    const query = `
      INSERT INTO servicios (
        nombre, descripcion, productos, coste_total, estado, costo_servicio
      ) VALUES (?, ?, ?, ?, ?, ?)
    `;
    const params = [
      servicio.nombre,
      servicio.descripcion,
      JSON.stringify(servicio.productos),
      servicio.coste_total,
      servicio.estado,
      servicio.costo_servicio
    ];

    const result = await executeQuery<ResultSetHeader>(query, params);
    return result.insertId;
  }

  static async findActivos(): Promise<Servicio[]> {
    const query = `
      SELECT id, nombre, descripcion, productos, coste_total, estado,
             fecha_creacion, costo_servicio
      FROM servicios
      WHERE estado = 'activo'
      ORDER BY nombre ASC
    `;
    const result = await executeQuery<RowDataPacket[]>(query, []);
    return result.map(this.mapRowToServicio);
  }

  static async update(id: number, servicio: Partial<Servicio>): Promise<boolean> {
    const fields = [];
    const params = [];

    if (servicio.nombre) {
      fields.push('nombre = ?');
      params.push(servicio.nombre);
    }
    if (servicio.descripcion) {
      fields.push('descripcion = ?');
      params.push(servicio.descripcion);
    }
    if (servicio.productos) {
      fields.push('productos = ?');
      params.push(JSON.stringify(servicio.productos));
    }
    if (servicio.coste_total !== undefined) {
      fields.push('coste_total = ?');
      params.push(servicio.coste_total);
    }
    if (servicio.costo_servicio !== undefined) {
      fields.push('costo_servicio = ?');
      params.push(servicio.costo_servicio);
    }
    if (servicio.estado) {
      fields.push('estado = ?');
      params.push(servicio.estado);
    }

    if (fields.length === 0) return false;

    const query = `UPDATE servicios SET ${fields.join(', ')} WHERE id = ?`;
    params.push(id);

    const result = await executeQuery<ResultSetHeader>(query, params);
    return result.affectedRows > 0;
  }

  static async delete(id: number): Promise<boolean> {
    const query = 'DELETE FROM servicios WHERE id = ?';
    const result = await executeQuery<ResultSetHeader>(query, [id]);
    return result.affectedRows > 0;
  }

  static async getActiveCount(): Promise<number> {
    const query = "SELECT COUNT(*) as total FROM servicios WHERE estado = 'activo'";
    const result = await executeQuery<RowDataPacket[]>(query);
    return result[0]?.total || 0;
  }

  private static mapRowToServicio(row: RowDataPacket): Servicio {
    return {
      id: row.id,
      nombre: row.nombre,
      descripcion: row.descripcion,
      productos: typeof row.productos === 'string' ? JSON.parse(row.productos) : row.productos,
      coste_total: row.coste_total,
      estado: row.estado,
      fecha_creacion: row.fecha_creacion,
      costo_servicio: row.costo_servicio
    };
  }
}
