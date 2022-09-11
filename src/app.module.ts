import { Module } from '@nestjs/common';
import { EventsModule } from './events/events.module';
import { PointsModule } from "./points/points.module";

@Module({
  imports: [EventsModule, PointsModule],
})
export class AppModule {}
