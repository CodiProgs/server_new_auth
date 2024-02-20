import { ExecutionContext, createParamDecorator } from "@nestjs/common";
import { Request } from "express";

export const Cookie = createParamDecorator((key: string, ctx: ExecutionContext) => {
  const gqlCtx = ctx.getArgByIndex(2)
  const req: Request = gqlCtx.req
  return key ? req.cookies[key] : key ? null : req.cookies
})