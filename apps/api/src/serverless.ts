import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ExpressAdapter } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import cors from 'cors';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import express from 'express';

const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'https://devcrats.vercel.app',
  'https://devcrats-web.vercel.app',
];

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    const allowedOrigins = process.env.CORS_ORIGINS
      ? process.env.CORS_ORIGINS.split(',')
      : ALLOWED_ORIGINS;
    // Allow requests with no origin (mobile apps, curl, etc)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all for now to debug
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

const server = express();
// Register CORS at the Express level FIRST - before NestJS middleware
server.use(cors(corsOptions));

let cachedApp: NestExpressApplication;

async function bootstrapServer(): Promise<NestExpressApplication> {
  if (cachedApp) {
    return cachedApp;
  }

  const expressAdapter = new ExpressAdapter(server);
  const app = await NestFactory.create<NestExpressApplication>(AppModule, expressAdapter);

  app.setGlobalPrefix('api/v1', { exclude: ['/'] });

  app.use(helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: false }));
  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('EstateIQ API')
    .setDescription('Smart Estate Management System API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  await app.init();
  cachedApp = app;
  return app;
}

export default async function handler(req: any, res: any) {
  // Always set CORS headers directly on the response object
  const origin = req.headers?.origin || req.headers?.Origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With');
  }

  // Handle preflight immediately
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  try {
    const app = await bootstrapServer();
    const instance = app.getHttpAdapter().getInstance() as any;
    instance(req, res);
  } catch (error: any) {
    console.error('Serverless Handler Error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
}
