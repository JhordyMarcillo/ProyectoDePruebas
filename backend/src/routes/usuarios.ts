import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { UsuarioController } from '../controllers/UsuarioController';
import { authenticateToken } from '../middleware/auth';
import { handleValidationErrors } from '../middleware/validation';

const router = Router();

// Validaciones
const validateCreateUsuario = [
  body('nombre')
    .notEmpty()
    .withMessage('El nombre es obligatorio')
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres'),
  body('apellido')
    .notEmpty()
    .withMessage('El apellido es obligatorio')
    .isLength({ min: 2, max: 50 })
    .withMessage('El apellido debe tener entre 2 y 50 caracteres'),
  body('email')
    .isEmail()
    .withMessage('Debe ser un email válido')
    .normalizeEmail(),
  body('genero')
    .isIn(['M', 'F'])
    .withMessage('El género debe ser M o F'),
  body('fecha_nacimiento')
    .isISO8601()
    .withMessage('La fecha de nacimiento debe ser válida'),
  body('cedula')
    .notEmpty()
    .withMessage('La cédula es obligatoria')
    .isLength({ min: 7, max: 20 })
    .withMessage('La cédula debe tener entre 7 y 20 caracteres'),
  body('usuario')
    .notEmpty()
    .withMessage('El usuario es obligatorio')
    .isLength({ min: 3, max: 50 })
    .withMessage('El usuario debe tener entre 3 y 50 caracteres'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('perfil')
    .notEmpty()
    .withMessage('El perfil es obligatorio')
    .isLength({ min: 2, max: 150 })
    .withMessage('El perfil debe tener entre 2 y 150 caracteres'),
  body('permisos')
    .optional()
    .isString()
    .withMessage('Los permisos deben ser una cadena de texto')
];

const validateUpdateUsuario = [
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
  body('genero')
    .optional()
    .isIn(['M', 'F'])
    .withMessage('El género debe ser M o F'),
  body('fecha_nacimiento')
    .optional()
    .isISO8601()
    .withMessage('La fecha de nacimiento debe ser válida'),
  body('cedula')
    .optional()
    .isLength({ min: 7, max: 20 })
    .withMessage('La cédula debe tener entre 7 y 20 caracteres'),
  body('usuario')
    .optional()
    .isLength({ min: 3, max: 50 })
    .withMessage('El usuario debe tener entre 3 y 50 caracteres'),
  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('perfil')
    .optional()
    .isLength({ min: 2, max: 150 })
    .withMessage('El perfil debe tener entre 2 y 150 caracteres'),
  body('permisos')
    .optional()
    .isString()
    .withMessage('Los permisos deben ser una cadena de texto'),
  body('estado')
    .optional()
    .isIn(['activo', 'inactivo'])
    .withMessage('El estado debe ser activo o inactivo')
];

const validateChangePassword = [
  body('currentPassword')
    .notEmpty()
    .withMessage('La contraseña actual es obligatoria'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('La nueva contraseña debe tener al menos 6 caracteres'),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Las contraseñas no coinciden');
      }
      return true;
    })
];

const validateId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID debe ser un número válido')
];

const validateQuery = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La página debe ser un número válido'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('El límite debe ser entre 1 y 100'),
  query('search')
    .optional()
    .isString()
    .withMessage('La búsqueda debe ser una cadena de texto')
];

// Middleware de autenticación para todas las rutas
router.use(authenticateToken);

// Rutas de usuarios
/**
 * @route   GET /api/usuarios
 * @desc    Obtener lista de usuarios con paginación
 * @access  Private (requiere autenticación)
 * @query   {number} page - Número de página (opcional, default: 1)
 * @query   {number} limit - Límite de resultados por página (opcional, default: 10)
 * @query   {string} search - Término de búsqueda (opcional)
 */
router.get('/', validateQuery, handleValidationErrors, UsuarioController.getAll);

/**
 * @route   GET /api/usuarios/stats
 * @desc    Obtener estadísticas de usuarios
 * @access  Private (requiere autenticación)
 */
router.get('/stats', UsuarioController.getStats);

/**
 * @route   GET /api/usuarios/:id
 * @desc    Obtener usuario por ID
 * @access  Private (requiere autenticación)
 * @param   {number} id - ID del usuario
 */
router.get('/:id', validateId, handleValidationErrors, UsuarioController.getById);

/**
 * @route   POST /api/usuarios
 * @desc    Crear nuevo usuario
 * @access  Private (requiere autenticación)
 * @body    {CreateUsuarioRequest} userData - Datos del usuario
 */
router.post('/', validateCreateUsuario, handleValidationErrors, UsuarioController.create);

/**
 * @route   PUT /api/usuarios/:id
 * @desc    Actualizar usuario
 * @access  Private (requiere autenticación)
 * @param   {number} id - ID del usuario
 * @body    {UpdateUsuarioRequest} userData - Datos del usuario a actualizar
 */
router.put('/:id', validateId, validateUpdateUsuario, handleValidationErrors, UsuarioController.update);

/**
 * @route   DELETE /api/usuarios/:id
 * @desc    Eliminar usuario
 * @access  Private (requiere autenticación)
 * @param   {number} id - ID del usuario
 */
router.delete('/:id', validateId, handleValidationErrors, UsuarioController.delete);

/**
 * @route   PATCH /api/usuarios/:id/toggle-status
 * @desc    Alternar estado del usuario (activo/inactivo)
 * @access  Private (requiere autenticación)
 * @param   {number} id - ID del usuario
 */
router.patch('/:id/toggle-status', validateId, handleValidationErrors, UsuarioController.toggleStatus);

/**
 * @route   PATCH /api/usuarios/:id/change-password
 * @desc    Cambiar contraseña de usuario
 * @access  Private (requiere autenticación)
 * @param   {number} id - ID del usuario
 * @body    {object} passwords - Contraseñas actual y nueva
 * @body    {string} passwords.currentPassword - Contraseña actual
 * @body    {string} passwords.newPassword - Nueva contraseña
 * @body    {string} passwords.confirmPassword - Confirmación de nueva contraseña
 */
router.patch('/:id/change-password', validateId, validateChangePassword, handleValidationErrors, UsuarioController.changePassword);

export default router;
