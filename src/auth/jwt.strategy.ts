import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../users/users.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private usersService: UsersService,
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    const user = await this.usersService.findOneByEmailWithRol(payload.email);
    if (!user) {
      throw new UnauthorizedException();
    }
    // Devolver id_usuario para mantener consistencia con la entidad Usuario
    return { 
      id_usuario: user.id_usuario, 
      id: user.id_usuario, // Mantener compatibilidad con código que usa 'id'
      email: user.email, 
      rol: user.rol, 
      tipo_usuario: user.tipo_usuario 
    };
  }
}