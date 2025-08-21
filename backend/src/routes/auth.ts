import { Router } from 'express';
import { body } from 'express-validator/check';
import { AuthController } from '../controllers/AuthController';
import { validate, handleValidationErrors } from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Validaciones para login
const loginValidation = [
  body('usuario')
    .notEmpty()
    .withMessage('El usuario es requerido')
    .isLength({ min: 3, max: 50 })
    .withMessage('El usuario debe tener entre 3 y 50 caracteres'),
  body('password')
    .notEmpty()
    .withMessage('La contraseña es requerida')
    .isLength({ min: 1 })
    .withMessage('La contraseña es requerida')
];

// Validaciones para registro
const registerValidation = [
  body('nombre')
    .notEmpty()
    .withMessage('El nombre es requerido')
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres'),
  body('apellido')
    .notEmpty()
    .withMessage('El apellido es requerido')
    .isLength({ min: 2, max: 50 })
    .withMessage('El apellido debe tener entre 2 y 50 caracteres'),
  body('email')
    .isEmail()
    .withMessage('Debe ser un email válido')
    .normalizeEmail(),
  body('cedula')
    .notEmpty()
    .withMessage('La cédula es requerida')
    .isLength({ min: 10, max: 10 })
    .withMessage('La cédula debe tener 10 dígitos'),
  body('usuario')
    .notEmpty()
    .withMessage('El usuario es requerido')
    .isLength({ min: 3, max: 50 })
    .withMessage('El usuario debe tener entre 3 y 50 caracteres'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('role')
    .isIn(['admin', 'ventas', 'bodega', 'supervisor'])
    .withMessage('El rol debe ser válido'),
  body('genero')
    .isIn(['M', 'F', 'Otro'])
    .withMessage('El género debe ser válido'),
  body('fecha_nacimiento')
    .isISO8601()
    .withMessage('La fecha de nacimiento debe ser válida'),
  body('estado')
    .optional()
    .isIn(['activo', 'inactivo'])
    .withMessage('El estado debe ser válido')
];

// Validaciones para actualizar perfil
const updateProfileValidation = [
  body('nombre')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres'),
  body('apellido')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('El apellido debe tener entre 2 y 50 caracteres'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Debe ser un email válido')
    .normalizeEmail(),
  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('genero')
    .optional()
    .isIn(['M', 'F', 'Otro'])
    .withMessage('El género debe ser válido'),
  body('fecha_nacimiento')
    .optional()
    .isISO8601()
    .withMessage('La fecha de nacimiento debe ser válida')
];

// Rutas públicas
router.post('/login', 
  validate(loginValidation), 
  handleValidationErrors, 
  AuthController.login
);

router.post('/register', 
  validate(registerValidation), 
  handleValidationErrors, 
  AuthController.register
);

// Rutas protegidas
router.get('/profile', 
  authenticateToken, 
  AuthController.getProfile
);

router.put('/profile', 
  authenticateToken,
  validate(updateProfileValidation), 
  handleValidationErrors, 
  AuthController.updateProfile
);

router.post('/logout', 
  authenticateToken, 
  AuthController.logout
);

export default router;
