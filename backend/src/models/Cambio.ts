import { executeQuery } from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface Cambio {
  id: number;
  id_cambiado: number;
  usuario_id: string;
  descripcion: string;
  tipo_cambio: 'Agregar' | 'Actualizar' | 'Activo' | 'Inactivo';
  fecha: Date;
  tabla_afectada: string;
}

export class CambioModel {
  static async findAll(
    limit: number = 10,
    offset: number = 0,
    search?: string,
    tabla?: string
  ): Promise<{ cambios: Cambio[]; total: number }> {
    let query = `
      SELECT id, id_cambiado, usuario_id, descripcion, tipo_cambio, fecha, tabla_afectada
      FROM cambios
    `;
    let countQuery = 'SELECT COUNT(*) as total FROM cambios';
    const params: any[] = [];
    const conditions: string[] = [];

    if (search) {
      conditions.push('(usuario_id LIKE ? OR descripcion LIKE ?)');
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam);
    }

    if (tabla) {
      conditions.push('tabla_afectada = ?');
      params.push(tabla);
    }

    if (conditions.length > 0) {
      const whereClause = ` WHERE ${conditions.join(' AND ')}`;
      query += whereClause;
      countQuery += whereClause;
    }

    query += ' ORDER BY fecha DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [cambios, totalResult] = await Promise.all([
      executeQuery<RowDataPacket[]>(query, params),
      executeQuery<RowDataPacket[]>(countQuery, search || tabla ? params.slice(0, -2) : [])
    ]);

    return {
      cambios: cambios.map(this.mapRowToCambio),
      total: totalResult[0]?.total || 0
    };
  }

  static async findAllWithoutPagination(): Promise<Cambio[]> {
    const query = `
      SELECT id, id_cambiado, usuario_id, descripcion, tipo_cambio, fecha, tabla_afectada
      FROM cambios
      ORDER BY fecha DESC
    `;
    const result = await executeQuery<RowDataPacket[]>(query, []);
    return result.map(this.mapRowToCambio);
  }

  static async findById(id: number): Promise<Cambio | null> {
    const query = `
      SELECT id, id_cambiado, usuario_id, descripcion, tipo_cambio, fecha, tabla_afectada
      FROM cambios
      WHERE id = ?
    `;
    const result = await executeQuery<RowDataPacket[]>(query, [id]);
    return result.length > 0 ? this.mapRowToCambio(result[0]!) : null;
  }

  static async create(cambio: Omit<Cambio, 'id' | 'fecha'>): Promise<number> {
    const query = `
      INSERT INTO cambios (id_cambiado, usuario_id, descripcion, tipo_cambio, tabla_afectada)
      VALUES (?, ?, ?, ?, ?)
    `;
    const params = [
      cambio.id_cambiado,
      cambio.usuario_id,
      cambio.descripcion,
      cambio.tipo_cambio,
      cambio.tabla_afectada
    ];

    const result = await executeQuery<ResultSetHeader>(query, params);
    return result.insertId;
  }

  static async findByTabla(tabla: string): Promise<Cambio[]> {
    const query = `
      SELECT id, id_cambiado, usuario_id, descripcion, tipo_cambio, fecha, tabla_afectada
      FROM cambios
      WHERE tabla_afectada = ?
      ORDER BY fecha DESC
    `;
    const result = await executeQuery<RowDataPacket[]>(query, [tabla]);
    return result.map(this.mapRowToCambio);
  }

  static async findByUsuario(usuario_id: string, limit: number = 10): Promise<Cambio[]> {
    const query = `
      SELECT id, id_cambiado, usuario_id, descripcion, tipo_cambio, fecha, tabla_afectada
      FROM cambios
      WHERE usuario_id = ?
      ORDER BY fecha DESC
      LIMIT ?
    `;
    const result = await executeQuery<RowDataPacket[]>(query, [usuario_id, limit]);
    return result.map(this.mapRowToCambio);
  }

  static async findByDateRange(fechaInicio: string, fechaFin: string): Promise<Cambio[]> {
    const query = `
      SELECT id, id_cambiado, usuario_id, descripcion, tipo_cambio, fecha, tabla_afectada
      FROM cambios
      WHERE DATE(fecha) BETWEEN ? AND ?
      ORDER BY fecha DESC
    `;
    const result = await executeQuery<RowDataPacket[]>(query, [fechaInicio, fechaFin]);
    return result.map(this.mapRowToCambio);
  }

  static async getStats(): Promise<{
    total_cambios: number;
    cambios_hoy: number;
    cambios_semana: number;
    por_tipo: { [key: string]: number };
    por_tabla: { [key: string]: number };
  }> {
    const hoy = new Date().toISOString().split('T')[0];
    const hace7Dias = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const [totalResult, hoyResult, semanaResult, tipoResult, tablaResult] = await Promise.all([
      executeQuery<RowDataPacket[]>('SELECT COUNT(*) as total FROM cambios'),
      executeQuery<RowDataPacket[]>('SELECT COUNT(*) as total FROM cambios WHERE DATE(fecha) = ?', [hoy]),
      executeQuery<RowDataPacket[]>('SELECT COUNT(*) as total FROM cambios WHERE DATE(fecha) >= ?', [hace7Dias]),
      executeQuery<RowDataPacket[]>('SELECT tipo_cambio, COUNT(*) as total FROM cambios GROUP BY tipo_cambio'),
      executeQuery<RowDataPacket[]>('SELECT tabla_afectada, COUNT(*) as total FROM cambios GROUP BY tabla_afectada')
    ]);

    const por_tipo: { [key: string]: number } = {};
    tipoResult.forEach(row => {
      por_tipo[row.tipo_cambio] = row.total;
    });

    const por_tabla: { [key: string]: number } = {};
    tablaResult.forEach(row => {
      por_tabla[row.tabla_afectada] = row.total;
    });

    return {
      total_cambios: totalResult[0]?.total || 0,
      cambios_hoy: hoyResult[0]?.total || 0,
      cambios_semana: semanaResult[0]?.total || 0,
      por_tipo,
      por_tabla
    };
  }

  static async getEstadisticas(): Promise<any> {
    const queries = [
      // Cambios por tabla
      `SELECT tabla_afectada, COUNT(*) as total 
       FROM cambios 
       GROUP BY tabla_afectada 
       ORDER BY total DESC`,
      
      // Cambios por tipo
      `SELECT tipo_cambio, COUNT(*) as total 
       FROM cambios 
       GROUP BY tipo_cambio 
       ORDER BY total DESC`,
       
      // Cambios por día (últimos 7 días)
      `SELECT DATE(fecha) as fecha, COUNT(*) as total 
       FROM cambios 
       WHERE fecha >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
       GROUP BY DATE(fecha) 
       ORDER BY fecha DESC`,
       
      // Total de cambios
      `SELECT COUNT(*) as total_cambios FROM cambios`,
      
      // Cambios de hoy
      `SELECT COUNT(*) as cambios_hoy FROM cambios WHERE DATE(fecha) = CURDATE()`
    ];

    const [
      cambiosPorTabla,
      cambiosPorTipo,
      cambiosPorDia,
      totalCambios,
      cambiosHoy
    ] = await Promise.all(queries.map(query => executeQuery<RowDataPacket[]>(query)));

    return {
      cambiosPorTabla,
      cambiosPorTipo,
      cambiosPorDia,
      totalCambios: (totalCambios && totalCambios[0]) ? totalCambios[0].total_cambios : 0,
      cambiosHoy: (cambiosHoy && cambiosHoy[0]) ? cambiosHoy[0].cambios_hoy : 0
    };
  }

  // Función auxiliar para registrar cambios desde otros controladores
  static async registrarCambio(
    usuario_id: string,
    descripcion: string,
    tipo_cambio: 'Agregar' | 'Actualizar' | 'Activo' | 'Inactivo',
    tabla_afectada: string,
    id_cambiado: number = 0
  ): Promise<void> {
    try {
      await this.create({
        id_cambiado,
        usuario_id,
        descripcion,
        tipo_cambio,
        tabla_afectada
      });
    } catch (error) {
      //('Error al registrar cambio:', error);
      // No fallar si no se puede registrar el cambio
    }
  }

  private static mapRowToCambio(row: RowDataPacket): Cambio {
    return {
      id: row.id,
      id_cambiado: row.id_cambiado,
      usuario_id: row.usuario_id,
      descripcion: row.descripcion,
      tipo_cambio: row.tipo_cambio,
      fecha: row.fecha,
      tabla_afectada: row.tabla_afectada
    };
  }
}
