import { ExecutionContext, createParamDecorator } from "@nestjs/common";
import { JwtPayload } from "src/auth/interfaces";

export const CurrentUser = createParamDecorator((key: keyof JwtPayload, ctx: ExecutionContext): JwtPayload | Partial<JwtPayload> => {
  const gqlCtx = ctx.getArgByIndex(2)
  const req: Request = gqlCtx.req

  return key ? req['user'][key] : req['user']
})