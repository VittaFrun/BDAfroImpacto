"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogroModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const logro_service_1 = require("./logro.service");
const logro_controller_1 = require("./logro.controller");
const logro_entity_1 = require("./logro.entity");
let LogroModule = class LogroModule {
};
exports.LogroModule = LogroModule;
exports.LogroModule = LogroModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([logro_entity_1.Logro])],
        controllers: [logro_controller_1.LogroController],
        providers: [logro_service_1.LogroService],
        exports: [logro_service_1.LogroService],
    })
], LogroModule);
//# sourceMappingURL=logro.module.js.map