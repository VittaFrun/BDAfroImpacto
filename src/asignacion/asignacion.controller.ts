import { Controller, Post, Body, Get, Param, Delete, UseGuards } from '@nestjs/common';
import { AsignacionService } from './asignacion.service';
import { CreateAsignacionDto } from './create-asignacion.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { GetUser } from '../common/decorators/get-user.decorator';
import { Usuario } from '../users/user.entity';
import { SmartAssignmentService, SmartSuggestionRequest } from './smart-assignment.service';

@Controller('asignacion')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class AsignacionController {
  constructor(
    private readonly service: AsignacionService,
    private readonly smartAssignmentService: SmartAssignmentService
  ) {}

  @Post()
  @Roles('organizacion', 'admin')
  create(@Body() dto: CreateAsignacionDto, @GetUser() user: Usuario) {
    return this.service.create(dto, user);
  }

  @Get('tarea/:idTarea')
  @Roles('organizacion', 'admin')
  findAllByTarea(@Param('idTarea') idTarea: string) {
    return this.service.findAllByTarea(+idTarea);
  }

  @Get('voluntario/mis-tareas')
  @Roles('voluntario')
  findMyTasks(@GetUser() user: Usuario) {
    return this.service.findTasksByVoluntario(user.id_usuario);
  }

  @Get('voluntario/proyecto/:idProyecto')
  @Roles('voluntario')
  findAsignacionesByProyecto(@Param('idProyecto') idProyecto: string, @GetUser() user: Usuario) {
    return this.service.findAsignacionesByProyecto(+idProyecto, user.id_usuario);
  }

  @Delete(':id')
  @Roles('organizacion', 'admin')
  remove(@Param('id') id: string, @GetUser() user: Usuario) {
    return this.service.remove(+id, user);
  }

  @Get('voluntario/:idVoluntario/verificar')
  @Roles('organizacion', 'admin')
  checkVolunteerAssignments(@Param('idVoluntario') idVoluntario: string) {
    return this.service.getVolunteerAssignments(+idVoluntario);
  }

  @Get('voluntario/:idVoluntario/proyecto/:idProyecto/verificar')
  @Roles('organizacion', 'admin')
  checkVolunteerAssignmentsInProject(
    @Param('idVoluntario') idVoluntario: string,
    @Param('idProyecto') idProyecto: string
  ) {
    return this.service.checkVolunteerAssignmentsInProject(+idVoluntario, +idProyecto);
  }

  /**
   * Genera sugerencias inteligentes de asignación
   */
  @Post('smart-suggestions')
  @Roles('organizacion', 'admin')
  async generateSmartSuggestions(@Body() request: SmartSuggestionRequest, @GetUser() user: Usuario) {
    return await this.smartAssignmentService.generateSmartSuggestions(request);
  }
}
