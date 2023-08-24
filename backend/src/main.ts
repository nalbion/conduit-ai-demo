import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import {HttpException, HttpStatus, ValidationPipe} from "@nestjs/common";


async function bootstrap() {
  const appOptions = { cors: true };
  const app = await NestFactory.create(AppModule, appOptions);
  app.setGlobalPrefix('api');

  app.useGlobalPipes(new ValidationPipe({
    exceptionFactory: (errors) => {
      const errorDetails = errors.flatMap(error =>
          Object.values(error.constraints).map(constraint => ({
            title: 'Validation failed',
            detail: constraint,
            source: { pointer: `/data/attributes/${error.property}` }
          }))
      );

      return new HttpException({ errors: errorDetails }, HttpStatus.BAD_REQUEST);
    }
  }));

  const options = new DocumentBuilder()
    .setTitle('NestJS Realworld Example App')
    .setDescription('The Realworld API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('/docs', app, document);

  await app.listen(3000);
}
bootstrap()
  .catch((err) => {
    console.log(err);
  });
