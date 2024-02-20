import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";
import { RegisterDto } from "src/auth/dto/auth.dto";

@ValidatorConstraint({ name: "IsPasswordsMatching", async: false })
export class IsPasswordsMatching implements ValidatorConstraintInterface {
  validate(passwordConfirmation: string, args: ValidationArguments) {
    const obj = args.object as RegisterDto
    return obj.password === obj.passwordConfirm
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    return 'Passwords do not match'
  }

}