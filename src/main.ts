import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import * as Sentry from "@sentry/node";
import { AllExceptionFilter } from "all-exception.filter.ts";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const options = new DocumentBuilder()
    .setTitle("UAV data broadcast")
    .setVersion("1.0")
    .addTag("Populate coodrinates")
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup("docs", app, document);

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    debug: process.env.SENTRY_ENVIRONMENT == "development" ? true : false,
    tracesSampleRate: 0.001,
    environment: process.env.SENTRY_ENVIRONMENT,
  });

  app.useGlobalFilters(new AllExceptionFilter());
  // app.useLogger(SentryService.SentryServiceInstance());
  // const redisIoAdapter = new RedisIoAdapter(app);
  // await redisIoAdapter.connectToRedis();
  // app.useWebSocketAdapter(redisIoAdapter);

  await app.listen(process.env.PORT ?? 3001);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
