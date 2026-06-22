import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ExpressAdapter } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import express from 'express';

const server = express();

let cachedApp: NestExpressApplication;

async function bootstrapServer(): Promise<NestExpressApplication> {
  if (cachedApp) {
    console.log('Serverless: Using cached app');
    return cachedApp;
  }

  console.log('Serverless: Bootstrapping NestJS app');
  const expressAdapter = new ExpressAdapter(server);
  const app = await NestFactory.create<NestExpressApplication>(AppModule, expressAdapter);
  console.log('Serverless: NestJS app created');

  app.setGlobalPrefix('api/v1');
  console.log('Serverless: Global prefix set to api/v1');

  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(cookieParser());

  const corsOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',')
    : ['http://localhost:3000', 'https://devcrats.vercel.app'];

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });

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
  console.log('Serverless: App initialized');
  cachedApp = app;
  return app;
}

export default async function handler(req: any, res: any) {
  console.log('Serverless Handler:', { method: req.method, url: req.url, path: req.path });
  
  try {
    const app = await bootstrapServer();
    console.log('Serverless Handler: App bootstrapped');
    const instance = app.getHttpAdapter().getInstance() as any;
    console.log('Serverless Handler: Got HTTP adapter instance');
    
    // Add response listener to catch errors
    const originalEnd = res.end;
    res.end = function(...args: any[]) {
      console.log('Serverless Handler: Response ended', { status: res.statusCode });
      return originalEnd.apply(res, args);
    };
    
    instance(req, res);
  } catch (error) {
    console.error('Serverless Handler Error:', error);
    console.error('Serverless Handler Error Stack:', error.stack);
    res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
