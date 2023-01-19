import { Injectable } from "@nestjs/common";
import { CreatePointRawDto } from "./dto/create-point-raw.dto";
import { CreatePointDto } from "./dto/create-point.dto";

@Injectable()
export class PointsService {
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
    const lng = point.longitude;
    const lat = point.latitude;
    const alt = point.altitude;
    const time = new Date();
    const heading = point.heading;

    return {
      uid,
      time,
      lng,
      lat,
      alt,
      heading,
    };
  }
}
