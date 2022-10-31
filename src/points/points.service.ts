import { Injectable } from "@nestjs/common";
import { ModuleRef } from "@nestjs/core";
import { EventsGateway } from "src/events/events.gateway";
import { CreatePointRawDto } from "./dto/create-point-raw.dto";
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

  parse(message: string): CreatePointRawDto {
    const pointDto = JSON.parse(message) as CreatePointRawDto;
    return pointDto;
  }

  validateRawPoint(point: CreatePointRawDto): void {
    if (!point.droneid) {
      throw new Error("Drone ID is missing");
    }
    if (!point.latitude) {
      throw new Error("Latitude is missing");
    }
    if (!point.longitude) {
      throw new Error("Longitude is missing");
    }
  }

  rawPointToPointDto(point: CreatePointRawDto): CreatePointDto {
    const uid = point.droneid;
    const lon = point.longitude;
    const lat = point.latitude;
    const alt = point.altitude;
    // const time = point.uav_time ? new Date(point.uav_time) : new Date();
    const time = new Date();
    const heading = point.heading;

    return {
      uid,
      time,
      lon,
      lat,
      alt,
      heading,
    };
  }

  // calculateHeading(
  //   currentPoint: CreatePointDto,
  //   previousPoint: CreatePointDto
  // ): number {
  //   const x = currentPoint.lon - previousPoint.lon;
  //   const y = currentPoint.lat - previousPoint.lat;
  //   const heading = Math.atan2(y, x) * (180 / Math.PI);
  //   return heading;
  // }
}
