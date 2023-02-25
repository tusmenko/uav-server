import { CACHE_MANAGER, Inject, Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { UAV } from "./uav";
import { Status, UavEvent, UavPosition } from "./uav.interface";
import { Cache } from "cache-manager";
import { CreatePointDto } from "points/dto/create-point.dto";
import { CacheService } from "cache/cache.service";
import { ModuleRef } from "@nestjs/core";

type UavEventHandler = (event: UavEvent) => void;

@Injectable()
export class UavService {
  uavs = new Map<string, UAV>();
  cacheService: CacheService;
  // private readonly cache: Cache;

  onFound: UavEventHandler;
  onIdle: UavEventHandler;
  onLost: UavEventHandler;
  onAltChange: UavEventHandler;

  constructor(private moduleRef: ModuleRef) {}

  async onModuleInit() {
    this.cacheService = this.moduleRef.get(CacheService, {
      strict: false,
    });
  }

  getUav(id: string) {
    if (this.uavs.has(id)) {
      return this.uavs.get(id);
    } else {
      const uav = new UAV(
        id,
        this.cacheService,
        this.onFound,
        this.onIdle,
        this.onLost,
        this.onAltChange,
      );

      this.uavs.set(id, uav);
      return uav;
    }
  }

  getEventsHistory() {
    const eventsObj = [...this.uavs.values()]
      .map((uav) => uav.getEvents())
      .flat()
      .reduce((acc, event) => ({ ...acc, [event.id]: event }), {});
    const deduplicated = Object.values(eventsObj) as UavEvent[];
    return deduplicated.sort((a, b) => a.time.getTime() - b.time.getTime());
  }

  getUavStatuses(): { [id: string]: Status } {
    const uavs = [...this.uavs.values()];
    return uavs.reduce(
      (acc, uav) => ({ ...acc, [uav.getId()]: uav.getStatus() }),
      {}
    );
  }

  @Cron(CronExpression.EVERY_5_SECONDS)
  private publishUpdates(): void {
    this.uavs.forEach((uav) => {
      uav.publishUpdates();
    });
  }

  @Cron(CronExpression.EVERY_HOUR)
  private clearEvents(): void {
    this.uavs.forEach((uav) => {
      uav.clearOldEvents();
    });
  }
}
