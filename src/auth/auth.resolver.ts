import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { UserType } from 'src/user/type/user.type';
import { Request, Response } from 'express';
import { Cookie, Public } from 'libs/common/src/decorators';
import { UnauthorizedException } from '@nestjs/common';

@Public()
@Resolver()
export class AuthResolver {
  constructor(
    private authService: AuthService,
  ) {}

  @Mutation(() => String)
  async register(
    @Args('registerInput') dto: RegisterDto,
  ) {
    await this.authService.register(dto)
    return 'Registration successful';
  }

  @Mutation(() => UserType)
  async login(
    @Args('loginInput') dto: LoginDto,
    @Context() context: { res: Response, req: Request },
  ) {
    const user = await this.authService.login(dto);
    const tokens = await this.authService.generateTokens(user, user.id);

    await this.authService.setRefreshTokenToCookie(tokens.refreshToken, context.res)
    return {
      ...user,
      token: tokens.accessToken
    }
  }

  @Mutation(() => String)
  async logout(
    @Cookie('refreshToken') refreshToken: string,
    @Context() context: { res: Response },
  ) {
    if(refreshToken){
      await this.authService.deleteRefreshToken(refreshToken)
      context.res.clearCookie('refreshToken')
    }
    return 'Logout successful';
  }

  @Mutation(() => String)
  async refreshTokens(
    @Cookie('refreshToken') refreshToken: string,
    @Context() context: { res: Response }
  ) {
    if (!refreshToken) throw new UnauthorizedException()
    const tokens = await this.authService.refreshTokens(refreshToken)

    await this.authService.setRefreshTokenToCookie(tokens.refreshToken, context.res)
    return tokens.accessToken;
  }
}
