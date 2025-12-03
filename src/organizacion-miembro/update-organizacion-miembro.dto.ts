import { PartialType } from '@nestjs/mapped-types';
import { CreateOrganizacionMiembroDto } from './create-organizacion-miembro.dto';

export class UpdateOrganizacionMiembroDto extends PartialType(CreateOrganizacionMiembroDto) {}

