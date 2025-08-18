import { executeQuery } from '../config/database';
import { Venta } from '../types';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export class VentaModel {
  static async findAll(
    limit: number = 100,
    offset: number = 0,
    search?: string
  ): Promise<{ ventas: Venta[]; total: number }> {
    let query = `
      SELECT id, cedula_cliente, productos, servicios, iva, total_pagar,
             metodo, vendedor, estado, fecha_creacion
      FROM ventas
    `;
    let countQuery = 'SELECT COUNT(*) as total FROM ventas';
    const params: any[] = [];

    if (search) {
      const searchCondition = ` WHERE (cedula_cliente LIKE ? OR vendedor LIKE ? OR metodo LIKE ?)`;
      query += searchCondition;
      countQuery += searchCondition;
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam);
    }

    query += ' ORDER BY fecha_creacion DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [ventas, totalResult] = await Promise.all([
      executeQuery<RowDataPacket[]>(query, params),
      executeQuery<RowDataPacket[]>(countQuery, search ? params.slice(0, 3) : [])
    ]);

    return {
      ventas: ventas.map(this.mapRowToVenta),
      total: totalResult[0]?.total || 0
    };
  }

  static async findById(id: number): Promise<Venta | null> {
    const query = `
      SELECT id, cedula_cliente, productos, servicios, iva, total_pagar,
             metodo, vendedor, estado, fecha_creacion
      FROM ventas
      WHERE id = ?
    `;
    const result = await executeQuery<RowDataPacket[]>(query, [id]);
    return result.length > 0 ? this.mapRowToVenta(result[0]!) : null;
  }

  static async findByCliente(cedula_cliente: string): Promise<Venta[]> {
    const query = `
      SELECT id, cedula_cliente, productos, servicios, iva, total_pagar,
             metodo, vendedor, estado, fecha_creacion
      FROM ventas
      WHERE cedula_cliente = ?
      ORDER BY fecha_creacion DESC
    `;
    const result = await executeQuery<RowDataPacket[]>(query, [cedula_cliente]);
    return result.map(this.mapRowToVenta);
  }

  static async create(venta: Omit<Venta, 'id' | 'fecha_creacion'>): Promise<number> {
    const query = `
      INSERT INTO ventas (
        cedula_cliente, productos, servicios, iva, total_pagar,
        metodo, vendedor, estado
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      venta.cedula_cliente,
      JSON.stringify(venta.productos),
      JSON.stringify(venta.servicios),
      venta.iva,
      venta.total_pagar,
      venta.metodo,
      venta.vendedor,
      venta.estado
    ];

    const result = await executeQuery<ResultSetHeader>(query, params);
    return result.insertId;
  }

  static async update(id: number, venta: Partial<Venta>): Promise<boolean> {
    const fields = [];
    const params = [];

    if (venta.cedula_cliente) {
      fields.push('cedula_cliente = ?');
      params.push(venta.cedula_cliente);
    }
    if (venta.productos) {
      fields.push('productos = ?');
      params.push(JSON.stringify(venta.productos));
    }
    if (venta.servicios) {
      fields.push('servicios = ?');
      params.push(JSON.stringify(venta.servicios));
    }
    if (venta.iva !== undefined) {
      fields.push('iva = ?');
      params.push(venta.iva);
    }
    if (venta.total_pagar !== undefined) {
      fields.push('total_pagar = ?');
      params.push(venta.total_pagar);
    }
    if (venta.metodo) {
      fields.push('metodo = ?');
      params.push(venta.metodo);
    }
    if (venta.vendedor) {
      fields.push('vendedor = ?');
      params.push(venta.vendedor);
    }
    if (venta.estado) {
      fields.push('estado = ?');
      params.push(venta.estado);
    }

    if (fields.length === 0) return false;

    const query = `UPDATE ventas SET ${fields.join(', ')} WHERE id = ?`;
    params.push(id);

    const result = await executeQuery<ResultSetHeader>(query, params);
    return result.affectedRows > 0;
  }

  static async delete(id: number): Promise<boolean> {
    const query = 'DELETE FROM ventas WHERE id = ?';
    const result = await executeQuery<ResultSetHeader>(query, [id]);
    return result.affectedRows > 0;
  }

  static async getVentasCount(): Promise<number> {
    const query = "SELECT COUNT(*) as total FROM ventas WHERE estado = 'activo'";
    const result = await executeQuery<RowDataPacket[]>(query);
    return result[0]?.total || 0;
  }

  static async getTotalVentas(): Promise<number> {
    const query = "SELECT SUM(total_pagar) as total FROM ventas WHERE estado = 'activo'";
    const result = await executeQuery<RowDataPacket[]>(query);
    return result[0]?.total || 0;
  }

  static async getVentasByDateRange(
    fechaInicio: string, 
    fechaFin: string
  ): Promise<Venta[]> {
    const query = `
      SELECT id, cedula_cliente, productos, servicios, iva, total_pagar,
             metodo, vendedor, estado, fecha_creacion
      FROM ventas
      WHERE fecha_creacion BETWEEN ? AND ?
        AND estado = 'activo'
      ORDER BY fecha_creacion DESC
    `;
    const result = await executeQuery<RowDataPacket[]>(query, [fechaInicio, fechaFin]);
    return result.map(this.mapRowToVenta);
  }

  private static mapRowToVenta(row: RowDataPacket): Venta {
    return {
      id: row.id,
      cedula_cliente: row.cedula_cliente,
      productos: typeof row.productos === 'string' ? JSON.parse(row.productos) : row.productos,
      servicios: typeof row.servicios === 'string' ? JSON.parse(row.servicios) : row.servicios,
      iva: row.iva,
      total_pagar: row.total_pagar,
      metodo: row.metodo,
      vendedor: row.vendedor,
      estado: row.estado,
      fecha_creacion: row.fecha_creacion
    };
  }
}
