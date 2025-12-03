import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixRolSystem1760900000000 implements MigrationInterface {
    name = 'FixRolSystem1760900000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Eliminar triggers existentes
        await queryRunner.query(`DROP TRIGGER IF EXISTS trg_rol_validate_tipo`);
        await queryRunner.query(`DROP TRIGGER IF EXISTS trg_rol_validate_tipo_update`);

        // 2. Eliminar roles de sistema existentes (si los hay)
        await queryRunner.query(`DELETE FROM rol WHERE tipo_rol = 'sistema'`);

        // 3. Actualizar el enum para eliminar 'sistema'
        await queryRunner.query(`ALTER TABLE rol MODIFY COLUMN tipo_rol ENUM('organizacion', 'proyecto') NOT NULL DEFAULT 'organizacion'`);

        // 4. Crear nuevos triggers que solo validen 'organizacion' y 'proyecto'
        await queryRunner.query(`
            CREATE TRIGGER trg_rol_validate_tipo BEFORE INSERT ON rol FOR EACH ROW 
            BEGIN
              IF NEW.tipo_rol = 'organizacion' AND (NEW.id_organizacion IS NULL OR NEW.id_proyecto IS NOT NULL) THEN
                SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Los roles de organización deben tener id_organizacion y no pueden tener id_proyecto';
              END IF;
              
              IF NEW.tipo_rol = 'proyecto' AND (NEW.id_proyecto IS NULL OR NEW.id_organizacion IS NOT NULL) THEN
                SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Los roles de proyecto deben tener id_proyecto y no pueden tener id_organizacion';
              END IF;
            END
        `);

        await queryRunner.query(`
            CREATE TRIGGER trg_rol_validate_tipo_update BEFORE UPDATE ON rol FOR EACH ROW 
            BEGIN
              IF NEW.tipo_rol = 'organizacion' AND (NEW.id_organizacion IS NULL OR NEW.id_proyecto IS NOT NULL) THEN
                SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Los roles de organización deben tener id_organizacion y no pueden tener id_proyecto';
              END IF;
              
              IF NEW.tipo_rol = 'proyecto' AND (NEW.id_proyecto IS NULL OR NEW.id_organizacion IS NOT NULL) THEN
                SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Los roles de proyecto deben tener id_proyecto y no pueden tener id_organizacion';
              END IF;
            END
        `);

        // 5. Crear rol básico de organización para testing
        await queryRunner.query(`
            INSERT INTO rol (nombre, descripcion, tipo_rol, id_organizacion, activo, color, creado_por) 
            VALUES ('Administrador', 'Administrador de la organización', 'organizacion', 1, 1, '#FF5722', 2)
            ON DUPLICATE KEY UPDATE nombre = nombre
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revertir cambios si es necesario
        await queryRunner.query(`DROP TRIGGER IF EXISTS trg_rol_validate_tipo`);
        await queryRunner.query(`DROP TRIGGER IF EXISTS trg_rol_validate_tipo_update`);
        
        // Restaurar enum original (incluyendo sistema)
        await queryRunner.query(`ALTER TABLE rol MODIFY COLUMN tipo_rol ENUM('sistema', 'organizacion', 'proyecto') NOT NULL DEFAULT 'sistema'`);
        
        // Recrear triggers originales
        await queryRunner.query(`
            CREATE TRIGGER trg_rol_validate_tipo BEFORE INSERT ON rol FOR EACH ROW 
            BEGIN
              IF NEW.tipo_rol = 'sistema' AND (NEW.id_organizacion IS NOT NULL OR NEW.id_proyecto IS NOT NULL) THEN
                SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Los roles del sistema no pueden tener id_organizacion ni id_proyecto';
              END IF;
              
              IF NEW.tipo_rol = 'organizacion' AND (NEW.id_organizacion IS NULL OR NEW.id_proyecto IS NOT NULL) THEN
                SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Los roles de organización deben tener id_organizacion y no pueden tener id_proyecto';
              END IF;
              
              IF NEW.tipo_rol = 'proyecto' AND (NEW.id_proyecto IS NULL OR NEW.id_organizacion IS NOT NULL) THEN
                SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Los roles de proyecto deben tener id_proyecto y no pueden tener id_organizacion';
              END IF;
            END
        `);

        await queryRunner.query(`
            CREATE TRIGGER trg_rol_validate_tipo_update BEFORE UPDATE ON rol FOR EACH ROW 
            BEGIN
              IF NEW.tipo_rol = 'sistema' AND (NEW.id_organizacion IS NOT NULL OR NEW.id_proyecto IS NOT NULL) THEN
                SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Los roles del sistema no pueden tener id_organizacion ni id_proyecto';
              END IF;
              
              IF NEW.tipo_rol = 'organizacion' AND (NEW.id_organizacion IS NULL OR NEW.id_proyecto IS NOT NULL) THEN
                SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Los roles de organización deben tener id_organizacion y no pueden tener id_proyecto';
              END IF;
              
              IF NEW.tipo_rol = 'proyecto' AND (NEW.id_proyecto IS NULL OR NEW.id_organizacion IS NOT NULL) THEN
                SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Los roles de proyecto deben tener id_proyecto y no pueden tener id_organizacion';
              END IF;
            END
        `);
    }
}

