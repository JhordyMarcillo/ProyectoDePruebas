import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { AuthPayload } from '../types';

// Extender el tipo Request para incluir user
declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  // Intentar obtener el token del header Authorization
  const authHeader = req.headers['authorization'];
  let token = authHeader && authHeader.split(' ')[1];
  
  // Si no está en el header, intentar obtenerlo del query parameter (para facturas)
  if (!token) {
    token = req.query.token as string;
  }

  if (!token) {
    res.status(401).json({
      success: false,
      message: 'Token de acceso requerido'
    });
    return;
  }

  jwt.verify(token, config.jwt.secret, (err: any, decoded: any) => {
    if (err) {
      res.status(403).json({
        success: false,
        message: 'Token inválido'
      });
      return;
    }

    req.user = decoded as AuthPayload;
    next();
  });
};

export const requirePermission = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
      return;
    }

    if (!roles.includes(req.user.perfil)) {
      res.status(403).json({
        success: false,
        message: 'No tienes permisos para acceder a este recurso'
      });
      return;
    }

    next();
  };
};

export const requireSpecificPermission = (permission: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
      return;
    }

    // Verificar si el usuario tiene el permiso específico
    if (!req.user.permisos.includes(permission)) {
      res.status(403).json({
        success: false,
        message: `No tienes permiso para ${permission}`
      });
      return;
    }

    next();
  };
};

// Middleware para administradores únicamente
export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Usuario no autenticado'
    });
    return;
  }

  if (req.user.perfil !== 'admin') {
    res.status(403).json({
      success: false,
      message: 'Acceso restringido a administradores'
    });
    return;
  }

  next();
};

// Middleware más flexible que verifica tanto rol como permisos específicos
export const requirePermissionOrRole = (permissions: string[], roles: string[] = []) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
      return;
    }

    // Verificar si tiene alguno de los roles permitidos
    const hasRole = roles.length === 0 || roles.includes(req.user.perfil);
    
    // Verificar si tiene alguno de los permisos específicos
    const hasPermission = permissions.some(permission => 
      req.user!.permisos.includes(permission)
    );

    if (!hasRole || !hasPermission) {
      res.status(403).json({
        success: false,
        message: 'No tienes permisos para acceder a este recurso'
      });
      return;
    }

    next();
  };
};

// Alias para compatibilidad
export const authorizePermissions = (permissions: string[]) => {
  return requirePermissionOrRole(permissions);
};
