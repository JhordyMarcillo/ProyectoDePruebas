import { executeQuery } from '../config/database';
import { RowDataPacket } from 'mysql2';

export interface ReporteVenta {
  id: number;
  fecha: string;
  cliente: string;
  cedula_cliente: string;
  vendedor: string;
  total: number;
  metodo: string;
  productos_count: number;
  servicios_count: number;
}

export interface ReporteProducto {
  id: number;
  nombre: string;
  cantidad: number;
  cantidad_vendida: number;
  precio: number;
  precio_compra: number;
  ganancia: number;
  estado: string;
}

export interface ReporteServicio {
  id: number;
  nombre: string;
  veces_vendido: number;
  total_ganancia: number;
  precio_promedio: number;
  estado: string;
}

export interface ReporteCliente {
  id: number;
  nombre: string;
  apellido: string;
  cedula: string;
  total_compras: number;
  total_gastado: number;
  ultima_compra: string;
  estado: string;
}

export interface EstadisticasGenerales {
  ventas_totales: number;
  ventas_hoy: number;
  ventas_mes: number;
  clientes_activos: number;
  productos_activos: number;
  servicios_activos: number;
  proveedores_activos: number;
  stock_bajo: number;
  ganancias_mes: number;
}

export class ReporteModel {
  static async getVentasReport(
    fechaInicio?: string,
    fechaFin?: string,
    limit: number = 50
  ): Promise<ReporteVenta[]> {
    let query = `
      SELECT 
        v.id,
        DATE_FORMAT(v.fecha_creacion, '%Y-%m-%d %H:%i:%s') as fecha,
        CONCAT(c.nombre, ' ', c.apellido) as cliente,
        v.cedula_cliente,
        v.vendedor,
        v.total_pagar as total,
        v.metodo,
        COALESCE(JSON_LENGTH(v.productos), 0) as productos_count,
        COALESCE(JSON_LENGTH(v.servicios), 0) as servicios_count
      FROM ventas v
      LEFT JOIN clientes c ON v.cedula_cliente = c.cedula
      WHERE v.estado = 'activo'
    `;

    const params: any[] = [];

    if (fechaInicio && fechaFin) {
      query += ' AND DATE(v.fecha_creacion) BETWEEN ? AND ?';
      params.push(fechaInicio, fechaFin);
    }

    query += ' ORDER BY v.fecha_creacion DESC LIMIT ?';
    params.push(limit);

    const result = await executeQuery<RowDataPacket[]>(query, params);
    return result.map(row => ({
      id: row.id,
      fecha: row.fecha,
      cliente: row.cliente || 'Cliente no encontrado',
      cedula_cliente: row.cedula_cliente,
      vendedor: row.vendedor,
      total: parseFloat(row.total),
      metodo: row.metodo,
      productos_count: row.productos_count,
      servicios_count: row.servicios_count
    }));
  }

  static async getProductosReport(): Promise<ReporteProducto[]> {
    const query = `
      SELECT 
        p.id,
        p.nombre,
        p.cantidad,
        COALESCE(pv.cantidad_vendida, 0) as cantidad_vendida,
        p.precio,
        p.precio_compra,
        (p.precio - p.precio_compra) * COALESCE(pv.cantidad_vendida, 0) as ganancia,
        p.estado
      FROM productos p
      LEFT JOIN (
        SELECT 
          JSON_UNQUOTE(JSON_EXTRACT(productos_item.value, '$.id')) as producto_id,
          SUM(CAST(JSON_UNQUOTE(JSON_EXTRACT(productos_item.value, '$.cantidad')) AS UNSIGNED)) as cantidad_vendida
        FROM ventas v
        CROSS JOIN JSON_TABLE(
          CASE WHEN JSON_VALID(v.productos) THEN v.productos ELSE '[]' END,
          '$[*]' COLUMNS (value JSON PATH '$')
        ) as productos_item
        WHERE v.estado = 'activo'
        GROUP BY JSON_UNQUOTE(JSON_EXTRACT(productos_item.value, '$.id'))
      ) pv ON p.id = CAST(pv.producto_id AS UNSIGNED)
      ORDER BY cantidad_vendida DESC, p.nombre
    `;

    const result = await executeQuery<RowDataPacket[]>(query);
    return result.map(row => ({
      id: row.id,
      nombre: row.nombre,
      cantidad: row.cantidad,
      cantidad_vendida: row.cantidad_vendida,
      precio: parseFloat(row.precio),
      precio_compra: parseFloat(row.precio_compra),
      ganancia: parseFloat(row.ganancia),
      estado: row.estado
    }));
  }

  static async getServiciosReport(): Promise<ReporteServicio[]> {
    const query = `
      SELECT 
        s.id,
        s.nombre,
        COALESCE(sv.veces_vendido, 0) as veces_vendido,
        COALESCE(sv.total_ganancia, 0) as total_ganancia,
        COALESCE(sv.precio_promedio, s.costo_servicio) as precio_promedio,
        s.estado
      FROM servicios s
      LEFT JOIN (
        SELECT 
          JSON_UNQUOTE(JSON_EXTRACT(servicios_item.value, '$.id')) as servicio_id,
          SUM(CAST(JSON_UNQUOTE(JSON_EXTRACT(servicios_item.value, '$.cantidad')) AS UNSIGNED)) as veces_vendido,
          SUM(CAST(JSON_UNQUOTE(JSON_EXTRACT(servicios_item.value, '$.costo')) AS DECIMAL(10,2)) * 
              CAST(JSON_UNQUOTE(JSON_EXTRACT(servicios_item.value, '$.cantidad')) AS UNSIGNED)) as total_ganancia,
          AVG(CAST(JSON_UNQUOTE(JSON_EXTRACT(servicios_item.value, '$.costo')) AS DECIMAL(10,2))) as precio_promedio
        FROM ventas v
        CROSS JOIN JSON_TABLE(
          CASE WHEN JSON_VALID(v.servicios) THEN v.servicios ELSE '[]' END,
          '$[*]' COLUMNS (value JSON PATH '$')
        ) as servicios_item
        WHERE v.estado = 'activo'
        GROUP BY JSON_UNQUOTE(JSON_EXTRACT(servicios_item.value, '$.id'))
      ) sv ON s.id = CAST(sv.servicio_id AS UNSIGNED)
      ORDER BY veces_vendido DESC, s.nombre
    `;

    const result = await executeQuery<RowDataPacket[]>(query);
    return result.map(row => ({
      id: row.id,
      nombre: row.nombre,
      veces_vendido: row.veces_vendido,
      total_ganancia: parseFloat(row.total_ganancia),
      precio_promedio: parseFloat(row.precio_promedio),
      estado: row.estado
    }));
  }

  static async getClientesReport(): Promise<ReporteCliente[]> {
    const query = `
      SELECT 
        c.id,
        c.nombre,
        c.apellido,
        c.cedula,
        COALESCE(cv.total_compras, 0) as total_compras,
        COALESCE(cv.total_gastado, 0) as total_gastado,
        cv.ultima_compra,
        c.estado
      FROM clientes c
      LEFT JOIN (
        SELECT 
          cedula_cliente,
          COUNT(*) as total_compras,
          SUM(total_pagar) as total_gastado,
          MAX(DATE_FORMAT(fecha_creacion, '%Y-%m-%d %H:%i:%s')) as ultima_compra
        FROM ventas 
        WHERE estado = 'activo'
        GROUP BY cedula_cliente
      ) cv ON c.cedula = cv.cedula_cliente
      ORDER BY total_gastado DESC, total_compras DESC
    `;

    const result = await executeQuery<RowDataPacket[]>(query);
    return result.map(row => ({
      id: row.id,
      nombre: row.nombre,
      apellido: row.apellido,
      cedula: row.cedula,
      total_compras: row.total_compras,
      total_gastado: parseFloat(row.total_gastado || 0),
      ultima_compra: row.ultima_compra || 'Nunca',
      estado: row.estado
    }));
  }

  static async getEstadisticasGenerales(): Promise<EstadisticasGenerales> {
    const hoy = new Date().toISOString().split('T')[0];
    const primerDiaMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
    const ultimoDiaMes = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0];

    const [
      ventasTotales,
      ventasHoy, 
      ventasMes,
      clientesActivos,
      productosActivos,
      serviciosActivos,
      proveedoresActivos,
      stockBajo,
      gananciasMes
    ] = await Promise.all([
      executeQuery<RowDataPacket[]>("SELECT COUNT(*) as total FROM ventas WHERE estado = 'activo'"),
      executeQuery<RowDataPacket[]>("SELECT COUNT(*) as total FROM ventas WHERE estado = 'activo' AND DATE(fecha_creacion) = ?", [hoy]),
      executeQuery<RowDataPacket[]>("SELECT COUNT(*) as total FROM ventas WHERE estado = 'activo' AND DATE(fecha_creacion) BETWEEN ? AND ?", [primerDiaMes, ultimoDiaMes]),
      executeQuery<RowDataPacket[]>("SELECT COUNT(*) as total FROM clientes WHERE estado = 'activo'"),
      executeQuery<RowDataPacket[]>("SELECT COUNT(*) as total FROM productos WHERE estado = 'activo'"),
      executeQuery<RowDataPacket[]>("SELECT COUNT(*) as total FROM servicios WHERE estado = 'activo'"),
      executeQuery<RowDataPacket[]>("SELECT COUNT(*) as total FROM proveedores WHERE estado = 'activo'"),
      executeQuery<RowDataPacket[]>("SELECT COUNT(*) as total FROM productos WHERE cantidad < 10 AND estado = 'activo'"),
      executeQuery<RowDataPacket[]>("SELECT COALESCE(SUM(total_pagar), 0) as total FROM ventas WHERE estado = 'activo' AND DATE(fecha_creacion) BETWEEN ? AND ?", [primerDiaMes, ultimoDiaMes])
    ]);

    return {
      ventas_totales: ventasTotales[0]?.total || 0,
      ventas_hoy: ventasHoy[0]?.total || 0,
      ventas_mes: ventasMes[0]?.total || 0,
      clientes_activos: clientesActivos[0]?.total || 0,
      productos_activos: productosActivos[0]?.total || 0,
      servicios_activos: serviciosActivos[0]?.total || 0,
      proveedores_activos: proveedoresActivos[0]?.total || 0,
      stock_bajo: stockBajo[0]?.total || 0,
      ganancias_mes: parseFloat(gananciasMes[0]?.total || 0)
    };
  }

  static async getVentasPorFecha(
    fechaInicio: string,
    fechaFin: string
  ): Promise<{ fecha: string; total_ventas: number; cantidad_ventas: number }[]> {
    const query = `
      SELECT 
        DATE(fecha_creacion) as fecha,
        SUM(total_pagar) as total_ventas,
        COUNT(*) as cantidad_ventas
      FROM ventas 
      WHERE estado = 'activo'
        AND DATE(fecha_creacion) BETWEEN ? AND ?
      GROUP BY DATE(fecha_creacion)
      ORDER BY fecha
    `;

    const result = await executeQuery<RowDataPacket[]>(query, [fechaInicio, fechaFin]);
    return result.map(row => ({
      fecha: row.fecha,
      total_ventas: parseFloat(row.total_ventas),
      cantidad_ventas: row.cantidad_ventas
    }));
  }
}
