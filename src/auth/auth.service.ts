import { ForbiddenException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from 'generated/prisma/runtime/library';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async signin(dto: AuthDto) {
    //find the user by email
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });
    //if no user throw an exception
    if (!user) throw new ForbiddenException('Credentials incorrect');

    //if user exists compare the password
    const isPasswordValid = await argon.verify(user.password, dto.password);
    //if password is incorrect throw an error
    if (!isPasswordValid) throw new ForbiddenException('Credentials incorrect');
    //if password is correct return the user

    return this.signToken(user.id, user.email);
  }

  async signToken(
    userId: number,
    email: string,
  ): Promise<{ access_token: string }> {
    const payload = {
      sub: userId,
      email,
    };
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const secret = this.config.get('JWT_SECRET');

    const token = await this.jwt.signAsync(payload, {
      expiresIn: '15m',
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      secret: secret,
    });

    return {
      access_token: token,
    };
  }

  async signup(dto: AuthDto) {
    //generate the password hash
    const hash = await argon.hash(dto.password);

    //save the user to the
    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          password: hash,
        },
        //this is returning also the  password so lets delete the password
        select: {
          id: true,
          email: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      //return the user

      return user;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          //this is a unique constraint violation
          throw new ForbiddenException('Email already exists');
        }
      }
      throw error;
    }
  }
}
