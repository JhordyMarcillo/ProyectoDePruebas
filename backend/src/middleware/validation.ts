import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { ApiResponse } from '../types';
import { body } from 'express-validator';

// Middleware para manejar errores de validación
export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(err => err.msg);
    
    const response: ApiResponse = {
      success: false,
      message: 'Datos de entrada inválidos',
      error: errorMessages.join(', ')
    };
    
    res.status(400).json(response);
    return;
  }
  
  next();
};

// Wrapper para ejecutar validaciones secuencialmente
export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await Promise.all(validations.map(validation => validation.run(req)));
    next();
  };
};

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
export const validateProducto = [
  body('nombre')
    .notEmpty()
    .withMessage('El nombre es requerido')
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
  
  body('descripcion')
    .optional()
    .isLength({ max: 500 })
    .withMessage('La descripción no puede exceder 500 caracteres'),
  
  body('precio')
    .isFloat({ min: 0 })
    .withMessage('El precio debe ser un número mayor o igual a 0'),
  
  body('stock')
    .isInt({ min: 0 })
    .withMessage('El stock debe ser un número entero mayor o igual a 0'),
  
  body('categoria')
    .notEmpty()
    .withMessage('La categoría es requerida')
    .isLength({ max: 50 })
    .withMessage('La categoría no puede exceder 50 caracteres'),
  
  body('codigo_barras')
    .optional()
    .isLength({ max: 50 })
    .withMessage('El código de barras no puede exceder 50 caracteres'),
  
  body('proveedor_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('El ID del proveedor debe ser un número entero positivo'),
  
  handleValidationErrors
];

export const validateUpdateProducto = [
  body('nombre')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
  
  body('descripcion')
    .optional()
    .isLength({ max: 500 })
    .withMessage('La descripción no puede exceder 500 caracteres'),
  
  body('precio')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El precio debe ser un número mayor o igual a 0'),
  
  body('stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('El stock debe ser un número entero mayor o igual a 0'),
  
  body('categoria')
    .optional()
    .isLength({ max: 50 })
    .withMessage('La categoría no puede exceder 50 caracteres'),
  
  body('codigo_barras')
    .optional()
    .isLength({ max: 50 })
    .withMessage('El código de barras no puede exceder 50 caracteres'),
  
  body('proveedor_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('El ID del proveedor debe ser un número entero positivo'),
  
  body('activo')
    .optional()
    .isBoolean()
    .withMessage('El campo activo debe ser un booleano'),
  
  handleValidationErrors
];
