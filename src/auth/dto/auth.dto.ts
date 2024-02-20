import { Field, InputType } from "@nestjs/graphql";
import { IsEmail, IsNotEmpty, IsString, Length, MinLength, Validate } from "class-validator";
import { IsPasswordsMatching } from "libs/common/src/decorators";

@InputType()
export class RegisterDto {
  @Field()
  @IsNotEmpty({ message: 'Name is required' })
  @IsString({ message: 'Name should be a string' })
  @Length(3, 20, { message: 'Name should be between 3 and 20 characters' })
  name: string;

  @Field()
  @IsNotEmpty({ message: 'Surname is required' })
  @IsString({ message: 'Surname should be a string' })
  @Length(3, 20, { message: 'Surname should be between 3 and 20 characters' })
  surname: string;

  @Field()
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Invalid email' })
  email: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  nickname: string;

  @Field()
  @IsNotEmpty({ message: 'Password is required' })
  @IsString({ message: 'Password should be a string' })
  @MinLength(6, { message: 'Password should be at least 6 characters' })
  password: string;

  @Field()
  @IsNotEmpty({ message: 'Password confirmation is required' })
  @Validate(IsPasswordsMatching)
  passwordConfirm: string;
}

@InputType()
export class LoginDto {
  @Field()
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Invalid email' })
  email: string;

  @Field()
  @IsNotEmpty({ message: 'Password is required' })
  @IsString({ message: 'Password should be a string' })
  password: string;
}