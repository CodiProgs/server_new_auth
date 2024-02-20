import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UserService } from './user.service';
import { UserType } from './type/user.type';
import { JwtPayload } from 'src/auth/interfaces';
import * as GraphQLUpload from 'graphql-upload/GraphQLUpload.js';
import { FileService } from 'src/file/file.service';
import { UpdateUserDto } from './dto/user.dto';
import { Roles, CurrentUser } from 'libs/common/src/decorators';
import { UseGuards } from '@nestjs/common';
import { RolesGuard } from 'src/auth/guards/role.guard';

@Resolver()
export class UserResolver {
  constructor(
    private readonly userService: UserService,
    private readonly fileService: FileService
  ) {}

  @Query(() => UserType)
  async getUserProfile(
    @Args('email') email: string,
  ) {
    return await this.userService.findOne(email)
  }

  @Mutation(() => String)
  async deleteUser(
    @Args('id') id: string,
    @CurrentUser() user: JwtPayload
  ){
    return await this.userService.delete(id, user)
  }

  @Mutation(() => String)
  async updateUser(
    @CurrentUser('id') id: string,
    @Args('dto') dto: UpdateUserDto,
  ){
    return await this.userService.update(id, dto)
  }

  @Mutation(() => String)
  async updateImage(
    @Args({ name: 'image', type: () => GraphQLUpload }) image: any,
    @CurrentUser('id') id: string
  ) {
    const imagePath = await this.fileService.saveImage(image, 'avatars')
    await this.userService.updateImage(id, imagePath)
    return imagePath
  }

  //test the role guard
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Query(() => String)
  async admin() {
    return 'admin'
  }
}
