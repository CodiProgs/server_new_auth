import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { UserService } from 'src/user/user.service';
import { Token, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { v4 } from 'uuid';
import { add } from 'date-fns';
import { Response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private prisma: PrismaService,
    private config: ConfigService
  ) {}

  async register(dto: RegisterDto) {
    return await this.userService.create(dto);
  }

  async login(dto: LoginDto) {
    const user: User = await this.userService.findOne(dto.email, true)
    if (!(await bcrypt.compare(dto.password, user.password))) {
      throw new BadRequestException('Wrong email or password')
    }
    return user;
  }

  async generateTokens(user: User, userId: string) {
    const accessToken = await this.jwtService.signAsync({ id: user.id, email: user.email, roles: user.roles })
    const refreshToken = await this.getRefreshToken(user.id, userId)

    return { accessToken, refreshToken }
  }

  private async getRefreshToken(token: string, userId: string) {
    await this.prisma.token.deleteMany({ where: { userId, exp: { lte: new Date() } } })

    const newToken = v4();
    const exp = add(new Date(), { days: 30 });

    return await this.prisma.token.upsert({
      where: { token },
      update: { token: newToken, exp },
      create: { token: newToken, userId, exp }
    })
  }

  async setRefreshTokenToCookie(token: Token, res: Response) {
    res.cookie('refreshToken', token.token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: await this.config.get('NODE_ENV', 'development') === 'production',
      path: '/',
      expires: new Date(token.exp)
    })
  }

  async deleteRefreshToken(refreshToken: string) {
    return await this.prisma.token.delete({ where: { token: refreshToken } }).catch((_) => { return null })
  }

  async refreshTokens(refreshToken: string) {
    const token = await this.prisma.token.findUnique({ where: { token: refreshToken } })
    if (!token || new Date(token.exp) < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token')
    }
    const user = await this.userService.findOne(token.userId)
    return await this.generateTokens(user, token.userId)
  }
}