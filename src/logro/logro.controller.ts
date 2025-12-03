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
import { LogroService } from './logro.service';
import { CreateLogroDto } from './create-logro.dto';
import { UpdateLogroDto } from './update-logro.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('logro')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class LogroController {
  constructor(private readonly logroService: LogroService) {}

  @Post()
  @Roles('admin')
  create(@Body() createLogroDto: CreateLogroDto) {
    return this.logroService.create(createLogroDto);
  }

  @Get()
  findAll(@Query('tipo') tipo?: string) {
    if (tipo) {
      return this.logroService.findByType(tipo);
    }
    return this.logroService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.logroService.findOne(+id);
  }

  @Patch(':id')
  @Roles('admin')
  update(@Param('id') id: string, @Body() updateLogroDto: UpdateLogroDto) {
    return this.logroService.update(+id, updateLogroDto);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.logroService.remove(+id);
  }
}

