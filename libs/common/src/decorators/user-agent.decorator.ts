import { ExecutionContext, createParamDecorator } from "@nestjs/common";
import { Request } from "express";

export const UserAgent = createParamDecorator((_: string, ctx: ExecutionContext) => {
  const gqlCtx = ctx.getArgByIndex(2)
  const req: Request = gqlCtx.req
  return req.headers['user-agent']
})