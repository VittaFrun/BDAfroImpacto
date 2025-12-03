import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { Mensaje } from './mensaje.entity';
import { Conversacion } from './conversacion.entity';
import { MensajeService } from './mensaje.service';
import { MensajeController } from './mensaje.controller';
import { MensajeGateway } from './mensaje.gateway';

@Module({
  imports: [
    TypeOrmModule.forFeature([Mensaje, Conversacion]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
    }),
  ],
  controllers: [MensajeController],
  providers: [MensajeService, MensajeGateway],
  exports: [MensajeService, MensajeGateway],
})
export class MensajeModule {}

