"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FixRolSystem1760900000000 = void 0;
class FixRolSystem1760900000000 {
    constructor() {
        this.name = 'FixRolSystem1760900000000';
    }
    async up(queryRunner) {
        await queryRunner.query(`DROP TRIGGER IF EXISTS trg_rol_validate_tipo`);
        await queryRunner.query(`DROP TRIGGER IF EXISTS trg_rol_validate_tipo_update`);
        await queryRunner.query(`DELETE FROM rol WHERE tipo_rol = 'sistema'`);
        await queryRunner.query(`ALTER TABLE rol MODIFY COLUMN tipo_rol ENUM('organizacion', 'proyecto') NOT NULL DEFAULT 'organizacion'`);
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
        await queryRunner.query(`
            INSERT INTO rol (nombre, descripcion, tipo_rol, id_organizacion, activo, color, creado_por) 
            VALUES ('Administrador', 'Administrador de la organización', 'organizacion', 1, 1, '#FF5722', 2)
            ON DUPLICATE KEY UPDATE nombre = nombre
        `);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP TRIGGER IF EXISTS trg_rol_validate_tipo`);
        await queryRunner.query(`DROP TRIGGER IF EXISTS trg_rol_validate_tipo_update`);
        await queryRunner.query(`ALTER TABLE rol MODIFY COLUMN tipo_rol ENUM('sistema', 'organizacion', 'proyecto') NOT NULL DEFAULT 'sistema'`);
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
exports.FixRolSystem1760900000000 = FixRolSystem1760900000000;
//# sourceMappingURL=1760900000000-FixRolSystem.js.map