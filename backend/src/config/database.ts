import mysql from 'mysql2/promise';
import { config } from './index';

// Pool de conexiones para mejor rendimiento
export const pool = mysql.createPool({
  host: config.database.host,
  port: config.database.port,
  user: config.database.user,
  password: config.database.password,
  database: config.database.database,
  charset: 'utf8mb4',
  timezone: '+00:00'
});

// Función para obtener conexión
export const getConnection = async () => {
  try {
    const connection = await pool.getConnection();
    return connection;
  } catch (error) {
    console.error('Error al conectar con la base de datos:', error);
    throw error;
  }
};

// Función para ejecutar queries
export const executeQuery = async <T = any>(
  query: string,
  params: any[] = []
): Promise<T> => {
  const connection = await getConnection();
  try {
    const [results] = await connection.execute(query, params);
    return results as T;
  } finally {
    connection.release();
  }
};

// Función para ejecutar transacciones
export const executeTransaction = async <T = any>(
  queries: Array<{ query: string; params: any[] }>
): Promise<T[]> => {
  const connection = await getConnection();
  try {
    await connection.beginTransaction();
    
    const results: T[] = [];
    for (const { query, params } of queries) {
      const [result] = await connection.execute(query, params);
      results.push(result as T);
    }
    
    await connection.commit();
    return results;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// Función para verificar conexión
export const testConnection = async (): Promise<boolean> => {
  try {
    const connection = await getConnection();
    await connection.ping();
    connection.release();
    return true;
  } catch (error) {
    console.error('Error de conexión a la base de datos:', error);
    return false;
  }
};

export default pool;