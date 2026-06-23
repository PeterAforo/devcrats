import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  Res,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { EmailService } from '../notifications/channels/email.service';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly emailService: EmailService,
  ) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  async login(
    @Body() dto: LoginDto,
    @Req() req: any,
    @Res({ passthrough: true }) res: any,
  ) {
    const result = await this.authService.login(
      dto,
      req.ip,
      req.headers['user-agent'],
    );

    res.cookie('refresh_token', result.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/api/v1/auth',
    });

    return {
      user: result.user,
      accessToken: result.accessToken,
      expiresIn: result.expiresIn,
    };
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  async refresh(
    @Req() req: any,
    @Res({ passthrough: true }) res: any,
  ) {
    const refreshToken = req.cookies?.['refresh_token'];
    if (!refreshToken) {
      return res.status(401).json({ success: false, message: 'No refresh token' });
    }

    const tokens = await this.authService.refreshTokens(refreshToken);

    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/api/v1/auth',
    });

    return {
      accessToken: tokens.accessToken,
      expiresIn: tokens.expiresIn,
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout and revoke refresh token' })
  async logout(
    @Req() req: any,
    @Res({ passthrough: true }) res: any,
  ) {
    const refreshToken = req.cookies?.['refresh_token'];
    if (refreshToken) {
      await this.authService.logout(refreshToken);
    }

    res.clearCookie('refresh_token', { path: '/api/v1/auth' });
    return { message: 'Logged out successfully' };
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  async getProfile(@CurrentUser('id') userId: string) {
    return this.authService.getProfile(userId);
  }

  @Patch('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update current user profile' })
  async updateProfile(
    @CurrentUser('id') userId: string,
    @Body() body: { firstName?: string; lastName?: string; phone?: string; avatarUrl?: string },
  ) {
    return this.authService.updateProfile(userId, body);
  }

  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change password' })
  async changePassword(
    @CurrentUser('id') userId: string,
    @Body() body: { currentPassword: string; newPassword: string },
  ) {
    return this.authService.changePassword(userId, body.currentPassword, body.newPassword);
  }

  @Get('sessions')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get active sessions' })
  async getSessions(@CurrentUser('id') userId: string) {
    return this.authService.getSessions(userId);
  }

  @Delete('sessions/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Revoke a session' })
  async revokeSession(
    @CurrentUser('id') userId: string,
    @Param('id') sessionId: string,
  ) {
    return this.authService.revokeSession(userId, sessionId);
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset email' })
  async forgotPassword(@Body() body: { email: string }) {
    const result = await this.authService.forgotPassword(body.email);

    // Send reset email if token was generated
    if (result.resetToken && result.firstName) {
      await this.emailService.sendPasswordReset(body.email, result.resetToken, result.firstName);
    }

    // Don't expose resetToken to client
    return { message: result.message };
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password using token' })
  async resetPassword(@Body() body: { token: string; password: string }) {
    return this.authService.resetPassword(body.token, body.password);
  }
}
