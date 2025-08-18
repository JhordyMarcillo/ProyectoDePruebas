-- phpMyAdmin SQL Dump
-- version 5.1.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Jul 13, 2025 at 05:56 AM
-- Server version: 5.7.24
-- PHP Version: 8.3.1

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `spa_base`
--

-- --------------------------------------------------------

--
-- Table structure for table `cambios`
--

CREATE TABLE `cambios` (
  `id` int(11) NOT NULL,
  `id_cambiado` int(11) NOT NULL,
  `usuario_id` varchar(110) NOT NULL,
  `descripcion` text,
  `tipo_cambio` enum('Agregar','Actualizar','Activo','Inactivo') NOT NULL,
  `fecha` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `tabla_afectada` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `cambios`
--

INSERT INTO `cambios` (`id`, `id_cambiado`, `usuario_id`, `descripcion`, `tipo_cambio`, `fecha`, `tabla_afectada`) VALUES
(1, 0, 'admin', 'Cliente agregado: prueba Renso', 'Agregar', '2024-08-30 02:55:53', 'clientes'),
(2, 0, 'administrador', 'Producto agregado: Pepino', 'Agregar', '2024-08-30 03:29:43', 'productos'),
(3, 2, 'administrador', 'Cliente actualizado: Ikea Renso (Cédula: 1724354459)', 'Actualizar', '2024-08-30 03:49:43', 'clientes'),
(4, 3, 'administrador', 'Producto actualizado:  (Categoría: )', 'Actualizar', '2024-08-30 03:50:40', 'productos'),
(5, 15, 'administrador', 'Servicio actualizado:  (D: Servicio Prueba)', 'Actualizar', '2024-08-30 04:00:39', 'servicios'),
(6, 15, 'administrador', 'Servicio actualizado: Servicio Prueba (D: jasasa555)', 'Actualizar', '2024-08-30 04:01:40', 'servicios'),
(7, 2, 'administrador', 'Perfil activado: Ikea Renso (Cédula: 1755211433)', '', '2024-08-30 04:07:33', 'perfiles'),
(8, 12, 'administrador', 'Servicio desactivado: nxkzxxzk', '', '2024-08-30 04:09:13', 'servicios'),
(9, 1, 'administrador', 'Cliente activado: Darwin Panchez (Cédula: 1755897285)', 'Activo', '2024-08-30 04:09:26', 'clientes'),
(10, 2, 'administrador', 'Proveedor desactivado: Josh (Web: www.josh.com)', 'Inactivo', '2024-08-30 04:12:46', 'proveedores'),
(11, 2, 'administrador', 'Proveedor activado: Josh (Web: www.josh.com)', 'Activo', '2024-08-30 04:12:49', 'proveedores'),
(12, 2, 'administrador', 'Proveedor desactivado: Josh (Web: www.josh.com)', 'Inactivo', '2024-08-30 04:12:50', 'proveedores'),
(13, 2, 'administrador', 'Proveedor activado: Josh (Web: www.josh.com)', 'Activo', '2024-08-30 04:13:00', 'proveedores'),
(14, 2, 'administrador', 'Proveedor desactivado: Josh (Web: www.josh.com)', 'Inactivo', '2024-08-30 04:13:00', 'proveedores'),
(15, 2, 'administrador', 'Proveedor activado: Josh (Web: www.josh.com)', 'Activo', '2024-08-30 04:13:01', 'proveedores'),
(16, 2, 'administrador', 'Proveedor desactivado: Josh (Web: www.josh.com)', 'Inactivo', '2024-08-30 04:13:01', 'proveedores'),
(17, 0, 'administrador', 'Proveedor agregado: lss', 'Agregar', '2024-08-30 04:13:46', 'proveedores'),
(18, 2, 'administrador', 'Proveedor activado: Josh (Web: www.josh.com)', 'Activo', '2024-08-30 04:13:57', 'proveedores'),
(19, 2, 'administrador', 'Proveedor desactivado: Josh (Web: www.josh.com)', 'Inactivo', '2024-08-30 04:14:44', 'proveedores'),
(20, 2, 'administrador', 'Proveedor activado: Josh (Web: www.josh.com)', 'Activo', '2024-08-30 04:14:45', 'proveedores'),
(21, 2, 'administrador', 'Proveedor desactivado: Josh (Web: www.josh.com)', 'Inactivo', '2024-08-30 04:14:55', 'proveedores'),
(22, 2, 'administrador', 'Proveedor activado: Josh (Web: www.josh.com)', 'Activo', '2024-08-30 04:14:56', 'proveedores'),
(23, 2, 'administrador', 'Proveedor desactivado: Josh (Web: www.josh.com)', 'Inactivo', '2024-08-30 04:15:45', 'proveedores'),
(24, 2, 'administrador', 'Proveedor activado: Josh (Web: www.josh.com)', 'Activo', '2024-08-30 04:15:57', 'proveedores'),
(25, 2, 'administrador', 'Proveedor desactivado: Josh (Web: www.josh.com)', 'Inactivo', '2024-08-30 04:16:09', 'proveedores'),
(26, 2, 'administrador', 'Proveedor activado: Josh (Web: www.josh.com)', 'Activo', '2024-08-30 04:16:09', 'proveedores'),
(27, 3, 'administrador', 'Proveedor desactivado: lss (Web: )', 'Inactivo', '2024-08-30 04:17:11', 'proveedores'),
(28, 3, 'administrador', 'Proveedor activado: lss (Web: )', 'Activo', '2024-08-30 04:17:15', 'proveedores'),
(29, 3, 'administrador', 'Proveedor desactivado: lss (Web: )', 'Inactivo', '2024-08-30 04:17:29', 'proveedores'),
(30, 3, 'administrador', 'Proveedor activado: lss (Web: )', 'Activo', '2024-08-30 04:17:30', 'proveedores'),
(31, 3, 'administrador', 'Proveedor desactivado: lss (Web: )', 'Inactivo', '2024-08-30 04:17:40', 'proveedores'),
(32, 3, 'administrador', 'Proveedor activado: lss (Web: )', 'Activo', '2024-08-30 04:17:42', 'proveedores'),
(33, 3, 'administrador', 'Proveedor desactivado: lss (Web: )', 'Inactivo', '2024-08-30 04:17:55', 'proveedores'),
(34, 3, 'administrador', 'Proveedor activado: lss (Web: )', 'Activo', '2024-08-30 04:17:55', 'proveedores'),
(35, 3, 'administrador', 'Proveedor desactivado: lss (Web: )', 'Inactivo', '2024-08-30 04:18:06', 'proveedores'),
(36, 3, 'administrador', 'Proveedor activado: lss (Web: )', 'Activo', '2024-08-30 04:18:07', 'proveedores'),
(37, 4, 'administrador', 'Cliente actualizado: prueba Renso (Cédula: 1723415418)', 'Actualizar', '2024-08-30 04:22:42', 'clientes'),
(38, 4, 'administrador', 'Cliente actualizado: prueba Renso (Cédula: 1723415418)', 'Actualizar', '2024-08-30 04:23:46', 'clientes'),
(39, 3, 'administrador', 'Cliente actualizado: admin admin (Cédula: 1755897287)', 'Actualizar', '2024-08-30 04:24:23', 'clientes'),
(40, 3, 'administrador', 'Cliente actualizado: admin admin (Cédula: 1755897287)', 'Actualizar', '2024-08-30 04:33:21', 'clientes'),
(41, 3, 'administrador', 'Cliente actualizado: admin admin (Cédula: 1755897287)', 'Actualizar', '2024-08-30 04:36:11', 'clientes'),
(42, 3, 'administrador', 'Cliente actualizado: admin admin (Cédula: 1755897287)', 'Actualizar', '2024-08-30 04:36:31', 'clientes'),
(43, 5, 'administrador', 'Producto actualizado: Pepino (Codigo: )', 'Actualizar', '2024-08-30 16:11:49', 'productos'),
(44, 5, 'administrador', 'Producto actualizado: Pepino (Codigo: )', 'Actualizar', '2024-08-30 16:13:49', 'productos'),
(45, 4, 'administrador', 'Producto actualizado: Acondicionador Triple Pete (Codigo: 4)', 'Actualizar', '2024-08-30 16:13:53', 'productos'),
(46, 4, 'administrador', 'Producto actualizado: Acondicionador Triple Pete (Codigo: 4)', 'Actualizar', '2024-08-30 16:13:57', 'productos'),
(47, 0, 'administrador', 'Producto agregado: Jabon Pelo ', 'Agregar', '2024-08-30 16:21:15', 'productos'),
(48, 0, 'administrador', 'Producto agregado: Pepino 4', 'Agregar', '2024-08-30 16:21:47', 'productos'),
(49, 0, 'administrador', 'Producto agregado: Jabon Pelo 2', 'Agregar', '2024-08-30 16:32:27', 'productos'),
(50, 0, 'administrador', 'Producto agregado: Pepino 1', 'Agregar', '2024-08-30 16:33:42', 'productos'),
(51, 12, 'administrador', 'Servicio activado: nxkzxxzk', 'Activo', '2024-08-30 16:44:17', 'servicios'),
(52, 0, 'administrador', 'Producto agregado: Pepino 2', 'Agregar', '2024-08-30 19:03:02', 'productos'),
(53, 0, 'administrador', 'Producto agregado: Acondicionador Triple P', 'Agregar', '2024-08-30 19:04:27', 'productos'),
(54, 0, 'administrador', 'Producto agregado: Jabon Pelo 1', 'Agregar', '2024-08-30 19:15:53', 'productos'),
(55, 0, 'administrador', 'Producto agregado: Pepino', 'Agregar', '2024-08-30 19:16:54', 'productos'),
(56, 0, 'administrador', 'Producto agregado: Jabon Pelo Negro', 'Agregar', '2024-08-30 19:17:41', 'productos'),
(57, 0, 'administrador', 'Producto agregado: Jabon Pelo Cast', 'Agregar', '2024-08-30 19:18:34', 'productos'),
(58, 3, 'administrador', 'Cliente actualizado: admin admin (Cédula: 1755897287)', 'Actualizar', '2024-08-31 01:45:39', 'clientes'),
(59, 4, 'administrador', 'Cliente actualizado: prueba Renso (Cédula: 1723415418)', 'Actualizar', '2024-08-31 01:57:53', 'clientes'),
(60, 1, 'administrador', 'Producto activado: Acondicionador 3lt (Código: 1)', 'Activo', '2024-08-31 02:15:44', 'productos'),
(61, 1, 'administrador', 'Producto desactivado: Acondicionador 3lt (Código: 1)', 'Inactivo', '2024-08-31 02:15:45', 'productos'),
(62, 2, 'administrador', 'Producto actualizado: Acondicionador 1lt (Codigo: 5)', 'Actualizar', '2024-08-31 02:15:48', 'productos'),
(63, 3, 'administrador', 'Cliente actualizado: admin admin (Cédula: 1755897287)', 'Actualizar', '2024-08-31 02:32:12', 'clientes'),
(64, 0, 'administrador', 'Producto agregado: Jabon Pelo 7', 'Agregar', '2024-08-31 02:43:08', 'productos'),
(65, 0, 'administrador', 'Producto agregado: Jabon Pelo Negr', 'Agregar', '2024-08-31 02:51:46', 'productos'),
(66, 0, 'administrador', 'Producto agregado: Jabon Pelo Casta', 'Agregar', '2024-08-31 02:53:00', 'productos'),
(67, 18, 'administrador', 'Producto actualizado: Jabon Pelo Negr (Codigo: 7)', 'Actualizar', '2024-08-31 02:53:22', 'productos'),
(68, 0, 'administrador', 'Producto agregado: Jabon Pelo Cas', 'Agregar', '2024-08-31 02:53:40', 'productos'),
(69, 0, 'administrador', 'Producto agregado: Pepino5', 'Agregar', '2024-08-31 02:54:44', 'productos'),
(70, 0, 'administrador', 'Venta realizada para cliente: ', 'Agregar', '2024-08-31 03:19:57', 'ventas'),
(71, 0, 'administrador', 'Servicio agregado: Servicio Prueba4', 'Agregar', '2024-08-31 03:26:31', 'servicios'),
(72, 11, 'administrador', 'Perfil actualizado: sa Renso (Cédula: 1723415418)', 'Actualizar', '2024-08-31 03:26:55', 'perfiles'),
(73, 6, 'administrador', 'Perfil actualizado: admin admin (Cédula: )', 'Actualizar', '2024-08-31 03:27:06', 'perfiles'),
(74, 21, 'administrador', 'Producto actualizado: Pepino5 (Codigo: 63)', 'Actualizar', '2024-08-31 03:27:14', 'productos'),
(75, 17, 'administrador', 'Servicio actualizado: Servicio Prueba4 (D: asoasoi)', 'Actualizar', '2024-08-31 03:27:23', 'servicios'),
(76, 2, 'administrador', 'Proveedor actualizado: Josh (Web: www.josh.com)', 'Actualizar', '2024-08-31 03:27:36', 'proveedores'),
(77, 3, 'administrador', 'Proveedor actualizado: lss (Web: )', 'Actualizar', '2024-08-31 03:27:52', 'proveedores'),
(78, 3, 'administrador', 'Proveedor desactivado: lss (Web: )', 'Inactivo', '2024-08-31 03:27:57', 'proveedores'),
(79, 21, 'administrador', 'Producto desactivado: Pepino5 (Código: 63)', 'Inactivo', '2024-08-31 03:28:07', 'productos'),
(80, 0, 'administrador', 'Venta realizada para cliente: ', 'Agregar', '2024-08-31 23:24:53', 'ventas'),
(81, 17, 'administrador', 'Servicio actualizado: Servicio Prueba4 (D: asoasoi)', 'Actualizar', '2024-08-31 23:26:03', 'servicios'),
(82, 17, 'administrador', 'Servicio desactivado: asoasoi', 'Inactivo', '2024-08-31 23:26:16', 'servicios'),
(83, 17, 'administrador', 'Servicio activado: asoasoi', 'Activo', '2024-08-31 23:26:16', 'servicios'),
(84, 4, 'administrador', 'Cliente actualizado: prueba Renso (Cédula: 1723415418)', 'Actualizar', '2024-09-01 02:36:25', 'clientes'),
(85, 21, 'administrador', 'Producto actualizado: Pepino5 (Codigo: 63)', 'Actualizar', '2024-09-01 02:36:45', 'productos'),
(86, 1, 'administrador', 'Producto activado: Acondicionador 3lt (Código: 1)', 'Activo', '2024-09-01 21:19:15', 'productos'),
(87, 1, 'administrador', 'Producto desactivado: Acondicionador 3lt (Código: 1)', 'Inactivo', '2024-09-01 21:19:15', 'productos'),
(88, 21, 'administrador', 'Producto activado: Pepino5 (Código: 63)', 'Activo', '2024-09-01 21:20:06', 'productos'),
(89, 21, 'administrador', 'Producto desactivado: Pepino5 (Código: 63)', 'Inactivo', '2024-09-01 21:20:06', 'productos'),
(90, 21, 'administrador', 'Producto activado: Pepino5 (Código: 63)', 'Activo', '2024-09-01 21:20:07', 'productos'),
(91, 21, 'administrador', 'Producto desactivado: Pepino5 (Código: 63)', 'Inactivo', '2024-09-01 21:20:08', 'productos'),
(92, 16, 'administrador', 'Servicio desactivado: sioasios', 'Inactivo', '2024-09-01 21:24:33', 'servicios'),
(93, 16, 'administrador', 'Servicio activado: sioasios', 'Activo', '2024-09-01 21:24:33', 'servicios'),
(94, 10, 'administrador', 'Perfil actualizado: prueba Renso (Cédula: 1755897287)', 'Actualizar', '2024-09-01 21:35:00', 'perfiles'),
(95, 10, 'administrador', 'Perfil actualizado: prueba Renso (Cédula: 1755897287)', 'Actualizar', '2024-09-01 21:35:08', 'perfiles'),
(96, 10, 'administrador', 'Perfil actualizado: prueba Renso (Cédula: 1755897287)', 'Actualizar', '2024-09-01 21:35:26', 'perfiles'),
(97, 10, 'administrador', 'Perfil actualizado: prueba Renso (Cédula: 1755897287)', 'Actualizar', '2024-09-01 21:37:03', 'perfiles'),
(98, 10, 'administrador', 'Perfil actualizado: prueba Renso (Cédula: 1755897287)', 'Actualizar', '2024-09-01 21:37:22', 'perfiles'),
(99, 10, 'administrador', 'Perfil actualizado: prueba Renso (Cédula: 1755897287)', 'Actualizar', '2024-09-01 21:37:27', 'perfiles'),
(100, 10, 'administrador', 'Perfil actualizado: prueba Renso (Cédula: 1755897287)', 'Actualizar', '2024-09-01 21:44:59', 'perfiles'),
(101, 11, 'administrador', 'Perfil actualizado: sa Renso (Cédula: 1723415418)', 'Actualizar', '2024-09-01 21:45:04', 'perfiles'),
(102, 10, 'administrador', 'Perfil actualizado: prueba Renso (Cédula: 1755897287)', 'Actualizar', '2024-09-01 21:45:10', 'perfiles'),
(103, 11, 'administrador', 'Perfil actualizado: sa Renso (Cédula: 1723415418)', 'Actualizar', '2024-09-01 22:00:55', 'perfiles'),
(104, 10, 'administrador', 'Perfil actualizado: prueba Renso (Cédula: 1755897287)', 'Actualizar', '2024-09-01 22:01:01', 'perfiles'),
(105, 10, 'administrador', 'Perfil actualizado: prueba Renso (Cédula: 1755897287)', 'Actualizar', '2024-09-01 22:01:07', 'perfiles'),
(106, 10, 'administrador', 'Perfil actualizado: prueba Renso (Cédula: 1755897287)', 'Actualizar', '2024-09-01 22:01:13', 'perfiles'),
(107, 10, 'administrador', 'Perfil actualizado: prueba Renso (Cédula: 1755897287)', 'Actualizar', '2024-09-01 22:05:06', 'perfiles'),
(108, 10, 'administrador', 'Perfil actualizado: prueba Renso (Cédula: 1755897287)', 'Actualizar', '2024-09-01 22:05:48', 'perfiles'),
(109, 10, 'administrador', 'Perfil actualizado: prueba Renso (Cédula: 1755897287)', 'Actualizar', '2024-09-01 23:00:04', 'perfiles'),
(110, 17, 'administrador', 'Servicio desactivado: asoasoi', 'Inactivo', '2024-09-02 01:41:49', 'servicios'),
(111, 17, 'administrador', 'Servicio activado: asoasoi', 'Activo', '2024-09-02 01:41:50', 'servicios'),
(112, 0, 'administrador', 'Venta realizada para cliente: ', 'Agregar', '2024-09-02 02:29:44', 'ventas'),
(113, 6, 'admin', 'Proveedor desactivado: Test (Web: test.com)', 'Inactivo', '2025-06-02 23:54:49', 'proveedores'),
(114, 6, 'desconocido', 'Proveedor activado: Test (Web: test.com)', 'Activo', '2025-06-02 23:54:53', 'proveedores'),
(115, 6, 'admin', 'Proveedor actualizado: Test (Web: test.com)', 'Actualizar', '2025-06-02 23:54:58', 'proveedores'),
(116, 5, 'admin', 'Cliente desactivado: Test Test (Cédula: 1721552725)', 'Inactivo', '2025-06-03 04:50:12', 'clientes'),
(117, 5, 'desconocido', 'Cliente activado: Test Test (Cédula: 1721552725)', 'Activo', '2025-06-03 04:50:14', 'clientes'),
(118, 21, 'admin', 'Usuario agregado: José Proaño (Usuario: JoseIP)', 'Agregar', '2025-07-12 06:43:29', 'perfiles'),
(119, 21, 'admin', 'Usuario desactivado: José Proaño (Usuario: JoseIP)', 'Inactivo', '2025-07-12 06:53:07', 'perfiles'),
(120, 21, 'admin', 'Usuario activado: José Proaño (Usuario: JoseIP)', 'Activo', '2025-07-12 06:53:08', 'perfiles'),
(121, 21, 'admin', 'Usuario desactivado: José Proaño (Usuario: JoseIP)', 'Inactivo', '2025-07-12 06:53:08', 'perfiles'),
(122, 21, 'admin', 'Usuario activado: José Proaño (Usuario: JoseIP)', 'Activo', '2025-07-12 06:53:09', 'perfiles'),
(123, 21, 'admin', 'Usuario eliminado: José Proaño (Usuario: JoseIP)', 'Inactivo', '2025-07-12 06:53:16', 'perfiles'),
(124, 6, 'admin', 'Cliente agregado: José Proaño (Cédula: 0601780661)', 'Agregar', '2025-07-12 07:22:08', 'clientes'),
(125, 6, 'admin', 'Cliente actualizado: José Proaño (Cédula: 0601780661)', 'Actualizar', '2025-07-12 07:22:39', 'clientes'),
(126, 36, 'admin', 'Stock añadido al producto: Acondicionador 2lt (+1 unidades, total: 27)', 'Actualizar', '2025-07-12 22:20:12', 'productos'),
(127, 37, 'admin', 'Producto agregado: prueba (Código: P123)', 'Agregar', '2025-07-12 22:48:38', 'productos'),
(128, 37, 'admin', 'Stock añadido al producto: prueba (+2 unidades, total: 25)', 'Actualizar', '2025-07-13 02:02:27', 'productos'),
(129, 37, 'admin', 'Producto modificado: prueba (estado: inactivo)', 'Actualizar', '2025-07-13 02:02:31', 'productos'),
(130, 37, 'admin', 'Producto modificado: prueba (estado: activo)', 'Actualizar', '2025-07-13 02:02:33', 'productos'),
(131, 20, 'admin', 'Usuario agregado: José Proaño (Usuario: JoseIP)', 'Agregar', '2025-07-13 02:44:45', 'perfiles');

-- --------------------------------------------------------

--
-- Table structure for table `clientes`
--

CREATE TABLE `clientes` (
  `id` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `apellido` varchar(50) NOT NULL,
  `cedula` varchar(20) NOT NULL,
  `numero` varchar(10) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `fecha_nacimiento` date NOT NULL,
  `genero` enum('M','F') NOT NULL,
  `locacion` varchar(100) DEFAULT NULL,
  `estado` enum('activo','inactivo') DEFAULT 'activo',
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `clientes`
--

INSERT INTO `clientes` (`id`, `nombre`, `apellido`, `cedula`, `numero`, `email`, `fecha_nacimiento`, `genero`, `locacion`, `estado`, `fecha_creacion`) VALUES
(1, 'Darwin', 'Panchez', '1755897285', '0', 'javierjacome@hotmail.ec', '2024-08-12', 'M', 'machachi', 'activo', '2024-08-30 04:09:26'),
(2, 'Ikea', 'Renso', '1724354459', '955897281', 'ikea@gmail.es', '2024-08-14', 'M', 'quito', 'activo', '2024-08-30 03:49:43'),
(3, 'admin', 'admin', '1755897287', '0955897285', 'javierjacome@hotmail', '2024-08-09', 'M', 'machachi', 'activo', '2024-08-31 02:32:12'),
(4, 'prueba', 'Renso', '1723415418', '0955897285', 'admin@gmail.com', '2024-08-13', 'M', 'quito', 'activo', '2024-09-01 02:36:25'),
(5, 'Test', 'Test', '1721552725', '0987523649', 'test@gmail.com', '2002-06-04', 'M', 'Test', 'activo', '2025-06-03 04:50:13'),
(6, 'José', 'Proaño', '0601780661', '0987523649', 'ji.provas@hotmail.com', '2025-07-09', 'M', 'quito', 'activo', '2025-07-12 07:22:08');

-- --------------------------------------------------------

--
-- Table structure for table `perfiles`
--

CREATE TABLE `perfiles` (
  `id` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `apellido` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `genero` enum('M','F') NOT NULL,
  `fecha_nacimiento` date NOT NULL,
  `cedula` varchar(20) NOT NULL,
  `usuario` varchar(50) NOT NULL,
  `contraseña` varchar(255) NOT NULL,
  `perfil` varchar(150) NOT NULL,
  `permisos` set('Inicio','Asignar','Cliente','Ventas','Productos','Servicios','Proveedores','Reportes') NOT NULL,
  `estado` enum('activo','inactivo') DEFAULT 'activo',
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `perfiles`
--

INSERT INTO `perfiles` (`id`, `nombre`, `apellido`, `email`, `genero`, `fecha_nacimiento`, `cedula`, `usuario`, `contraseña`, `perfil`, `permisos`, `estado`, `fecha_creacion`) VALUES
(2, 'Ikea', 'Renso', 'renso@gmail.es', 'M', '2024-08-15', '1755211433', 'Ikea', '$2y$10$eAHg82Ap.jfx4SFTf.rcjupc0DTEpZNrrfLTGDQq.vO/9X/hbkGn6', 'bodega', 'Inicio,Ventas,Productos,Proveedores,Reportes', 'activo', '2024-08-30 04:07:33'),
(3, 'Darwin', 'Panchez', 'javierjacome@hotmail.ec', 'M', '2024-08-01', '1755897285', 'darwin', '$2y$10$nPPqRfUyphPOLGeUvsoe1.Itx7Q2219P8Yv54VBdryaJYhrqCneRu', 'ventas', 'Inicio,Cliente,Ventas,Reportes', 'activo', '2024-08-28 15:34:25'),
(6, 'admin', 'admin', 'admin@gmail.com', 'M', '2024-08-20', '', 'admin', '$2y$10$HcWx2iuGdf1U5jRJxuR3WutQ4bUMoRrTskZaggW7JusBT32mMqrNm', 'admin', 'Inicio,Asignar,Cliente,Ventas,Productos,Servicios,Proveedores,Reportes', 'activo', '2024-08-31 03:27:06'),
(10, 'prueba', 'Renso', 'javierjacome@ho333333333.com', 'M', '2024-08-30', '1755897287', 'prueba', '$2y$10$ChcEavKvFPRQ4qrv27FF0eOt4ExurXuvFP5xD7L.SSBW97B7FK9He', 'prueba', '', 'activo', '2024-09-01 23:00:04'),
(11, 'sa', 'Renso', 'admin@gmail.es', 'M', '2024-08-07', '1723415418', 'prueba2', '$2y$10$HcWx2iuGdf1U5jRJxuR3WutQ4bUMoRrTskZaggW7JusBT32mMqrNm', 'bodega', 'Reportes', 'activo', '2024-09-01 22:00:55'),
(18, 'juan', 'perez', 'jperez@gmail.com', 'M', '2001-05-15', '1721552733', 'JPerez', '$2y$10$LM2xT8FlyerE8bpBK9kDoesXXNnOnp4cNaevPWOROLcQ2NnPZ0POu', 'admin', 'Inicio,Asignar,Cliente,Ventas,Productos,Servicios,Proveedores,Reportes', 'activo', '2025-05-19 14:26:25'),
(19, 'Test', 'Test', 'test@gmail.com', 'M', '2002-06-04', '1721552725', 'test', '$2y$10$fDKjH8QH7JvOzJEebJTn4uFgss5WawATWgZkaNUuwMDfaphIuCQj6', 'bodega', 'Inicio,Productos,Servicios,Proveedores,Reportes', 'activo', '2025-06-02 23:52:28'),
(20, 'José', 'Proaño', 'jiprovas@gmail.com', 'M', '2002-10-17', '0601780661', 'JoseIP', '$2b$10$RevK.2EMwE4.IvzPTBrtFuBO/LgEmHfrp9UruYrpaH.MNalSqev1q', 'Cliente', 'Inicio,Cliente,Ventas', 'activo', '2025-07-13 02:44:45');

-- --------------------------------------------------------

--
-- Table structure for table `productos`
--

CREATE TABLE `productos` (
  `id` int(11) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `cantidad` int(11) NOT NULL,
  `proveedor` varchar(150) NOT NULL,
  `precio` decimal(10,2) NOT NULL,
  `precio_compra` decimal(10,2) NOT NULL,
  `marca` varchar(255) DEFAULT NULL,
  `codigo` varchar(255) DEFAULT NULL,
  `estado` enum('activo','inactivo') DEFAULT 'activo',
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `productos`
--

INSERT INTO `productos` (`id`, `nombre`, `cantidad`, `proveedor`, `precio`, `precio_compra`, `marca`, `codigo`, `estado`, `fecha_creacion`) VALUES
(1, 'Acondicionador 3lt', 35, 'Pepe', '2.50', '1.00', 'EVO', '1', 'inactivo', '2024-09-01 21:19:15'),
(2, 'Acondicionador 1lt', 0, 'Pepe\r\n', '1.50', '0.00', 'EVO', '5', 'activo', '2024-08-31 02:15:48'),
(4, 'Acondicionador Triple Pete', 80, 'Josh', '5.00', '2.00', 'DILAN', '4', 'activo', '2024-08-30 16:13:57'),
(11, 'Pepino 2', 55, '5', '1.00', '5.00', 'DILAN', '4', 'activo', '2024-08-30 19:03:02'),
(12, 'Acondicionador Triple P', 88, '2', '5.00', '2.00', 'DILAN', '60', 'activo', '2024-08-30 19:04:27'),
(14, 'Pepino', 46, '', '5.00', '2.00', 'EVO', '6', 'activo', '2024-08-30 19:16:54'),
(15, 'Jabon Pelo Negro', 44, '', '5.00', '2.00', 'EVO', '20', 'activo', '2024-08-30 19:17:41'),
(16, 'Jabon Pelo Cast', 40, '2', '9.00', '5.00', 'EVO', '90', 'activo', '2024-08-30 19:18:34'),
(17, 'Jabon Pelo 7', 40, '', '5.00', '2.00', 'DILAN', '24', 'activo', '2024-08-31 02:43:08'),
(18, 'Jabon Pelo Negr', 24, 'Josh', '8.00', '5.00', 'EVO', '7', 'activo', '2024-08-31 02:53:22'),
(19, 'Jabon Pelo Casta', 50, 'Josh', '4.00', '2.00', 'EVO', '12', 'activo', '2024-08-31 02:53:00'),
(20, 'Jabon Pelo Cas', 90, 'Josh', '5.00', '2.00', '3', '54', 'activo', '2024-08-31 02:53:40'),
(21, 'Pepino5', 71, 'Josh', '2.00', '2.00', 'mercadona', '63', 'inactivo', '2024-09-01 21:20:08'),
(22, 'test', 0, 'Test', '9.00', '5.00', 'test', 'test', 'activo', '2025-06-02 23:32:48'),
(23, 'test2', 14, 'Test', '9.00', '5.00', 'test', 'test', 'activo', '2025-06-02 23:33:41'),
(24, 'test3', 15, 'Josh', '9.00', '5.00', 'test', 'test', 'activo', '2025-06-02 23:34:20'),
(25, 'test4', 15, 'Test', '9.00', '5.00', 'test', 'test', 'activo', '2025-06-02 23:34:50'),
(26, 'test5', 15, 'Test', '9.00', '5.00', 'test', 'test', 'activo', '2025-06-02 23:35:00'),
(27, 'test6', 15, 'Test', '9.00', '5.00', 'test', 'test', 'activo', '2025-06-02 23:37:51'),
(28, 'test7', 15, 'Josh', '9.00', '5.00', 'test', 'test', 'activo', '2025-06-02 23:39:32'),
(29, 'test9', 25, 'Test', '9.00', '1.00', 'test', 'test', 'activo', '2025-06-02 23:40:41'),
(30, 'test10', 25, 'Test', '9.00', '1.00', 'test', 'test', 'activo', '2025-06-02 23:40:54'),
(31, 'test11', 25, 'Test', '9.00', '1.00', 'test', 'test', 'activo', '2025-06-02 23:43:25'),
(32, 'test12', 1, 'Pepe', '1.00', '1.00', 'test', '1', 'activo', '2025-06-02 23:44:01'),
(33, 'test13', 0, 'Pepe', '1.00', '1.00', 'test', '1', 'activo', '2025-06-02 23:44:22'),
(34, '1', 2, 'Josh', '4.00', '5.00', '1', '1', 'activo', '2025-06-03 00:47:35'),
(35, 'Acondicionador Natural', 26, 'Josh', '19.00', '10.00', 'Pantene', 'A123', 'activo', '2025-06-03 12:50:14'),
(36, 'Acondicionador 2lt', 27, 'Josh', '19.00', '10.00', 'Pantene', 'A234', 'activo', '2025-06-03 12:51:00'),
(37, 'prueba', 18, 'Test', '25.00', '20.00', 'prueba', 'P123', 'activo', '2025-07-12 22:48:37');

-- --------------------------------------------------------

--
-- Table structure for table `proveedores`
--

CREATE TABLE `proveedores` (
  `id` int(11) NOT NULL,
  `nombre_empresa` varchar(100) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `numero` varchar(20) DEFAULT NULL,
  `web` varchar(100) DEFAULT NULL,
  `estado` varchar(30) NOT NULL DEFAULT 'activo',
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `proveedores`
--

INSERT INTO `proveedores` (`id`, `nombre_empresa`, `email`, `numero`, `web`, `estado`, `fecha_creacion`) VALUES
(2, 'Josh', 'joshlascuatro@gmail.com', '12233444', 'www.josh.com', 'activo', '2024-08-31 03:27:36'),
(3, 'lss', 'lsss@gmail.com', '55555554', '', 'activo', '2024-08-31 03:27:57'),
(5, 'Pepe', 'pepelascuatro@gmail.com', '55555554', 'www.pepe.com', 'activo', '2024-08-29 19:34:18'),
(6, 'Test', 'test@gmail.com', '0965324895', 'test.com', 'activo', '2025-06-02 23:54:58'),
(7, 'test2', 'test2@gmail.com', '0987523649', 'https://test2.com', 'activo', '2025-07-12 08:02:16');

-- --------------------------------------------------------

--
-- Table structure for table `servicios`
--

CREATE TABLE `servicios` (
  `id` int(11) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `descripcion` text,
  `productos` json DEFAULT NULL,
  `coste_total` decimal(10,2) NOT NULL,
  `estado` enum('activo','inactivo') NOT NULL DEFAULT 'activo',
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `costo_servicio` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `servicios`
--

INSERT INTO `servicios` (`id`, `nombre`, `descripcion`, `productos`, `coste_total`, `estado`, `fecha_creacion`, `costo_servicio`) VALUES
(12, 'Servicio Prueba2', 'nxkzxxzk', '[{\"id\": \"1\", \"costo\": 2.3, \"nombre\": \"Acondicionador 3lt\", \"cantidad\": 1}, {\"id\": \"2\", \"costo\": 1.5, \"nombre\": \"Acondicionador 1lt\", \"cantidad\": 2}]', '9.40', 'activo', '2024-08-30 16:44:17', '4.00'),
(15, 'Servicio Prueba', 'jasasa555', '[{\"id\": \"2\", \"costo\": 1.5, \"nombre\": \"Acondicionador 1lt\", \"cantidad\": 2}, {\"id\": \"3\", \"costo\": 5, \"nombre\": \"Jabon Pelo Castaño\", \"cantidad\": 2}]', '18.00', 'activo', '2024-08-30 04:01:40', '5.00'),
(16, 'Servicio Prueba3', 'sioasios', '[{\"id\": \"2\", \"costo\": 1.5, \"nombre\": \"Acondicionador 1lt\", \"cantidad\": 2}, {\"id\": \"7\", \"costo\": 2, \"nombre\": \"Pepino 4\", \"cantidad\": 2}]', '11.00', 'activo', '2024-09-01 21:24:33', '4.00'),
(17, 'Servicio Prueba4', 'asoasoi', '[{\"id\": \"15\", \"costo\": 5, \"nombre\": \"Jabon Pelo Negro\", \"cantidad\": 2}, {\"id\": \"18\", \"costo\": 8, \"nombre\": \"Jabon Pelo Negr\", \"cantidad\": 2}]', '31.00', 'activo', '2024-09-02 01:41:50', '5.00'),
(18, 'Test', 'test', '[{\"id\": \"22\", \"costo\": 9, \"nombre\": \"test\", \"cantidad\": 2}]', '28.00', 'activo', '2025-06-03 00:17:03', '10.00'),
(19, '1', '1', '[{\"id\": \"22\", \"costo\": 9, \"nombre\": \"test\", \"cantidad\": 1}]', '10.00', 'activo', '2025-06-03 00:25:18', '1.00'),
(21, '2', '2', '[{\"id\": \"22\", \"costo\": 9, \"nombre\": \"test\", \"cantidad\": 2}]', '20.00', 'activo', '2025-06-03 00:25:47', '2.00'),
(27, '3', '2', '[{\"id\": \"22\", \"costo\": 9, \"nombre\": \"test\", \"cantidad\": 2}]', '20.00', 'activo', '2025-06-03 00:26:34', '2.00'),
(28, '4', '4', '[{\"id\": \"22\", \"costo\": 9, \"nombre\": \"test\", \"cantidad\": 4}]', '40.00', 'activo', '2025-06-03 00:26:54', '4.00'),
(30, '5', '5', '[{\"id\": \"11\", \"costo\": 1, \"nombre\": \"Pepino 2\", \"cantidad\": 5}]', '5.00', 'activo', '2025-06-03 00:28:30', '5.00'),
(31, 'Test2', 'Test2', '[{\"id\": \"30\", \"costo\": 9, \"nombre\": \"test10\", \"cantidad\": 1}]', '14.00', 'activo', '2025-06-03 05:28:24', '5.00'),
(33, 'prueba', 'prueba', '[{\"id\": 37, \"costo\": \"25.00\", \"nombre\": \"prueba\", \"precio\": \"25.00\", \"cantidad\": 2}, {\"id\": 36, \"costo\": \"19.00\", \"nombre\": \"Acondicionador 2lt\", \"precio\": \"19.00\", \"cantidad\": 3}, {\"id\": 34, \"costo\": \"4.00\", \"nombre\": \"1\", \"precio\": \"4.00\", \"cantidad\": 1}]', '146.00', 'activo', '2025-07-13 01:02:18', '35.00');

-- --------------------------------------------------------

--
-- Table structure for table `ventas`
--

CREATE TABLE `ventas` (
  `id` int(11) NOT NULL,
  `cedula_cliente` varchar(10) NOT NULL,
  `productos` json DEFAULT NULL,
  `servicios` json DEFAULT NULL,
  `iva` int(2) NOT NULL,
  `total_pagar` decimal(10,2) NOT NULL,
  `metodo` varchar(20) NOT NULL,
  `vendedor` varchar(100) NOT NULL,
  `estado` enum('activo','inactivo') DEFAULT 'activo',
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `ventas`
--

INSERT INTO `ventas` (`id`, `cedula_cliente`, `productos`, `servicios`, `iva`, `total_pagar`, `metodo`, `vendedor`, `estado`, `fecha_creacion`) VALUES
(3, '1755897285', '[{\"id\": \"1\", \"costo\": 2.3, \"nombre\": \"Acondicionador 3lt\", \"cantidad\": 2}, {\"id\": \"3\", \"costo\": 5, \"nombre\": \"Jabon Pelo Castaño\", \"cantidad\": 2}]', '[{\"id\": \"11\", \"costo\": 31.3, \"nombre\": \"Servicio Prueba\", \"cantidad\": 1, \"productos\": [{\"id\": \"1\", \"costo\": 2.3, \"nombre\": \"Acondicionador 3lt\", \"cantidad\": 1}, {\"id\": \"3\", \"costo\": 5, \"nombre\": \"Jabon Pelo Castaño\", \"cantidad\": 5}]}]', 0, '0.00', '', '', 'activo', '2024-08-28 00:51:02'),
(4, '1755897285', '[{\"id\": \"1\", \"costo\": 2.3, \"nombre\": \"Acondicionador 3lt\", \"cantidad\": 2}, {\"id\": \"3\", \"costo\": 5, \"nombre\": \"Jabon Pelo Castaño\", \"cantidad\": 2}]', '[{\"id\": \"11\", \"costo\": 31.3, \"nombre\": \"Servicio Prueba\", \"cantidad\": 1, \"productos\": [{\"id\": \"1\", \"costo\": 2.3, \"nombre\": \"Acondicionador 3lt\", \"cantidad\": 1}, {\"id\": \"3\", \"costo\": 5, \"nombre\": \"Jabon Pelo Castaño\", \"cantidad\": 5}]}]', 0, '0.00', '', '', 'activo', '2024-08-28 00:51:04'),
(5, '1755897285', '[{\"id\": \"1\", \"costo\": 2.3, \"nombre\": \"Acondicionador 3lt\", \"cantidad\": 1}]', '[{\"id\": \"11\", \"costo\": 31.3, \"nombre\": \"Servicio Prueba\", \"cantidad\": 1, \"productos\": [{\"id\": \"1\", \"costo\": 2.3, \"nombre\": \"Acondicionador 3lt\", \"cantidad\": 1}, {\"id\": \"3\", \"costo\": 5, \"nombre\": \"Jabon Pelo Castaño\", \"cantidad\": 5}]}]', 15, '38.64', '', 'admin admin', 'activo', '2024-08-28 00:53:54'),
(6, '1755897285', '[{\"id\": \"2\", \"costo\": 1.5, \"nombre\": \"Acondicionador 1lt\", \"cantidad\": 5}]', '[{\"id\": \"12\", \"costo\": 9.4, \"nombre\": \"Servicio Prueba2\", \"cantidad\": 1, \"productos\": [{\"id\": \"1\", \"costo\": 2.3, \"nombre\": \"Acondicionador 3lt\", \"cantidad\": 1}, {\"id\": \"2\", \"costo\": 1.5, \"nombre\": \"Acondicionador 1lt\", \"cantidad\": 2}]}]', 15, '19.43', '', 'admin admin', 'activo', '2024-08-30 18:43:43'),
(7, '1724354459', '[{\"id\": \"11\", \"costo\": 1, \"nombre\": \"Pepino 2\", \"cantidad\": 2}]', '[{\"id\": \"12\", \"costo\": 9.4, \"nombre\": \"Servicio Prueba2\", \"cantidad\": 3, \"productos\": [{\"id\": \"1\", \"costo\": 2.3, \"nombre\": \"Acondicionador 3lt\", \"cantidad\": 1}, {\"id\": \"2\", \"costo\": 1.5, \"nombre\": \"Acondicionador 1lt\", \"cantidad\": 2}]}]', 15, '34.73', 'efectivo', 'admin admin', 'activo', '2024-08-31 03:19:57'),
(8, '1755897285', '[{\"id\": \"14\", \"costo\": 5, \"nombre\": \"Pepino\", \"cantidad\": 1}]', '[{\"id\": \"17\", \"costo\": 31, \"nombre\": \"Servicio Prueba4\", \"cantidad\": 1, \"productos\": [{\"id\": \"15\", \"costo\": 5, \"nombre\": \"Jabon Pelo Negro\", \"cantidad\": 2}, {\"id\": \"18\", \"costo\": 8, \"nombre\": \"Jabon Pelo Negr\", \"cantidad\": 2}]}]', 12, '40.32', 'disabled selected', 'admin admin', 'activo', '2024-08-31 23:24:53'),
(9, '1755897285', '[{\"id\": \"2\", \"costo\": 1.5, \"nombre\": \"Acondicionador 1lt\", \"cantidad\": 1}]', '[{\"id\": \"17\", \"costo\": 31, \"nombre\": \"Servicio Prueba4\", \"cantidad\": 1, \"productos\": [{\"id\": \"15\", \"costo\": 5, \"nombre\": \"Jabon Pelo Negro\", \"cantidad\": 2}, {\"id\": \"18\", \"costo\": 8, \"nombre\": \"Jabon Pelo Negr\", \"cantidad\": 2}]}]', 15, '37.38', 'efectivo', 'admin admin', 'activo', '2024-09-02 02:29:44'),
(10, '1723415418', '[{\"id\": \"22\", \"costo\": 9, \"nombre\": \"test\", \"cantidad\": 1}]', '[{\"id\": \"12\", \"costo\": 9.4, \"nombre\": \"Servicio Prueba2\", \"cantidad\": 1, \"productos\": [{\"id\": \"1\", \"costo\": 2.3, \"nombre\": \"Acondicionador 3lt\", \"cantidad\": 1}, {\"id\": \"2\", \"costo\": 1.5, \"nombre\": \"Acondicionador 1lt\", \"cantidad\": 2}]}]', 15, '21.16', 'disabled selected', 'admin admin', 'activo', '2025-06-03 00:13:36'),
(11, '1723415418', '[{\"id\": \"11\", \"costo\": 1, \"nombre\": \"Pepino 2\", \"cantidad\": 2}]', '[{\"id\": \"17\", \"costo\": 31, \"nombre\": \"Servicio Prueba4\", \"cantidad\": 1, \"productos\": [{\"id\": \"15\", \"costo\": 5, \"nombre\": \"Jabon Pelo Negro\", \"cantidad\": 2}, {\"id\": \"18\", \"costo\": 8, \"nombre\": \"Jabon Pelo Negr\", \"cantidad\": 2}]}]', 15, '37.95', 'disabled selected', 'admin admin', 'activo', '2025-06-03 00:16:14'),
(12, '1723415418', '[{\"id\": \"22\", \"costo\": 9, \"nombre\": \"test\", \"cantidad\": 1}]', '[{\"id\": \"18\", \"costo\": 28, \"nombre\": \"Test\", \"cantidad\": 1, \"productos\": [{\"id\": \"22\", \"costo\": 9, \"nombre\": \"test\", \"cantidad\": 2}]}]', 15, '42.55', 'disabled selected', 'admin admin', 'activo', '2025-06-03 00:18:31'),
(13, '1723415418', '[{\"id\": \"22\", \"costo\": 9, \"nombre\": \"test\", \"cantidad\": 1}]', '[{\"id\": \"18\", \"costo\": 28, \"nombre\": \"Test\", \"cantidad\": 2, \"productos\": [{\"id\": \"22\", \"costo\": 9, \"nombre\": \"test\", \"cantidad\": 2}]}]', 15, '74.75', 'disabled selected', 'admin admin', 'activo', '2025-06-03 00:31:03'),
(14, '1723415418', '[{\"id\": \"22\", \"costo\": 9, \"nombre\": \"test\", \"cantidad\": 1}]', '[{\"id\": \"18\", \"costo\": 28, \"nombre\": \"Test\", \"cantidad\": 2, \"productos\": [{\"id\": \"22\", \"costo\": 9, \"nombre\": \"test\", \"cantidad\": 2}]}]', 15, '74.75', 'disabled selected', 'admin admin', 'activo', '2025-06-03 00:31:04'),
(15, '1723415418', '[{\"id\": \"22\", \"costo\": 9, \"nombre\": \"test\", \"cantidad\": 1}]', '[{\"id\": \"18\", \"costo\": 28, \"nombre\": \"Test\", \"cantidad\": 2, \"productos\": [{\"id\": \"22\", \"costo\": 9, \"nombre\": \"test\", \"cantidad\": 2}]}]', 15, '74.75', 'disabled selected', 'admin admin', 'activo', '2025-06-03 00:31:04'),
(16, '1723415418', '[{\"id\": \"22\", \"costo\": 9, \"nombre\": \"test\", \"cantidad\": 1}]', '[{\"id\": \"18\", \"costo\": 28, \"nombre\": \"Test\", \"cantidad\": 2, \"productos\": [{\"id\": \"22\", \"costo\": 9, \"nombre\": \"test\", \"cantidad\": 2}]}]', 15, '74.75', 'tarjeta', 'admin admin', 'activo', '2025-06-03 00:31:08'),
(17, '1723415418', '[{\"id\": \"22\", \"costo\": 9, \"nombre\": \"test\", \"cantidad\": 1}]', '[{\"id\": \"18\", \"costo\": 28, \"nombre\": \"Test\", \"cantidad\": 2, \"productos\": [{\"id\": \"22\", \"costo\": 9, \"nombre\": \"test\", \"cantidad\": 2}]}]', 15, '74.75', 'tarjeta', 'admin admin', 'activo', '2025-06-03 00:33:11'),
(18, '1723415418', '[{\"id\": \"22\", \"costo\": 9, \"nombre\": \"test\", \"cantidad\": 1}]', '[{\"id\": \"18\", \"costo\": 28, \"nombre\": \"Test\", \"cantidad\": 1, \"productos\": [{\"id\": \"22\", \"costo\": 9, \"nombre\": \"test\", \"cantidad\": 2}]}]', 15, '42.55', 'disabled selected', 'admin admin', 'activo', '2025-06-03 00:34:00'),
(19, '1723415418', '[{\"id\": \"22\", \"costo\": 9, \"nombre\": \"test\", \"cantidad\": 1}]', '[{\"id\": \"18\", \"costo\": 28, \"nombre\": \"Test\", \"cantidad\": 1, \"productos\": [{\"id\": \"22\", \"costo\": 9, \"nombre\": \"test\", \"cantidad\": 2}]}]', 15, '42.55', 'efectivo', 'admin admin', 'activo', '2025-06-03 00:34:11'),
(20, '1723415418', '[{\"id\": \"22\", \"costo\": 9, \"nombre\": \"test\", \"cantidad\": 1}]', '[{\"id\": \"18\", \"costo\": 28, \"nombre\": \"Test\", \"cantidad\": 1, \"productos\": [{\"id\": \"22\", \"costo\": 9, \"nombre\": \"test\", \"cantidad\": 2}]}]', 15, '42.55', 'disabled selected', 'admin admin', 'activo', '2025-06-03 00:34:40'),
(21, '1723415418', '[{\"id\": \"22\", \"costo\": 9, \"nombre\": \"test\", \"cantidad\": 1}]', '[{\"id\": \"18\", \"costo\": 28, \"nombre\": \"Test\", \"cantidad\": 1, \"productos\": [{\"id\": \"22\", \"costo\": 9, \"nombre\": \"test\", \"cantidad\": 2}]}]', 15, '42.55', 'disabled selected', 'admin admin', 'activo', '2025-06-03 00:35:02'),
(22, '1723415418', '[{\"id\": \"22\", \"costo\": 9, \"nombre\": \"test\", \"cantidad\": 1}]', '[{\"id\": \"18\", \"costo\": 28, \"nombre\": \"Test\", \"cantidad\": 1, \"productos\": [{\"id\": \"22\", \"costo\": 9, \"nombre\": \"test\", \"cantidad\": 2}]}]', 15, '42.55', 'disabled selected', 'admin admin', 'activo', '2025-06-03 00:36:01'),
(23, '1723415418', '[{\"id\": \"22\", \"costo\": 9, \"nombre\": \"test\", \"cantidad\": 1}]', '[{\"id\": \"18\", \"costo\": 28, \"nombre\": \"Test\", \"cantidad\": 1, \"productos\": [{\"id\": \"22\", \"costo\": 9, \"nombre\": \"test\", \"cantidad\": 2}]}]', 15, '42.55', 'disabled selected', 'admin admin', 'activo', '2025-06-03 00:36:01'),
(24, '1723415418', '[{\"id\": \"22\", \"costo\": 9, \"nombre\": \"test\", \"cantidad\": 1}]', '[{\"id\": \"18\", \"costo\": 28, \"nombre\": \"Test\", \"cantidad\": 1, \"productos\": [{\"id\": \"22\", \"costo\": 9, \"nombre\": \"test\", \"cantidad\": 2}]}]', 15, '42.55', 'disabled selected', 'admin admin', 'activo', '2025-06-03 00:36:01'),
(25, '1723415418', '[{\"id\": \"22\", \"costo\": 9, \"nombre\": \"test\", \"cantidad\": 1}]', '[{\"id\": \"18\", \"costo\": 28, \"nombre\": \"Test\", \"cantidad\": 1, \"productos\": [{\"id\": \"22\", \"costo\": 9, \"nombre\": \"test\", \"cantidad\": 2}]}]', 15, '42.55', 'disabled selected', 'admin admin', 'activo', '2025-06-03 00:36:02'),
(26, '1723415418', '[{\"id\": \"22\", \"costo\": 9, \"nombre\": \"test\", \"cantidad\": 1}]', '[{\"id\": \"18\", \"costo\": 28, \"nombre\": \"Test\", \"cantidad\": 1, \"productos\": [{\"id\": \"22\", \"costo\": 9, \"nombre\": \"test\", \"cantidad\": 2}]}]', 15, '42.55', 'disabled selected', 'admin admin', 'activo', '2025-06-03 00:36:04'),
(27, '1723415418', '[{\"id\": \"22\", \"costo\": 9, \"nombre\": \"test\", \"cantidad\": 1}]', '[{\"id\": \"18\", \"costo\": 28, \"nombre\": \"Test\", \"cantidad\": 1, \"productos\": [{\"id\": \"22\", \"costo\": 9, \"nombre\": \"test\", \"cantidad\": 2}]}]', 15, '42.55', 'disabled selected', 'admin admin', 'activo', '2025-06-03 00:36:04'),
(28, '1723415418', '[{\"id\": \"22\", \"costo\": 9, \"nombre\": \"test\", \"cantidad\": 1}]', '[{\"id\": \"18\", \"costo\": 28, \"nombre\": \"Test\", \"cantidad\": 1, \"productos\": [{\"id\": \"22\", \"costo\": 9, \"nombre\": \"test\", \"cantidad\": 2}]}]', 15, '42.55', 'disabled selected', 'admin admin', 'activo', '2025-06-03 00:38:07'),
(29, '1723415418', '[{\"id\": \"23\", \"costo\": 9, \"nombre\": \"test2\", \"cantidad\": 1}]', '[{\"id\": \"17\", \"costo\": 31, \"nombre\": \"Servicio Prueba4\", \"cantidad\": 1, \"productos\": [{\"id\": \"15\", \"costo\": 5, \"nombre\": \"Jabon Pelo Negro\", \"cantidad\": 2}, {\"id\": \"18\", \"costo\": 8, \"nombre\": \"Jabon Pelo Negr\", \"cantidad\": 2}]}]', 15, '46.00', 'efectivo', 'admin admin', 'activo', '2025-06-03 00:39:19'),
(34, '0601780661', '[{\"id\": 37, \"costo\": \"25.00\", \"nombre\": \"prueba\", \"cantidad\": 1}]', '[{\"id\": 33, \"costo\": \"146.00\", \"nombre\": \"prueba\", \"cantidad\": 1}]', 15, '196.65', 'tarjeta', 'admin admin', 'activo', '2025-07-13 02:14:25');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `cambios`
--
ALTER TABLE `cambios`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `clientes`
--
ALTER TABLE `clientes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `cedula` (`cedula`);

--
-- Indexes for table `perfiles`
--
ALTER TABLE `perfiles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `cedula` (`cedula`),
  ADD UNIQUE KEY `usuario` (`usuario`);

--
-- Indexes for table `productos`
--
ALTER TABLE `productos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nombre` (`nombre`);

--
-- Indexes for table `proveedores`
--
ALTER TABLE `proveedores`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `web` (`web`);

--
-- Indexes for table `servicios`
--
ALTER TABLE `servicios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nombre` (`nombre`);

--
-- Indexes for table `ventas`
--
ALTER TABLE `ventas`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `cambios`
--
ALTER TABLE `cambios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=132;

--
-- AUTO_INCREMENT for table `clientes`
--
ALTER TABLE `clientes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `perfiles`
--
ALTER TABLE `perfiles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `productos`
--
ALTER TABLE `productos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=38;

--
-- AUTO_INCREMENT for table `proveedores`
--
ALTER TABLE `proveedores`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `servicios`
--
ALTER TABLE `servicios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;

--
-- AUTO_INCREMENT for table `ventas`
--
ALTER TABLE `ventas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=35;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
