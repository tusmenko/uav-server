import { CacheModule, Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { EventsModule } from "./events/events.module";
import { PointsModule } from "./points/points.module";
import { UavModule } from "./uav/uav.module";

@Module({
  imports: [
    EventsModule,
    PointsModule,
    CacheModule.register({ isGlobal: true }),
    UavModule,
    ScheduleModule.forRoot()
  ],
})
export class AppModule {}
