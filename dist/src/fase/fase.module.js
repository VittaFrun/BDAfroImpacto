"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FaseModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const fase_entity_1 = require("./fase.entity");
const fase_service_1 = require("./fase.service");
const fase_controller_1 = require("./fase.controller");
const proyecto_entity_1 = require("../proyecto/proyecto.entity");
const tarea_entity_1 = require("../tarea/tarea.entity");
let FaseModule = class FaseModule {
};
exports.FaseModule = FaseModule;
exports.FaseModule = FaseModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([fase_entity_1.Fase, proyecto_entity_1.Proyecto, tarea_entity_1.Tarea])],
        controllers: [fase_controller_1.FaseController],
        providers: [fase_service_1.FaseService],
    })
], FaseModule);
//# sourceMappingURL=fase.module.js.map