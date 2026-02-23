import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from "@nestjs/common";
import { CreateAuthDto } from "./dto/create-auth.dto";
import { UpdateAuthDto } from "./dto/update-auth.dto";
import { Auth } from "./entities/auth.entity";
import * as bcrypt from "bcrypt";
import * as nodemailer from "nodemailer";
import { LoginAuthDto } from "./dto/login-auth.dto";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { VerifyAuthDto } from "./dto/verify.dto";

@Injectable()
export class AuthService {
  private transporter: nodemailer.Transporter;
  constructor(
    @InjectRepository(Auth) private authRepository: Repository<Auth>,
    private jwtService: JwtService,
  ) {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "behzod2366@gmail.com",
        pass: process.env.APP_KEY,
      },
    });
  }

  async register(createAuthDto: CreateAuthDto): Promise<{message: string}> {
try {
    const { username, email, password } = createAuthDto;
    const foundUser = await this.authRepository.findOne({ where: { email } });

    if (foundUser) throw new BadRequestException("email alredy exist");

    const hashpassword = await bcrypt.hash(password, 10);
    const time = Date.now() + 120000
    const code = Math.floor(100000 + Math.random() * 900000)
    await this.transporter.sendMail({
      from: "behzod2366@gmail.com",
      to: email,
      subject: "otp",
      text: `akkauntingizni tasdiqlashingiz uchun kod: ${code}`,
      html: `<b>${code}<b>`,
    });

    const user = this.authRepository.create({ username, email, password: hashpassword, otp: String(code), otpTime: time });
    await this.authRepository.save(user);
    return {message: "registered"}
} catch (error) {
  throw new InternalServerErrorException(error.message)
}
  }


  async verify(verifyAuthDto: VerifyAuthDto ): Promise<{access_token: string}> {
    try {
    const {email, otp} = verifyAuthDto;
    const foundUser = await this.authRepository.findOne({ where: { email } });

    if (!foundUser) throw new BadRequestException("user not found");
    
    const time = Date.now()
    if(time > foundUser.otpTime) throw new BadRequestException("otp time is expired")

      if(otp !== foundUser.otp) throw new BadRequestException("otp expired")

        const otpValidation = /^\d{6}$/.test(otp)

        if(!otpValidation) throw new BadRequestException("wrong otp validation")

          await this.authRepository.update(foundUser.id, {otp: "", otpTime: 0})

        const payload = { id: foundUser.id, email: foundUser.email, roles: foundUser.role}
        const access_token = await this.jwtService.signAsync(payload)

        return {
          access_token
        }
      }catch (error) {
        throw new InternalServerErrorException(error.message)
      }
  }

  async login(loginAuthDto: LoginAuthDto): Promise<{ messaga: string }> {
    const { email, password } = loginAuthDto;
    const foundUser = await this.authRepository.findOne({ where: { email } });

    if (!foundUser) throw new UnauthorizedException("user not found");

    const comp = await bcrypt.compare(password, foundUser.password);
    if (comp) {
     const code = Math.floor(100000 + Math.random() * 900000)
    await this.transporter.sendMail({
      from: "behzod2366@gmail.com",
      to: email,
      subject: "otp",
      text: `akkauntingizni tasdiqlashingiz uchun kod: ${code}`,
      html: `<b>${code}<b>`,
    });

    const time = Date.now() + 120000

    await this.authRepository.update(foundUser.id, {otp: String(code), otpTime: time})
    return { messaga: "otp sent. please check your email " };
    } else {
      return { messaga: "wrong password" };
    }
  }

  // async findAll(): Promise<Auth[]> {
  //   return await this.authModel.findAll();
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} auth`;
  // }

  // update(id: number, updateAuthDto: UpdateAuthDto) {
  //   return `This action updates a #${id} auth`;
  // }

  async remove(id: number): Promise<boolean> {
   await this.authRepository.delete(id);
    return true
  }
}
