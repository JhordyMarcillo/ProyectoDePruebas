import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types';

// Middleware para manejar errores de validación
export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {

};

// Wrapper para ejecutar validaciones secuencialmente

// Middleware para sanitizar parámetros de paginación
export const sanitizePagination = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = Math.min(parseInt(req.query.limit as string) || 10, 100);
  
  req.query.page = page.toString();
  req.query.limit = limit.toString();
  
  next();
};

// Middleware para logging de requests
export const logRequest = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
  });
  
  next();
};

// Validaciones para productos