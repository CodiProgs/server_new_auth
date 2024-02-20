import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';
import { isPublic } from 'libs/common/src/decorators';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') implements CanActivate {
  constructor(private reflector: Reflector) {
    super()
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const _isPublic = isPublic(context, this.reflector)
    if (_isPublic) {
      return true
    }
    const ctx = GqlExecutionContext.create(context);
    const req = ctx.getContext().req
    return super.canActivate(new ExecutionContextHost([req]))
  }
}
