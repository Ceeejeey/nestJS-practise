import { Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  signup() {
    return {
      message: 'User signed up successfully',
      user: { username: 'exampleUser' },
    };
  }

  @Post('signin')
  signin() {
    return {
      message: 'User signed in successfully',
      user: { username: 'exampleUser' },
    };
  }
}
