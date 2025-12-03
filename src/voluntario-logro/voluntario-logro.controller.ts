import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { VoluntarioLogroService } from './voluntario-logro.service';
import { CreateVoluntarioLogroDto } from './create-voluntario-logro.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('voluntario-logro')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class VoluntarioLogroController {
  constructor(private readonly voluntarioLogroService: VoluntarioLogroService) {}

  @Post()
  @Roles('organizacion', 'admin')
  create(@Body() createVoluntarioLogroDto: CreateVoluntarioLogroDto) {
    return this.voluntarioLogroService.create(createVoluntarioLogroDto);
  }

  @Get()
  findAll(@Query('voluntario') idVoluntario?: number, @Query('proyecto') idProyecto?: number) {
    if (idVoluntario) {
      return this.voluntarioLogroService.findByVolunteer(idVoluntario);
    }
    if (idProyecto) {
      return this.voluntarioLogroService.findByProject(idProyecto);
    }
    return [];
  }

  @Get('puntos/:idVoluntario')
  getVolunteerPoints(@Param('idVoluntario') idVoluntario: string) {
    return this.voluntarioLogroService.getVolunteerPoints(+idVoluntario);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.voluntarioLogroService.findOne(+id);
  }

  @Delete(':id')
  @Roles('organizacion', 'admin')
  remove(@Param('id') id: string) {
    return this.voluntarioLogroService.remove(+id);
  }
}

