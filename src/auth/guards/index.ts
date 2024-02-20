import { JwtAuthGuard } from "./jwt.guard";
import { RolesGuard } from "./role.guard";

export const GUARDS = [JwtAuthGuard, RolesGuard]