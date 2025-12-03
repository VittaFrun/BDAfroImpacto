import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { CertificadoService } from './certificado.service';
import { CreateCertificadoDto } from './create-certificado.dto';
import { UpdateCertificadoDto } from './update-certificado.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { GetUser } from '../common/decorators/get-user.decorator';

@Controller('certificado')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class CertificadoController {
  constructor(private readonly certificadoService: CertificadoService) {}

  @Post()
  @Roles('organizacion', 'admin')
  create(@Body() createCertificadoDto: CreateCertificadoDto, @GetUser() user: any) {
    return this.certificadoService.create(createCertificadoDto, user.id_usuario);
  }

  @Get()
  findAll(@Query('voluntario') idVoluntario?: number, @Query('proyecto') idProyecto?: number) {
    if (idVoluntario) {
      return this.certificadoService.findByVolunteer(idVoluntario);
    }
    if (idProyecto) {
      return this.certificadoService.findByProject(idProyecto);
    }
    return this.certificadoService.findAll();
  }

  @Get('verificar/:codigo')
  findByVerificationCode(@Param('codigo') codigo: string) {
    return this.certificadoService.findByVerificationCode(codigo);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.certificadoService.findOne(+id);
  }

  @Patch(':id')
  @Roles('organizacion', 'admin')
  update(@Param('id') id: string, @Body() updateCertificadoDto: UpdateCertificadoDto) {
    return this.certificadoService.update(+id, updateCertificadoDto);
  }

  @Delete(':id')
  @Roles('organizacion', 'admin')
  remove(@Param('id') id: string) {
    return this.certificadoService.remove(+id);
  }
}

