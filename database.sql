-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Versión del servidor:         8.0.44 - MySQL Community Server - GPL
-- SO del servidor:              Win64
-- HeidiSQL Versión:             12.12.0.7122
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Volcando estructura de base de datos para afroimpacto_db
CREATE DATABASE IF NOT EXISTS `afroimpacto_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `afroimpacto_db`;

-- Volcando estructura para tabla afroimpacto_db.archivo
CREATE TABLE IF NOT EXISTS `archivo` (
  `id_archivo` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) NOT NULL,
  `ruta` varchar(255) NOT NULL,
  `tipo` varchar(50) NOT NULL,
  `id_referencia` int NOT NULL,
  `tipo_referencia` varchar(50) NOT NULL,
  `creado_en` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id_archivo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla afroimpacto_db.archivo: ~0 rows (aproximadamente)

-- Volcando estructura para tabla afroimpacto_db.asignacion
CREATE TABLE IF NOT EXISTS `asignacion` (
  `id_asignacion` int NOT NULL AUTO_INCREMENT,
  `id_tarea` int NOT NULL,
  `id_voluntario` int NOT NULL,
  `id_rol` int NOT NULL,
  PRIMARY KEY (`id_asignacion`),
  KEY `FK_080b54e04105cbc5e51f9f12761` (`id_tarea`),
  KEY `FK_ff6c9d81e95011500e2926e06f9` (`id_voluntario`),
  KEY `idx_asignacion_rol_tarea` (`id_rol`,`id_tarea`),
  CONSTRAINT `FK_080b54e04105cbc5e51f9f12761` FOREIGN KEY (`id_tarea`) REFERENCES `tarea` (`id_tarea`),
  CONSTRAINT `fk_asignacion_rol` FOREIGN KEY (`id_rol`) REFERENCES `rol` (`id_rol`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_ff6c9d81e95011500e2926e06f9` FOREIGN KEY (`id_voluntario`) REFERENCES `voluntario` (`id_voluntario`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla afroimpacto_db.asignacion: ~0 rows (aproximadamente)

-- Volcando estructura para tabla afroimpacto_db.certificado
CREATE TABLE IF NOT EXISTS `certificado` (
  `id_certificado` int NOT NULL AUTO_INCREMENT,
  `id_voluntario` int NOT NULL,
  `id_proyecto` int DEFAULT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text NOT NULL,
  `tipo` varchar(50) NOT NULL,
  `fecha_emision` date NOT NULL,
  `fecha_expiracion` date DEFAULT NULL,
  `codigo_verificacion` varchar(50) NOT NULL,
  `archivo_pdf` varchar(255) DEFAULT NULL,
  `creado_en` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id_certificado`),
  UNIQUE KEY `UQ_certificado_codigo` (`codigo_verificacion`),
  KEY `FK_certificado_voluntario` (`id_voluntario`),
  KEY `FK_certificado_proyecto` (`id_proyecto`),
  KEY `idx_certificado_voluntario_fecha` (`id_voluntario`,`fecha_emision`),
  CONSTRAINT `FK_certificado_proyecto` FOREIGN KEY (`id_proyecto`) REFERENCES `proyecto` (`id_proyecto`) ON DELETE SET NULL,
  CONSTRAINT `FK_certificado_voluntario` FOREIGN KEY (`id_voluntario`) REFERENCES `voluntario` (`id_voluntario`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla afroimpacto_db.certificado: ~0 rows (aproximadamente)

-- Volcando estructura para tabla afroimpacto_db.configuracion_seguridad
CREATE TABLE IF NOT EXISTS `configuracion_seguridad` (
  `id_config_seguridad` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `two_factor_enabled` tinyint NOT NULL DEFAULT '0',
  `two_factor_secret` varchar(255) DEFAULT NULL,
  `sso_enabled` tinyint NOT NULL DEFAULT '0',
  `sso_provider` varchar(50) DEFAULT NULL,
  `session_timeout` int NOT NULL DEFAULT '3600',
  `ip_whitelist` text,
  `audit_log_enabled` tinyint NOT NULL DEFAULT '0',
  `creado_en` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `actualizado_en` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id_config_seguridad`),
  KEY `FK_config_seguridad_usuario` (`id_usuario`),
  CONSTRAINT `FK_config_seguridad_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla afroimpacto_db.configuracion_seguridad: ~0 rows (aproximadamente)

-- Volcando estructura para tabla afroimpacto_db.disponibilidad
CREATE TABLE IF NOT EXISTS `disponibilidad` (
  `id_disponibilidad` int NOT NULL AUTO_INCREMENT,
  `id_voluntario` int NOT NULL,
  `dia_semana` varchar(20) NOT NULL,
  `hora_inicio` time NOT NULL,
  `hora_fin` time NOT NULL,
  PRIMARY KEY (`id_disponibilidad`),
  KEY `FK_f35e270b26165db42c39b0b2069` (`id_voluntario`),
  CONSTRAINT `FK_f35e270b26165db42c39b0b2069` FOREIGN KEY (`id_voluntario`) REFERENCES `voluntario` (`id_voluntario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla afroimpacto_db.disponibilidad: ~0 rows (aproximadamente)

-- Volcando estructura para tabla afroimpacto_db.documento_solicitud
CREATE TABLE IF NOT EXISTS `documento_solicitud` (
  `id_documento` int NOT NULL AUTO_INCREMENT,
  `id_solicitud` int NOT NULL,
  `nombre_archivo` varchar(255) NOT NULL COMMENT 'Nombre original del archivo',
  `ruta_archivo` varchar(500) NOT NULL COMMENT 'Ruta donde se almacena el archivo',
  `tipo_documento` varchar(100) NOT NULL COMMENT 'Tipo de documento (CV, certificado, etc.)',
  `tamaño` int NOT NULL COMMENT 'Tamaño del archivo en bytes',
  `creado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_documento`),
  KEY `idx_documento_solicitud` (`id_solicitud`),
  CONSTRAINT `fk_documento_solicitud` FOREIGN KEY (`id_solicitud`) REFERENCES `solicitud_inscripcion` (`id_solicitud`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla afroimpacto_db.documento_solicitud: ~0 rows (aproximadamente)

-- Volcando estructura para tabla afroimpacto_db.donacion
CREATE TABLE IF NOT EXISTS `donacion` (
  `id_donacion` int NOT NULL AUTO_INCREMENT,
  `id_organizacion` int NOT NULL,
  `id_metodo` int NOT NULL,
  `monto_total` decimal(12,2) NOT NULL,
  `fecha` date NOT NULL,
  `condiciones` text NOT NULL,
  `verificado` tinyint NOT NULL DEFAULT '0',
  `id_estado` int NOT NULL,
  PRIMARY KEY (`id_donacion`),
  KEY `FK_95617e4c45e5efa3331b60881e2` (`id_organizacion`),
  KEY `FK_981d4a4f7835f640c5181b9909d` (`id_metodo`),
  KEY `FK_a5bdd9db938385e5caf9c9badde` (`id_estado`),
  CONSTRAINT `FK_95617e4c45e5efa3331b60881e2` FOREIGN KEY (`id_organizacion`) REFERENCES `organizacion` (`id_organizacion`),
  CONSTRAINT `FK_981d4a4f7835f640c5181b9909d` FOREIGN KEY (`id_metodo`) REFERENCES `metodopago` (`id_metodo`),
  CONSTRAINT `FK_a5bdd9db938385e5caf9c9badde` FOREIGN KEY (`id_estado`) REFERENCES `estado` (`id_estado`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla afroimpacto_db.donacion: ~0 rows (aproximadamente)

-- Volcando estructura para tabla afroimpacto_db.donacion_proyecto
CREATE TABLE IF NOT EXISTS `donacion_proyecto` (
  `id_donacion_proyecto` int NOT NULL AUTO_INCREMENT,
  `id_donacion` int NOT NULL,
  `id_proyecto` int NOT NULL,
  `monto_asignado` decimal(12,2) NOT NULL,
  PRIMARY KEY (`id_donacion_proyecto`),
  KEY `FK_d7153b581a96292cfa38cc29b69` (`id_donacion`),
  KEY `FK_e8fc3410eb6a8b322569e38c710` (`id_proyecto`),
  CONSTRAINT `FK_d7153b581a96292cfa38cc29b69` FOREIGN KEY (`id_donacion`) REFERENCES `donacion` (`id_donacion`),
  CONSTRAINT `FK_e8fc3410eb6a8b322569e38c710` FOREIGN KEY (`id_proyecto`) REFERENCES `proyecto` (`id_proyecto`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla afroimpacto_db.donacion_proyecto: ~0 rows (aproximadamente)

-- Volcando estructura para tabla afroimpacto_db.eliminacion_historial
CREATE TABLE IF NOT EXISTS `eliminacion_historial` (
  `id_eliminacion` int NOT NULL AUTO_INCREMENT,
  `tipo_entidad` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_entidad` int NOT NULL,
  `nombre_entidad` text COLLATE utf8mb4_unicode_ci,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `id_proyecto` int DEFAULT NULL,
  `id_usuario_eliminador` int NOT NULL,
  `razon` text COLLATE utf8mb4_unicode_ci,
  `datos_adicionales` json DEFAULT NULL,
  `fecha_eliminacion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_eliminacion`),
  KEY `idx_proyecto` (`id_proyecto`),
  KEY `idx_usuario` (`id_usuario_eliminador`),
  KEY `idx_tipo_entidad` (`tipo_entidad`),
  KEY `idx_fecha` (`fecha_eliminacion`),
  CONSTRAINT `fk_eliminacion_proyecto` FOREIGN KEY (`id_proyecto`) REFERENCES `proyecto` (`id_proyecto`) ON DELETE SET NULL,
  CONSTRAINT `fk_eliminacion_usuario` FOREIGN KEY (`id_usuario_eliminador`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando datos para la tabla afroimpacto_db.eliminacion_historial: ~0 rows (aproximadamente)

-- Volcando estructura para tabla afroimpacto_db.estado
CREATE TABLE IF NOT EXISTS `estado` (
  `id_estado` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  PRIMARY KEY (`id_estado`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla afroimpacto_db.estado: ~9 rows (aproximadamente)
INSERT INTO `estado` (`id_estado`, `nombre`) VALUES
	(1, 'activo'),
	(2, 'inactivo'),
	(3, 'completado'),
	(4, 'cancelado'),
	(5, 'planificacion'),
	(6, 'pendiente'),
	(7, 'en_progreso'),
	(8, 'procesada'),
	(9, 'rechazada');

-- Volcando estructura para tabla afroimpacto_db.evaluacion
CREATE TABLE IF NOT EXISTS `evaluacion` (
  `id_evaluacion` int NOT NULL AUTO_INCREMENT,
  `id_voluntario` int NOT NULL,
  `id_proyecto` int NOT NULL,
  `puntuacion` int NOT NULL,
  `comentario` text NOT NULL,
  `fecha` date NOT NULL,
  PRIMARY KEY (`id_evaluacion`),
  KEY `FK_7b335b72565eb886d680c6feb37` (`id_voluntario`),
  KEY `FK_4c414d056233bda67d28e860031` (`id_proyecto`),
  CONSTRAINT `FK_4c414d056233bda67d28e860031` FOREIGN KEY (`id_proyecto`) REFERENCES `proyecto` (`id_proyecto`),
  CONSTRAINT `FK_7b335b72565eb886d680c6feb37` FOREIGN KEY (`id_voluntario`) REFERENCES `voluntario` (`id_voluntario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla afroimpacto_db.evaluacion: ~0 rows (aproximadamente)

-- Volcando estructura para tabla afroimpacto_db.fase
CREATE TABLE IF NOT EXISTS `fase` (
  `id_fase` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text NOT NULL,
  `orden` int NOT NULL,
  `id_proyecto` int NOT NULL,
  `creado_en` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `actualizado_en` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id_fase`),
  KEY `FK_6e6cf7e6c950bcb2f99632a20f5` (`id_proyecto`),
  CONSTRAINT `FK_6e6cf7e6c950bcb2f99632a20f5` FOREIGN KEY (`id_proyecto`) REFERENCES `proyecto` (`id_proyecto`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla afroimpacto_db.fase: ~1 rows (aproximadamente)

-- Volcando estructura para tabla afroimpacto_db.formulario_inscripcion
CREATE TABLE IF NOT EXISTS `formulario_inscripcion` (
  `id_formulario` int NOT NULL AUTO_INCREMENT,
  `id_proyecto` int DEFAULT NULL COMMENT 'FK a Proyecto (si es específico del proyecto)',
  `id_organizacion` int DEFAULT NULL COMMENT 'FK a Organizacion (si es general de la organización)',
  `nombre_campo` varchar(100) NOT NULL COMMENT 'Nombre técnico del campo',
  `tipo_campo` enum('text','textarea','number','date','select','file') NOT NULL COMMENT 'Tipo de campo del formulario',
  `etiqueta` varchar(255) NOT NULL COMMENT 'Etiqueta visible para el usuario',
  `placeholder` varchar(255) DEFAULT NULL COMMENT 'Text placeholder del campo',
  `requerido` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'Si el campo es obligatorio',
  `opciones` text COMMENT 'Opciones para campos tipo select (JSON)',
  `orden` int NOT NULL DEFAULT '0' COMMENT 'Orden de aparición en el formulario',
  `activo` tinyint(1) NOT NULL DEFAULT '1' COMMENT 'Si el campo está activo',
  `creado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_formulario`),
  KEY `idx_formulario_proyecto` (`id_proyecto`),
  KEY `idx_formulario_organizacion` (`id_organizacion`),
  KEY `idx_formulario_proyecto_activo` (`id_proyecto`,`activo`),
  KEY `idx_formulario_organizacion_activo` (`id_organizacion`,`activo`),
  CONSTRAINT `fk_formulario_organizacion` FOREIGN KEY (`id_organizacion`) REFERENCES `organizacion` (`id_organizacion`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_formulario_proyecto` FOREIGN KEY (`id_proyecto`) REFERENCES `proyecto` (`id_proyecto`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla afroimpacto_db.formulario_inscripcion: ~0 rows (aproximadamente)

-- Volcando estructura para tabla afroimpacto_db.habilidad
CREATE TABLE IF NOT EXISTS `habilidad` (
  `id_habilidad` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text NOT NULL,
  PRIMARY KEY (`id_habilidad`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla afroimpacto_db.habilidad: ~0 rows (aproximadamente)

-- Volcando estructura para tabla afroimpacto_db.horas_voluntariadas
CREATE TABLE IF NOT EXISTS `horas_voluntariadas` (
  `id_horas` int NOT NULL AUTO_INCREMENT,
  `id_voluntario` int NOT NULL,
  `id_proyecto` int NOT NULL,
  `id_tarea` int DEFAULT NULL,
  `fecha` date NOT NULL,
  `horas_trabajadas` decimal(4,2) NOT NULL,
  `descripcion` text,
  `verificada` tinyint NOT NULL DEFAULT '0',
  `creado_en` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `actualizado_en` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id_horas`),
  KEY `FK_horas_voluntario` (`id_voluntario`),
  KEY `FK_horas_proyecto` (`id_proyecto`),
  KEY `FK_horas_tarea` (`id_tarea`),
  KEY `idx_horas_voluntario_fecha` (`id_voluntario`,`fecha`),
  KEY `idx_horas_proyecto_fecha` (`id_proyecto`,`fecha`),
  CONSTRAINT `FK_horas_proyecto` FOREIGN KEY (`id_proyecto`) REFERENCES `proyecto` (`id_proyecto`) ON DELETE CASCADE,
  CONSTRAINT `FK_horas_tarea` FOREIGN KEY (`id_tarea`) REFERENCES `tarea` (`id_tarea`) ON DELETE SET NULL,
  CONSTRAINT `FK_horas_voluntario` FOREIGN KEY (`id_voluntario`) REFERENCES `voluntario` (`id_voluntario`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla afroimpacto_db.horas_voluntariadas: ~0 rows (aproximadamente)

-- Volcando estructura para tabla afroimpacto_db.integracion
CREATE TABLE IF NOT EXISTS `integracion` (
  `id_integracion` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `tipo` varchar(50) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `habilitada` tinyint NOT NULL DEFAULT '0',
  `token_acceso` text,
  `token_refresh` text,
  `configuracion` text,
  `expiracion_token` datetime DEFAULT NULL,
  `creado_en` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `actualizado_en` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id_integracion`),
  KEY `FK_integracion_usuario` (`id_usuario`),
  CONSTRAINT `FK_integracion_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla afroimpacto_db.integracion: ~0 rows (aproximadamente)

-- Volcando estructura para tabla afroimpacto_db.jornada
CREATE TABLE IF NOT EXISTS `jornada` (
  `id_jornada` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  PRIMARY KEY (`id_jornada`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla afroimpacto_db.jornada: ~0 rows (aproximadamente)
INSERT INTO `jornada` (`id_jornada`, `nombre`) VALUES
	(1, 'Completa');

-- Volcando estructura para tabla afroimpacto_db.logro
CREATE TABLE IF NOT EXISTS `logro` (
  `id_logro` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text NOT NULL,
  `icono` varchar(50) DEFAULT NULL,
  `puntos` int NOT NULL DEFAULT '0',
  `tipo` varchar(50) NOT NULL,
  `condicion` text,
  `creado_en` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id_logro`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla afroimpacto_db.logro: ~0 rows (aproximadamente)

-- Volcando estructura para tabla afroimpacto_db.metodopago
CREATE TABLE IF NOT EXISTS `metodopago` (
  `id_metodo` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text NOT NULL,
  PRIMARY KEY (`id_metodo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla afroimpacto_db.metodopago: ~0 rows (aproximadamente)

-- Volcando estructura para tabla afroimpacto_db.migrations
CREATE TABLE IF NOT EXISTS `migrations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `timestamp` bigint NOT NULL,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla afroimpacto_db.migrations: ~12 rows (aproximadamente)
INSERT INTO `migrations` (`id`, `timestamp`, `name`) VALUES
	(1, 1760641314396, 'AfroimpactoDb1760641314396'),
	(2, 1753911217499, 'InitialSchema1753911217499'),
	(3, 1753914885196, 'AddTimeToProjectDates1753914885196'),
	(4, 1755118581866, 'AddOrganizacionToProyecto1755118581866'),
	(5, 1755804633995, 'AddOrganizacionIdToProyecto1755804633995'),
	(6, 1755804694542, 'SchemaSync1755804694542'),
	(7, 1756756552293, 'MakeIdRolNullable1756756552293'),
	(8, 1756757560460, 'FixIdRolNullable1756757560460'),
	(9, 1760808357772, 'UpdateProyectoFields1760808357772'),
	(10, 1760808357773, 'UpdateVoluntarioFields1760808357773'),
	(11, 1760808357774, 'UpdateTareaFields1760808357774'),
	(12, 1760888000000, 'AddNewTablesAndFields1760888000000');

-- Volcando estructura para tabla afroimpacto_db.movimiento
CREATE TABLE IF NOT EXISTS `movimiento` (
  `id_movimiento` int NOT NULL AUTO_INCREMENT,
  `tipo` varchar(50) NOT NULL,
  `descripcion` text NOT NULL,
  `cantidad` int NOT NULL,
  `monto` decimal(12,2) NOT NULL,
  `fecha` date NOT NULL,
  `comprobante` varchar(255) DEFAULT NULL,
  `id_proyecto` int NOT NULL,
  `id_tarea` int DEFAULT NULL,
  `id_donacion` int DEFAULT NULL,
  PRIMARY KEY (`id_movimiento`),
  KEY `FK_6c9de691fff88546d526c0be721` (`id_proyecto`),
  KEY `FK_a2cc74e37019249efd3b9274186` (`id_tarea`),
  KEY `FK_f798af7984d221fbe8b402e0b83` (`id_donacion`),
  CONSTRAINT `FK_6c9de691fff88546d526c0be721` FOREIGN KEY (`id_proyecto`) REFERENCES `proyecto` (`id_proyecto`),
  CONSTRAINT `FK_a2cc74e37019249efd3b9274186` FOREIGN KEY (`id_tarea`) REFERENCES `tarea` (`id_tarea`),
  CONSTRAINT `FK_f798af7984d221fbe8b402e0b83` FOREIGN KEY (`id_donacion`) REFERENCES `donacion` (`id_donacion`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla afroimpacto_db.movimiento: ~0 rows (aproximadamente)

-- Volcando estructura para tabla afroimpacto_db.notificacion
CREATE TABLE IF NOT EXISTS `notificacion` (
  `id_notificacion` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `titulo` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mensaje` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'info',
  `leida` tinyint(1) NOT NULL DEFAULT '0',
  `id_proyecto` int DEFAULT NULL,
  `tipo_entidad` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `id_entidad` int DEFAULT NULL,
  `datos_adicionales` json DEFAULT NULL,
  `fecha_creacion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_notificacion`),
  KEY `idx_usuario` (`id_usuario`),
  KEY `idx_proyecto` (`id_proyecto`),
  KEY `idx_leida` (`leida`),
  KEY `idx_fecha` (`fecha_creacion`),
  CONSTRAINT `fk_notificacion_proyecto` FOREIGN KEY (`id_proyecto`) REFERENCES `proyecto` (`id_proyecto`) ON DELETE SET NULL,
  CONSTRAINT `fk_notificacion_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando datos para la tabla afroimpacto_db.notificacion: ~0 rows (aproximadamente)

-- Volcando estructura para tabla afroimpacto_db.organizacion
CREATE TABLE IF NOT EXISTS `organizacion` (
  `id_organizacion` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `tipo` varchar(50) NOT NULL,
  `sitio_web` varchar(255) NOT NULL,
  `pais` varchar(100) NOT NULL,
  `ciudad` varchar(100) NOT NULL,
  `areas_enfoque` text NOT NULL,
  `mision_vision` text NOT NULL,
  `creado_en` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `actualizado_en` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `nombre_corto` varchar(50) DEFAULT NULL,
  `descripcion` text,
  `logo` varchar(255) DEFAULT NULL,
  `color_primario` varchar(7) DEFAULT NULL,
  `color_secundario` varchar(7) DEFAULT NULL,
  `tema` varchar(20) NOT NULL DEFAULT 'claro',
  PRIMARY KEY (`id_organizacion`),
  UNIQUE KEY `REL_a434fef9deb7d92b1120e93cde` (`id_usuario`),
  UNIQUE KEY `IDX_a434fef9deb7d92b1120e93cde` (`id_usuario`),
  CONSTRAINT `FK_a434fef9deb7d92b1120e93cde7` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla afroimpacto_db.organizacion: ~1 rows (aproximadamente)
INSERT INTO `organizacion` (`id_organizacion`, `id_usuario`, `nombre`, `tipo`, `sitio_web`, `pais`, `ciudad`, `areas_enfoque`, `mision_vision`, `creado_en`, `actualizado_en`, `nombre_corto`, `descripcion`, `logo`, `color_primario`, `color_secundario`, `tema`) VALUES
	(1, 2, 'Organizacion', 'organizacion', '', '', '', '', '', '2025-10-30 14:47:44.839538', '2025-10-30 14:47:44.839538', NULL, NULL, NULL, NULL, NULL, 'claro');

-- Volcando estructura para tabla afroimpacto_db.permiso
CREATE TABLE IF NOT EXISTS `permiso` (
  `id_permiso` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text NOT NULL,
  PRIMARY KEY (`id_permiso`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla afroimpacto_db.permiso: ~0 rows (aproximadamente)

-- Volcando estructura para tabla afroimpacto_db.preferencia_usuario
CREATE TABLE IF NOT EXISTS `preferencia_usuario` (
  `id_preferencia` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `notificaciones_email` tinyint NOT NULL DEFAULT '1',
  `resumen_semanal` tinyint NOT NULL DEFAULT '1',
  `recordatorios` tinyint NOT NULL DEFAULT '1',
  `notificaciones_push` tinyint NOT NULL DEFAULT '1',
  `modo_oscuro` tinyint NOT NULL DEFAULT '0',
  `idioma` varchar(10) NOT NULL DEFAULT 'es',
  `zona_horaria` varchar(50) NOT NULL DEFAULT 'America/Bogota',
  `creado_en` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `actualizado_en` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id_preferencia`),
  KEY `FK_preferencia_usuario` (`id_usuario`),
  CONSTRAINT `FK_preferencia_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla afroimpacto_db.preferencia_usuario: ~0 rows (aproximadamente)

-- Volcando estructura para tabla afroimpacto_db.proyecto
CREATE TABLE IF NOT EXISTS `proyecto` (
  `id_proyecto` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text NOT NULL,
  `objetivo` text NOT NULL,
  `ubicacion` varchar(100) NOT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date NOT NULL,
  `imagen_principal` varchar(255) DEFAULT NULL,
  `documento` varchar(255) DEFAULT NULL,
  `id_estado` int NOT NULL,
  `id_organizacion` int NOT NULL,
  `creado_en` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `actualizado_en` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `categoria` varchar(50) DEFAULT NULL,
  `es_publico` tinyint NOT NULL DEFAULT '1',
  `requisitos` text COMMENT 'Lista libre de requisitos para participar en el proyecto (JSON o texto)',
  `presupuesto_total` decimal(12,2) NOT NULL DEFAULT '0.00',
  PRIMARY KEY (`id_proyecto`),
  KEY `FK_5dc5ddea3fd8edda48a6d5e94c1` (`id_estado`),
  KEY `FK_636d20210bb84793000e129881f` (`id_organizacion`),
  KEY `idx_proyecto_publico_estado` (`es_publico`,`id_estado`),
  CONSTRAINT `FK_5dc5ddea3fd8edda48a6d5e94c1` FOREIGN KEY (`id_estado`) REFERENCES `estado` (`id_estado`),
  CONSTRAINT `FK_636d20210bb84793000e129881f` FOREIGN KEY (`id_organizacion`) REFERENCES `organizacion` (`id_organizacion`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla afroimpacto_db.proyecto: ~1 rows (aproximadamente)

-- Volcando estructura para tabla afroimpacto_db.proyecto_beneficio
CREATE TABLE IF NOT EXISTS `proyecto_beneficio` (
  `id_proyecto_beneficio` int NOT NULL AUTO_INCREMENT,
  `id_proyecto` int NOT NULL,
  `tipo_pago` enum('volunteer','stipend','salary','honorarium') NOT NULL DEFAULT 'volunteer' COMMENT 'Tipo de remuneración',
  `monto` decimal(12,2) NOT NULL DEFAULT '0.00' COMMENT 'Monto de remuneración',
  `frecuencia` enum('none','monthly','weekly','project') NOT NULL DEFAULT 'none' COMMENT 'Frecuencia de pago',
  `descripcion_pago` text COMMENT 'Descripción detallada del pago',
  `incluye_transporte` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'Si incluye transporte',
  `incluye_alimentacion` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'Si incluye alimentación',
  `incluye_materiales` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'Si incluye materiales de trabajo',
  `incluye_seguro` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'Si incluye seguro de accidentes',
  `creado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_proyecto_beneficio`),
  UNIQUE KEY `uk_proyecto_beneficio_proyecto` (`id_proyecto`),
  CONSTRAINT `fk_proyecto_beneficio_proyecto` FOREIGN KEY (`id_proyecto`) REFERENCES `proyecto` (`id_proyecto`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla afroimpacto_db.proyecto_beneficio: ~0 rows (aproximadamente)

-- Volcando estructura para tabla afroimpacto_db.reporte
CREATE TABLE IF NOT EXISTS `reporte` (
  `id_reporte` int NOT NULL AUTO_INCREMENT,
  `tipo` varchar(50) NOT NULL,
  `fecha` date NOT NULL,
  `contenido` text NOT NULL,
  `id_proyecto` int NOT NULL,
  `formato` varchar(20) NOT NULL DEFAULT 'PDF',
  `estado` varchar(20) NOT NULL DEFAULT 'pendiente',
  `incluir_graficos` tinyint NOT NULL DEFAULT '1',
  `descargas` int NOT NULL DEFAULT '0',
  `creado_en` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `actualizado_en` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id_reporte`),
  KEY `idx_reporte_proyecto_estado` (`id_proyecto`,`estado`),
  CONSTRAINT `FK_aca7331dcd0e2cee6e92b29408e` FOREIGN KEY (`id_proyecto`) REFERENCES `proyecto` (`id_proyecto`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla afroimpacto_db.reporte: ~0 rows (aproximadamente)

-- Volcando estructura para tabla afroimpacto_db.rol
CREATE TABLE IF NOT EXISTS `rol` (
  `id_rol` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `descripcion` varchar(255) NOT NULL,
  `tipo_rol` enum('sistema','organizacion','proyecto') NOT NULL DEFAULT 'sistema',
  `id_organizacion` int DEFAULT NULL,
  `id_proyecto` int DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `creado_por` int DEFAULT NULL,
  `creado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_rol`),
  KEY `fk_rol_creado_por` (`creado_por`),
  KEY `idx_rol_tipo_contexto` (`tipo_rol`,`id_organizacion`,`id_proyecto`),
  KEY `idx_rol_organizacion_activo` (`id_organizacion`,`activo`),
  KEY `idx_rol_proyecto_activo` (`id_proyecto`,`activo`),
  CONSTRAINT `fk_rol_creado_por` FOREIGN KEY (`creado_por`) REFERENCES `usuario` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_rol_organizacion` FOREIGN KEY (`id_organizacion`) REFERENCES `organizacion` (`id_organizacion`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_rol_proyecto` FOREIGN KEY (`id_proyecto`) REFERENCES `proyecto` (`id_proyecto`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla afroimpacto_db.rol: ~5 rows (aproximadamente)
INSERT INTO `rol` (`id_rol`, `nombre`, `descripcion`, `tipo_rol`, `id_organizacion`, `id_proyecto`, `activo`, `creado_por`, `creado_en`, `actualizado_en`) VALUES
	(1, 'Coordinador', 'Rol de coordinación general del proyecto', 'sistema', NULL, NULL, 1, NULL, '2025-11-06 15:02:00', '2025-11-06 15:02:00'),
	(2, 'Líder de Equipo', 'Líder de un equipo de trabajo dentro del proyecto', 'sistema', NULL, NULL, 1, NULL, '2025-11-06 15:02:00', '2025-11-06 15:02:00'),
	(3, 'Voluntario Base', 'Voluntario con responsabilidades básicas', 'sistema', NULL, NULL, 1, NULL, '2025-11-06 15:02:00', '2025-11-06 15:02:00'),
	(4, 'Especialista', 'Voluntario con habilidades especializadas', 'sistema', NULL, NULL, 1, NULL, '2025-11-06 15:02:00', '2025-11-06 15:02:00'),
	(5, 'Asistente', 'Voluntario de apoyo y asistencia', 'sistema', NULL, NULL, 1, NULL, '2025-11-06 15:02:00', '2025-11-06 15:02:00'),
	(6, 'programador', 'crea codigo', 'sistema', NULL, NULL, 1, NULL, '2025-11-06 15:18:09', '2025-11-06 15:18:09');

-- Volcando estructura para tabla afroimpacto_db.rol_permiso
CREATE TABLE IF NOT EXISTS `rol_permiso` (
  `id_rol` int NOT NULL,
  `id_permiso` int NOT NULL,
  PRIMARY KEY (`id_rol`,`id_permiso`),
  KEY `IDX_1d9e5be3d74310f98e398912d9` (`id_rol`),
  KEY `IDX_9c0fd212b970f71bf0a9465c4f` (`id_permiso`),
  CONSTRAINT `FK_1d9e5be3d74310f98e398912d94` FOREIGN KEY (`id_rol`) REFERENCES `rol` (`id_rol`),
  CONSTRAINT `FK_9c0fd212b970f71bf0a9465c4f3` FOREIGN KEY (`id_permiso`) REFERENCES `permiso` (`id_permiso`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla afroimpacto_db.rol_permiso: ~0 rows (aproximadamente)

-- Volcando estructura para tabla afroimpacto_db.solicitud_inscripcion
CREATE TABLE IF NOT EXISTS `solicitud_inscripcion` (
  `id_solicitud` int NOT NULL AUTO_INCREMENT,
  `id_proyecto` int NOT NULL,
  `id_voluntario` int NOT NULL,
  `estado` enum('pendiente','aprobada','rechazada') NOT NULL DEFAULT 'pendiente' COMMENT 'Estado de la solicitud',
  `motivacion` text COMMENT 'Motivación del voluntario para participar',
  `disponibilidad` text COMMENT 'Disponibilidad de tiempo del voluntario',
  `experiencia_relacionada` text COMMENT 'Experiencia relacionada con el proyecto',
  `notas_organizacion` text COMMENT 'Notas internas de la organización',
  `fecha_solicitud` date NOT NULL COMMENT 'Fecha en que se envió la solicitud',
  `fecha_revision` date DEFAULT NULL COMMENT 'Fecha en que se revisó la solicitud',
  `creado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_solicitud`),
  KEY `idx_solicitud_proyecto` (`id_proyecto`),
  KEY `idx_solicitud_voluntario` (`id_voluntario`),
  KEY `idx_solicitud_proyecto_estado` (`id_proyecto`,`estado`),
  KEY `idx_solicitud_voluntario_estado` (`id_voluntario`,`estado`),
  CONSTRAINT `fk_solicitud_proyecto` FOREIGN KEY (`id_proyecto`) REFERENCES `proyecto` (`id_proyecto`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_solicitud_voluntario` FOREIGN KEY (`id_voluntario`) REFERENCES `voluntario` (`id_voluntario`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla afroimpacto_db.solicitud_inscripcion: ~2 rows (aproximadamente)

-- Volcando estructura para tabla afroimpacto_db.tarea
CREATE TABLE IF NOT EXISTS `tarea` (
  `id_tarea` int NOT NULL AUTO_INCREMENT,
  `descripcion` text NOT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date NOT NULL,
  `prioridad` enum('Alta','Media','Baja') NOT NULL,
  `complejidad` varchar(100) NOT NULL,
  `id_estado` int NOT NULL,
  `id_fase` int NOT NULL,
  `creado_en` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `actualizado_en` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id_tarea`),
  KEY `FK_48eeaaf81750df62901889574e7` (`id_estado`),
  KEY `FK_271445314b408ec9ec3c19d9e66` (`id_fase`),
  CONSTRAINT `FK_271445314b408ec9ec3c19d9e66` FOREIGN KEY (`id_fase`) REFERENCES `fase` (`id_fase`),
  CONSTRAINT `FK_48eeaaf81750df62901889574e7` FOREIGN KEY (`id_estado`) REFERENCES `estado` (`id_estado`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla afroimpacto_db.tarea: ~1 rows (aproximadamente)

-- Volcando estructura para tabla afroimpacto_db.usuario
CREATE TABLE IF NOT EXISTS `usuario` (
  `id_usuario` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `id_rol` int DEFAULT NULL,
  `tipo_usuario` varchar(50) NOT NULL,
  `creado_en` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `actualizado_en` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `telefono` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `IDX_2863682842e688ca198eb25c12` (`email`),
  KEY `FK_3628e9894c4b014d61a01cb21dd` (`id_rol`),
  CONSTRAINT `FK_3628e9894c4b014d61a01cb21dd` FOREIGN KEY (`id_rol`) REFERENCES `rol` (`id_rol`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla afroimpacto_db.usuario: ~2 rows (aproximadamente)
INSERT INTO `usuario` (`id_usuario`, `nombre`, `email`, `password`, `id_rol`, `tipo_usuario`, `creado_en`, `actualizado_en`, `telefono`) VALUES
	(2, 'Organizacion', 'organizacion@gmail.com', '$2b$10$Ee8WM0o.vkMBtEiIxup1te1BzmbkuqWopMnbGNa1597TWX3WEsPPq', NULL, 'organizacion', '2025-10-30 14:47:44.729342', '2025-10-30 14:47:44.729342', NULL),
	(5, 'voluntario', 'Voluntario@gmail.com', '$2b$10$m313bns6ZvBYoEDBH3KS6.5kXi65GtAg/KHBylrX9nB7FqCEBBnIK', NULL, 'voluntario', '2025-11-06 15:51:20.641223', '2025-11-06 15:51:20.641223', NULL);

-- Volcando estructura para tabla afroimpacto_db.voluntario
CREATE TABLE IF NOT EXISTS `voluntario` (
  `id_voluntario` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `id_jornada` int NOT NULL,
  `id_estado` int NOT NULL,
  `disponibilidad` varchar(50) NOT NULL,
  `creado_en` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `actualizado_en` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id_voluntario`),
  UNIQUE KEY `REL_b9ff2b8aec5d19e99083c75fd3` (`id_usuario`),
  KEY `FK_ba654756ea424a96a61b0f6c42b` (`id_jornada`),
  KEY `FK_40b4a17baae6b4f06b6447f64a7` (`id_estado`),
  CONSTRAINT `FK_40b4a17baae6b4f06b6447f64a7` FOREIGN KEY (`id_estado`) REFERENCES `estado` (`id_estado`),
  CONSTRAINT `FK_b9ff2b8aec5d19e99083c75fd3e` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`),
  CONSTRAINT `FK_ba654756ea424a96a61b0f6c42b` FOREIGN KEY (`id_jornada`) REFERENCES `jornada` (`id_jornada`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla afroimpacto_db.voluntario: ~0 rows (aproximadamente)
INSERT INTO `voluntario` (`id_voluntario`, `id_usuario`, `id_jornada`, `id_estado`, `disponibilidad`, `creado_en`, `actualizado_en`) VALUES
	(4, 5, 1, 1, 'No disponible', '2025-11-06 15:51:20.938060', '2025-11-06 15:51:20.938060');

-- Volcando estructura para tabla afroimpacto_db.voluntario_habilidad
CREATE TABLE IF NOT EXISTS `voluntario_habilidad` (
  `id_voluntario` int NOT NULL,
  `id_habilidad` int NOT NULL,
  `tiempo_experiencia` varchar(50) NOT NULL,
  `nivel` enum('B├ísico','Intermedio','Avanzado') NOT NULL,
  `verificado` tinyint NOT NULL DEFAULT '0',
  PRIMARY KEY (`id_voluntario`,`id_habilidad`),
  KEY `FK_d1817a82c45d7ee2156b5126c2d` (`id_habilidad`),
  CONSTRAINT `FK_d1817a82c45d7ee2156b5126c2d` FOREIGN KEY (`id_habilidad`) REFERENCES `habilidad` (`id_habilidad`),
  CONSTRAINT `FK_ea071f223de95d33382af5856a5` FOREIGN KEY (`id_voluntario`) REFERENCES `voluntario` (`id_voluntario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla afroimpacto_db.voluntario_habilidad: ~0 rows (aproximadamente)

-- Volcando estructura para tabla afroimpacto_db.voluntario_logro
CREATE TABLE IF NOT EXISTS `voluntario_logro` (
  `id_voluntario_logro` int NOT NULL AUTO_INCREMENT,
  `id_voluntario` int NOT NULL,
  `id_logro` int NOT NULL,
  `fecha_obtenido` date NOT NULL,
  `proyecto_relacionado` int DEFAULT NULL,
  `creado_en` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id_voluntario_logro`),
  KEY `FK_voluntario_logro_voluntario` (`id_voluntario`),
  KEY `FK_voluntario_logro_logro` (`id_logro`),
  KEY `FK_voluntario_logro_proyecto` (`proyecto_relacionado`),
  KEY `idx_logro_voluntario_fecha` (`id_voluntario`,`fecha_obtenido`),
  CONSTRAINT `FK_voluntario_logro_logro` FOREIGN KEY (`id_logro`) REFERENCES `logro` (`id_logro`) ON DELETE CASCADE,
  CONSTRAINT `FK_voluntario_logro_proyecto` FOREIGN KEY (`proyecto_relacionado`) REFERENCES `proyecto` (`id_proyecto`) ON DELETE SET NULL,
  CONSTRAINT `FK_voluntario_logro_voluntario` FOREIGN KEY (`id_voluntario`) REFERENCES `voluntario` (`id_voluntario`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla afroimpacto_db.voluntario_logro: ~0 rows (aproximadamente)

-- Volcando estructura para disparador afroimpacto_db.trg_rol_validate_tipo
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `trg_rol_validate_tipo` BEFORE INSERT ON `rol` FOR EACH ROW BEGIN
  IF NEW.tipo_rol = 'sistema' AND (NEW.id_organizacion IS NOT NULL OR NEW.id_proyecto IS NOT NULL) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Los roles del sistema no pueden tener id_organizacion ni id_proyecto';
  END IF;
  
  IF NEW.tipo_rol = 'organizacion' AND (NEW.id_organizacion IS NULL OR NEW.id_proyecto IS NOT NULL) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Los roles de organización deben tener id_organizacion y no pueden tener id_proyecto';
  END IF;
  
  IF NEW.tipo_rol = 'proyecto' AND (NEW.id_proyecto IS NULL OR NEW.id_organizacion IS NOT NULL) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Los roles de proyecto deben tener id_proyecto y no pueden tener id_organizacion';
  END IF;
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador afroimpacto_db.trg_rol_validate_tipo_update
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `trg_rol_validate_tipo_update` BEFORE UPDATE ON `rol` FOR EACH ROW BEGIN
  IF NEW.tipo_rol = 'sistema' AND (NEW.id_organizacion IS NOT NULL OR NEW.id_proyecto IS NOT NULL) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Los roles del sistema no pueden tener id_organizacion ni id_proyecto';
  END IF;
  
  IF NEW.tipo_rol = 'organizacion' AND (NEW.id_organizacion IS NULL OR NEW.id_proyecto IS NOT NULL) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Los roles de organización deben tener id_organizacion y no pueden tener id_proyecto';
  END IF;
  
  IF NEW.tipo_rol = 'proyecto' AND (NEW.id_proyecto IS NULL OR NEW.id_organizacion IS NOT NULL) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Los roles de proyecto deben tener id_proyecto y no pueden tener id_organizacion';
  END IF;
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
