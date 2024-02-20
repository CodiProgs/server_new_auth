import { ExecutionContext, SetMetadata } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

export const Public = () => SetMetadata('isPublic', true)

export const isPublic = (ctx: ExecutionContext, reflector: Reflector) => {
  const isPublic = reflector.getAllAndOverride<boolean>('isPublic', [
    ctx.getHandler(),
    ctx.getClass(),
  ])
  return isPublic
}