import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { BadRequestException, ConflictException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { convertToSeconds } from 'libs/common/src/utils';
import { ConfigService } from '@nestjs/config';
import { Provider, Role, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from 'src/auth/interfaces';
import { FileService } from 'src/file/file.service';
import { UpdateUserDto } from './dto/user.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly config: ConfigService,
    private readonly fileService: FileService
  ) {}

  async findOne(emailOrId: string, isRefresh = false) {
    if (!isRefresh) {
      const user: User = await this.cacheManager.get(emailOrId);
      if (user) {
        return user;
      }
    }
    const user = await this.prisma.user.findFirst({
      where: { 
        OR: [
          { id: emailOrId },
          { email: emailOrId },
        ]
      },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.updateUserInCache(user);
    return user;
  }

  async create(user: Partial<User>, provider: Provider = 'LOCAL') {
    const existingUser = await this.prisma.user.findUnique({ where: { email: user.email } });
    if (existingUser) throw new ConflictException('Email already exists');

    const hashedPassword = user.password ? await bcrypt.hash(user.password, 10) : null;

    return await this.prisma.user.create({
      data: {
        email: user.email,
        name: user.name,
        surname: user.surname,
        avatar: user.avatar,
        nickname: user.nickname,
        roles: ['USER'],
        provider: provider,
        password: hashedPassword,
      }
    });
  }

  async delete(id: string, user: JwtPayload) {
    if (user.id !== id && !user.roles.includes(Role.ADMIN)) {
      throw new ForbiddenException('You are not allowed to delete this user')
    }

    const deletedUser = await this.findOne(id, true);
    if (!deletedUser) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.$transaction(async prisma => [
      prisma.user.delete({ where: { id } }),
      this.fileService.deleteImage(deletedUser.avatar),
      this.cacheManager.store.mdel(`user:${id}`, `user:${deletedUser.email}`)
    ]);

    return deletedUser.id
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.findOne(id)
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.$transaction(async prisma => [
      prisma.user.update({
        where: { id },
        data: { ...dto }
      }),
      this.updateUserInCache({ ...user, ...dto })
    ]);

    return 'User updated successfully'
  }

  async updateImage(id: string, imagePath: string) {
    const user = await this.findOne(id)
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.prisma.$transaction(async prisma => [
      prisma.user.update({
        where: { id },
        data: {
          avatar: imagePath
        }
      }),
      this.fileService.deleteImage(user.avatar),
      this.updateUserInCache({ ...user, avatar: imagePath})
    ]);
    return 'Image updated successfully'
  }

  async updateUserInCache(user: User) {
    await this.cacheManager.store.mset([
      [`user:${user.id}`, user],
      [`user:${user.email}`, user],
    ], convertToSeconds(this.config.get('JWT_EXP')))
  }
}