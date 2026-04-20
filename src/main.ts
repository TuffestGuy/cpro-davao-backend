import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. OPEN THE GATES (CORS)
  app.enableCors({
    origin: [
      'http://localhost:5173', // Your local React testing environment
      'https://cpro-davao.vercel.app' // Your live Vercel production website
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // 2. LISTEN TO RENDER'S PORT
  // Render automatically injects a PORT variable. If it's not there (like on your laptop), default to 3000.
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Backend is running on port ${port}`);
}
bootstrap();