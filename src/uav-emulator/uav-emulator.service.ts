import { Injectable } from "@nestjs/common";
import { ModuleRef } from "@nestjs/core";
import { EventsGateway } from "src/events/events.gateway";
import { CreatePointDto } from "src/points/dto/create-point.dto";
import POSITIONS from "./data";

const DEFAULT_UAV: Pick<CreatePointDto, "uid" | "alt"> = {
  uid: "023c1f03-94c3-4c39-91f2-8f69318f86c6",
  alt: "15.9",
};

@Injectable()
export class UavEmulatorService {
  private lastPosition = 0;
  private eventsProvider: EventsGateway;
  constructor(private moduleRef: ModuleRef) {}

  async onModuleInit() {
    this.eventsProvider = await this.moduleRef.get(EventsGateway, {
      strict: false,
    });
    setInterval(() => {
      const coordinates = POSITIONS[this.lastPosition % POSITIONS.length];
      const uav: CreatePointDto = {
        ...DEFAULT_UAV,
        time: new Date(),
        lon: coordinates.longitude.toString(),
        lat: coordinates.latitude.toString(),
        alt: Math.round(Math.random() * 100).toString(),
      };
      this.lastPosition++;
      this.emulate(uav);
    }, 5000);
  }

  emulate(point: CreatePointDto) {
    this.eventsProvider.populatePoint(JSON.stringify(point));
    return point;
  }
}
