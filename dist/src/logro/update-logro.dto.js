"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateLogroDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_logro_dto_1 = require("./create-logro.dto");
class UpdateLogroDto extends (0, mapped_types_1.PartialType)(create_logro_dto_1.CreateLogroDto) {
}
exports.UpdateLogroDto = UpdateLogroDto;
//# sourceMappingURL=update-logro.dto.js.map