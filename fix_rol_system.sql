-- Script para actualizar la base de datos y eliminar roles de sistema
-- Según el diagrama.txt, solo deben existir roles 'organizacion' y 'proyecto'

-- 1. Eliminar triggers que validan 'sistema'
DROP TRIGGER IF EXISTS trg_rol_validate_tipo;
DROP TRIGGER IF EXISTS trg_rol_validate_tipo_update;

-- 2. Eliminar roles de sistema existentes (si los hay)
DELETE FROM rol WHERE tipo_rol = 'sistema';

-- 3. Actualizar el enum para eliminar 'sistema'
ALTER TABLE rol MODIFY COLUMN tipo_rol ENUM('organizacion', 'proyecto') NOT NULL DEFAULT 'organizacion';

-- 4. Crear nuevos triggers que solo validen 'organizacion' y 'proyecto'
DELIMITER //
CREATE TRIGGER trg_rol_validate_tipo BEFORE INSERT ON rol FOR EACH ROW 
BEGIN
  IF NEW.tipo_rol = 'organizacion' AND (NEW.id_organizacion IS NULL OR NEW.id_proyecto IS NOT NULL) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Los roles de organización deben tener id_organizacion y no pueden tener id_proyecto';
  END IF;
  
  IF NEW.tipo_rol = 'proyecto' AND (NEW.id_proyecto IS NULL OR NEW.id_organizacion IS NOT NULL) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Los roles de proyecto deben tener id_proyecto y no pueden tener id_organizacion';
  END IF;
END//

CREATE TRIGGER trg_rol_validate_tipo_update BEFORE UPDATE ON rol FOR EACH ROW 
BEGIN
  IF NEW.tipo_rol = 'organizacion' AND (NEW.id_organizacion IS NULL OR NEW.id_proyecto IS NOT NULL) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Los roles de organización deben tener id_organizacion y no pueden tener id_proyecto';
  END IF;
  
  IF NEW.tipo_rol = 'proyecto' AND (NEW.id_proyecto IS NULL OR NEW.id_organizacion IS NOT NULL) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Los roles de proyecto deben tener id_proyecto y no pueden tener id_organizacion';
  END IF;
END//
DELIMITER ;

-- 5. Crear algunos roles básicos para testing
-- Rol básico de organización (ajustar id_organizacion según tu organización)
INSERT INTO rol (nombre, descripcion, tipo_rol, id_organizacion, activo, color, creado_por) 
VALUES ('Administrador', 'Administrador de la organización', 'organizacion', 1, 1, '#FF5722', 2)
ON DUPLICATE KEY UPDATE nombre = nombre;

-- Rol básico de proyecto (se creará cuando se necesite para un proyecto específico)
-- Este se puede crear desde la interfaz una vez que esté funcionando

