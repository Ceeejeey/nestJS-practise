import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}
  signin() {
    return {
      message: 'User signed in successfully',
    };
  }

  signup(dto: AuthDto) {
    return {
      message: 'User signed up successfully',
    };
  }
}
