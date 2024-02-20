import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { UserModule } from 'src/user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { options } from './config/jwt-module-async-option';
import { JwtStrategy } from './strategies/jwt.strategy';
import { FileModule } from 'src/file/file.module';
import { GUARDS } from './guards';

@Module({
  providers: [AuthService, AuthResolver, ...GUARDS, JwtStrategy],
  imports: [UserModule, JwtModule.registerAsync(options()), FileModule],
})
export class AuthModule {}
