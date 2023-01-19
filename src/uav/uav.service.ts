import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { UAV } from "./uav";
import { Status, UavEvent } from "./uav.interface";

type UavEventHandler = (event: UavEvent) => void;

@Injectable()
export class UavService {
  uavs = new Map<string, UAV>();

  onFound: UavEventHandler;
  onIdle: UavEventHandler;
  onLost: UavEventHandler;
  onAltChange: UavEventHandler;

  getUav(id: string): UAV {
    if (this.uavs.has(id)) {
      return this.uavs.get(id);
    } else {
      const uav = new UAV(
        id,
        this.onFound,
        this.onIdle,
        this.onLost,
        this.onAltChange
      );

      this.uavs.set(id, uav);
      return uav;
    }
  }

  getEventsHistory(): UavEvent[] {
    const eventsObj = [...this.uavs.values()]
      .map((uav) => uav.getEvents())
      .flat()
      .reduce((acc, val) => ({ ...acc, [val.id]: val }), {});
    const deduplicated = Object.values(eventsObj) as UavEvent[];
    return deduplicated.sort((a, b) => a.time.getTime() - b.time.getTime());
  }

  getUavStatuses(): { [id: string]: Status } {
    return [...this.uavs.values()].reduce(
      (acc, val) => ({ ...acc, [val.getId()]: val.getStatus() }),
      {}
    );
  }

  @Cron(CronExpression.EVERY_5_SECONDS)
  private publishUpdates(): void {
    this.uavs.forEach((uav) => uav.publishUpdates());
  }
}
