import { Module } from "@nestjs/common";
import { CacheService } from "cache/cache.service";
import { UavService } from "./uav.service";
// import { EventsGateway } from "./events.gateway";
// import { EventsService } from "./uav.service";

@Module({
  imports: [CacheService],
  providers: [UavService],
})
export class UavModule {}
