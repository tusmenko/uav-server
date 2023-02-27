import { CacheModule, Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { EventsModule } from "events/events.module";
import { PointsModule } from "points/points.module";
import { UavModule } from "uav/uav.module";
import { ConfigModule } from "@nestjs/config";
import * as redisStore from "cache-manager-redis-store";
import { SentryModule } from "@ntegral/nestjs-sentry";

@Module({
  imports: [
    EventsModule,
    PointsModule,
    CacheModule.register({
      store: redisStore,
      url: process.env.REDIS_URL,
      isGlobal: true,
      tls: {
        rejectUnauthorized: false,
      },
    }),
    SentryModule.forRoot({
      dsn: process.env.SENTRY_DSN,
      debug: true,
      environment: process.env.SENTRY_ENVIRONMENT,
      // release: "some_release", // must create a release in sentry.io dashboard
      logLevels: ["debug"], //based on sentry.io loglevel //
    }),
    UavModule,
    ScheduleModule.forRoot(),
    ConfigModule.forRoot(),
  ],
})
export class AppModule {}
