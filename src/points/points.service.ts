import { Injectable } from "@nestjs/common";
import { ModuleRef } from "@nestjs/core";
import { EventsGateway } from "src/events/events.gateway";
import { CreatePointDto } from "./dto/create-point.dto";
import { Point } from "./entities/data.entity";

@Injectable()
export class PointsService {
  private eventsProvider: EventsGateway;
  constructor(private moduleRef: ModuleRef) {}

  async onModuleInit() {
    this.eventsProvider = await this.moduleRef.get(EventsGateway, {
      strict: false,
    });
  }

  private readonly data: Point[] = [];

  create(point: CreatePointDto): Point {
    this.eventsProvider.populatePoint(JSON.stringify(point));
    return point;
  }

  test(data: any): void {
    this.eventsProvider.populatePoint(data);
  }

  findOne(id: number): Point {
    return this.data[id];
  }
}
