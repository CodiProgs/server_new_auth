import { Field, InputType } from "@nestjs/graphql";
import { IsNotEmpty, IsOptional, IsString, Length, } from "class-validator";

@InputType()
export class UpdateUserDto {
  @Field()
  @IsNotEmpty({ message: 'Name should not be empty' })
  @IsString({ message: 'Name should be a string' })
  @Length(3, 20, { message: 'Name should be between 3 and 20 characters' })
  name: string

  @Field({ nullable: true })
  @IsOptional()
  @IsString({ message: 'Surname should be a string' })
  @Length(3, 20, { message: 'Surname should be between 3 and 20 characters' })
  surname?: string
}