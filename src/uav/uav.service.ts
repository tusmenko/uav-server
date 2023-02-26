import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { UAV } from "./uav";
import { Status, UavEvent, UavPositionHandler } from "./uav.interface";
import { CacheService } from "cache/cache.service";
import { ModuleRef } from "@nestjs/core";

type UavEventHandler = (event: UavEvent) => void;

@Injectable()
export class UavService {
  uavs = new Map<string, UAV>();
  cacheService: CacheService;

  onPosition: UavPositionHandler;
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
      return this.uavs.get(id)!;
    } else {
      const uav = new UAV(
        id,
        this.cacheService,
        this.onPosition,
        this.onFound,
        this.onIdle,
        this.onLost,
        this.onAltChange
      );

      this.uavs.set(id, uav);
      return uav;
    }
  }

  async getEventsHistory() {
    const keys = await this.cacheService.getKeys();
    const eventKeys = keys.filter((key) => key.includes("-event-"));
    const events = (await this.cacheService.getMany(eventKeys)) as UavEvent[];
    const sorded = events.sort(
      (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()
    );
    return sorded;
  }

  async getUavStatuses(): Promise<{ [id: string]: Status }> {
    const storeKeys = await this.cacheService.getKeys();
    const uavKeys = storeKeys
      .map((key) => key.split("-")[0])
      .filter((key) => key) as string[];
    const uniqueKeys = [...new Set(uavKeys)];
    const uavs = uniqueKeys.map((key) => this.getUav(key));
    const statuses = await uavs.reduce(
      async (acc, uav) => ({ ...acc, [uav.getId()]: await uav.getStatus() }),
      {}
    );
    return statuses;
  }

  @Cron(CronExpression.EVERY_5_SECONDS)
  private publishUpdates(): void {
    this.uavs.forEach((uav) => {
      uav.publishUpdates();
    });
  }
}
