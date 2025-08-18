import { executeQuery } from '../config/database';
import { Producto } from '../types';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export class ProductoModel {
  static async findAll(
    limit: number = 10,
    offset: number = 0,
    search?: string
  ): Promise<{ productos: Producto[]; total: number }> {
    let query = `
      SELECT p.id, p.nombre as nombre_producto, p.cantidad as cantidad_producto, 
             p.proveedor as proveedor_producto, p.precio as precio_producto, 
             p.precio_compra, p.marca as marca_producto,
             p.codigo as categoria_producto, p.estado, p.fecha_creacion,
             pr.nombre_empresa as proveedor_nombre
      FROM productos p
      LEFT JOIN proveedores pr ON p.proveedor = pr.id
    `;
    let countQuery = 'SELECT COUNT(*) as total FROM productos p';
    const params: any[] = [];

    if (search) {
      const searchCondition = ` WHERE (p.nombre LIKE ? OR p.marca LIKE ? OR p.codigo LIKE ? OR pr.nombre_empresa LIKE ?)`;
      query += searchCondition;
      countQuery += searchCondition;
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam, searchParam);
    }

    query += ' ORDER BY p.fecha_creacion DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [productos, totalResult] = await Promise.all([
      executeQuery<RowDataPacket[]>(query, params),
      executeQuery<RowDataPacket[]>(countQuery, search ? params.slice(0, 4) : [])
    ]);

    return {
      productos: productos.map(this.mapRowToProducto),
      total: totalResult[0]?.total || 0
    };
  }

  static async findById(id: number): Promise<Producto | null> {
    const query = `
      SELECT p.id, p.nombre as nombre_producto, p.cantidad as cantidad_producto, 
             p.proveedor as proveedor_producto, p.precio as precio_producto, 
             p.precio_compra, p.marca as marca_producto,
             p.codigo as categoria_producto, p.estado, p.fecha_creacion,
             pr.nombre_empresa as proveedor_nombre
      FROM productos p
      LEFT JOIN proveedores pr ON p.proveedor = pr.id
      WHERE p.id = ?
    `;
    const result = await executeQuery<RowDataPacket[]>(query, [id]);
    return result.length > 0 ? this.mapRowToProducto(result[0]!) : null;
  }

  static async findByName(nombre: string): Promise<Producto | null> {
    const query = `
      SELECT p.id, p.nombre as nombre_producto, p.cantidad as cantidad_producto, 
             p.proveedor as proveedor_producto, p.precio as precio_producto, 
             p.precio_compra, p.marca as marca_producto,
             p.codigo as categoria_producto, p.estado, p.fecha_creacion,
             pr.nombre_empresa as proveedor_nombre
      FROM productos p
      LEFT JOIN proveedores pr ON p.proveedor = pr.id
      WHERE p.nombre = ?
    `;
    const result = await executeQuery<RowDataPacket[]>(query, [nombre]);
    return result.length > 0 ? this.mapRowToProducto(result[0]!) : null;
  }

  static async create(producto: Omit<Producto, 'id' | 'fecha_creacion'>): Promise<number> {
    const query = `
      INSERT INTO productos (
        nombre, cantidad, proveedor, precio, precio_compra, marca,
        codigo, estado
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      producto.nombre_producto,
      producto.cantidad_producto,
      producto.proveedor_producto,
      producto.precio_producto,
      producto.precio_compra,
      producto.marca_producto,
      producto.categoria_producto,
      producto.estado
    ];

    const result = await executeQuery<ResultSetHeader>(query, params);
    return result.insertId;
  }

  static async update(id: number, producto: Partial<Producto>): Promise<boolean> {
    const fields = [];
    const params = [];

    if (producto.nombre_producto) {
      fields.push('nombre = ?');
      params.push(producto.nombre_producto);
    }
    if (producto.cantidad_producto !== undefined) {
      fields.push('cantidad = ?');
      params.push(producto.cantidad_producto);
    }
    if (producto.proveedor_producto) {
      fields.push('proveedor = ?');
      params.push(producto.proveedor_producto);
    }
    if (producto.precio_producto !== undefined) {
      fields.push('precio = ?');
      params.push(producto.precio_producto);
    }
    if (producto.precio_compra !== undefined) {
      fields.push('precio_compra = ?');
      params.push(producto.precio_compra);
    }
    if (producto.marca_producto) {
      fields.push('marca = ?');
      params.push(producto.marca_producto);
    }
    if (producto.categoria_producto) {
      fields.push('codigo = ?');
      params.push(producto.categoria_producto);
    }
    if (producto.estado) {
      fields.push('estado = ?');
      params.push(producto.estado);
    }

    if (fields.length === 0) return false;

    const query = `UPDATE productos SET ${fields.join(', ')} WHERE id = ?`;
    params.push(id);

    const result = await executeQuery<ResultSetHeader>(query, params);
    return result.affectedRows > 0;
  }

  static async delete(id: number): Promise<boolean> {
    const query = 'DELETE FROM productos WHERE id = ?';
    const result = await executeQuery<ResultSetHeader>(query, [id]);
    return result.affectedRows > 0;
  }

  private static mapRowToProducto(row: RowDataPacket): Producto {
    return {
      id: row.id,
      nombre_producto: row.nombre_producto,
      cantidad_producto: row.cantidad_producto,
      proveedor_producto: row.proveedor_producto,
      precio_producto: row.precio_producto,
      precio_compra: row.precio_compra,
      marca_producto: row.marca_producto,
      categoria_producto: row.categoria_producto,
      estado: row.estado,
      fecha_creacion: row.fecha_creacion,
      proveedor_nombre: row.proveedor_nombre
    };
  }
}
