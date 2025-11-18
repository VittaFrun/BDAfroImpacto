-- Script para crear las tablas de historial de eliminaciones y notificaciones
-- Ejecutar este script en la base de datos MySQL

-- Tabla: eliminacion_historial
CREATE TABLE IF NOT EXISTS `eliminacion_historial` (
  `id_eliminacion` int NOT NULL AUTO_INCREMENT,
  `tipo_entidad` varchar(50) NOT NULL,
  `id_entidad` int NOT NULL,
  `nombre_entidad` text,
  `descripcion` text,
  `id_proyecto` int DEFAULT NULL,
  `id_usuario_eliminador` int NOT NULL,
  `razon` text,
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

-- Tabla: notificacion
CREATE TABLE IF NOT EXISTS `notificacion` (
  `id_notificacion` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `titulo` varchar(100) NOT NULL,
  `mensaje` text NOT NULL,
  `tipo` varchar(50) NOT NULL DEFAULT 'info',
  `leida` tinyint(1) NOT NULL DEFAULT '0',
  `id_proyecto` int DEFAULT NULL,
  `tipo_entidad` varchar(50) DEFAULT NULL,
  `id_entidad` int DEFAULT NULL,
  `datos_adicionales` json DEFAULT NULL,
  `fecha_creacion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_notificacion`),
  KEY `idx_usuario` (`id_usuario`),
  KEY `idx_proyecto` (`id_proyecto`),
  KEY `idx_leida` (`leida`),
  KEY `idx_fecha` (`fecha_creacion`),
  CONSTRAINT `fk_notificacion_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE,
  CONSTRAINT `fk_notificacion_proyecto` FOREIGN KEY (`id_proyecto`) REFERENCES `proyecto` (`id_proyecto`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

