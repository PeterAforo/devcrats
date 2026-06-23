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

// Body parser middleware - must be before NestJS
server.use(express.json({ limit: '10mb', verify: (req, res, buf) => {
  // Store raw body for debugging
  (req as any).rawBody = buf;
  return true;
}}));
server.use(express.urlencoded({ extended: true, limit: '10mb' }));

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
  // Always set CORS headers FIRST - before any other processing
  const origin = req.headers?.origin || req.headers?.Origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With');
  }

  console.log('Incoming request:', { method: req.method, url: req.url, contentType: req.headers['content-type'] });
  
  // In Vercel, body might come as a stream or already parsed
  if (req.body) {
    console.log('req.body type:', typeof req.body);
    console.log('req.body value:', JSON.stringify(req.body));
  } else {
    console.log('req.body is undefined, reading from stream...');
    // Try to read from stream
    const chunks: Buffer[] = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const body = Buffer.concat(chunks).toString();
    console.log('Stream body:', body);
    try {
      req.body = JSON.parse(body);
    } catch (e) {
      console.log('Failed to parse stream body as JSON');
    }
  }

  // Handle preflight immediately
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  try {
    console.log('Bootstrapping server...');
    const app = await bootstrapServer();
    console.log('Server bootstrapped, getting instance...');
    const instance = app.getHttpAdapter().getInstance() as any;
    console.log('Got instance, calling handler...');
    instance(req, res);
  } catch (error: any) {
    console.error('Serverless Handler Error:', error);
    console.error('Error stack:', error.stack);
    // Ensure CORS headers are set on error response
    if (origin) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
}
