import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    const config = new DocumentBuilder().setTitle('Elderly Home API').setDescription('An ATEC project').setVersion('1.0').build();
    const documentFactory = () => SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, documentFactory);

    // Enable CORS
    app.enableCors({
        origin: '*',
        credentials: true,
    });

    // Add global prefix
    app.setGlobalPrefix('api');

    // Add global validation pipe for class-validator
    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
            whitelist: true,
        }),
    );

    await app.listen(3000);
}

bootstrap();
