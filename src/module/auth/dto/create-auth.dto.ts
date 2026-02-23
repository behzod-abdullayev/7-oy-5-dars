import { IsEmail, IsNumber, IsString, Length } from "class-validator";

export class CreateAuthDto {
  @IsString({ message: "username string bo'lishi kerak" })
  @Length(3, 50)
  username: string;

  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
