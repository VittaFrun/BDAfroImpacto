"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateCertificadoDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_certificado_dto_1 = require("./create-certificado.dto");
class UpdateCertificadoDto extends (0, mapped_types_1.PartialType)(create_certificado_dto_1.CreateCertificadoDto) {
}
exports.UpdateCertificadoDto = UpdateCertificadoDto;
//# sourceMappingURL=update-certificado.dto.js.map