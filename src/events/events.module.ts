import { Module } from "@nestjs/common";
import { CacheService } from "src/cache/cache.service";
import { EventsGateway } from "./events.gateway";
import { EventsService } from "./events.service";

@Module({
  imports: [CacheService],
  providers: [EventsGateway, EventsService],
})
export class EventsModule {}
