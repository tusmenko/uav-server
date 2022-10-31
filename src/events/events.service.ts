import { Socket } from "socket.io";
import { CreatePointDto } from "src/points/dto/create-point.dto";
import { Injectable } from "@nestjs/common";
import { ModuleRef } from "@nestjs/core";
import { PointsService } from "src/points/points.service";

@Injectable()
export class EventsService {
  constructor(private moduleRef: ModuleRef) {}

  private pointsService: PointsService;

  async onModuleInit() {
    this.pointsService = await this.moduleRef.get(PointsService, {
      strict: false,
    });
  }

  handlePointEvent = (message: string, socket: Socket): void => {
    console.log("Received point event:", message);
    let point: CreatePointDto;

    try {
      point = this.handleMessage(message);
      socket.broadcast.emit("message", JSON.stringify(point));
    } catch {
      socket.emit("message", "Invalid point");
    }
  };

  handleMessage = (message: string): CreatePointDto => {
    const pointDto = this.pointsService.parse(message);
    this.pointsService.validateRawPoint(pointDto);
    return this.pointsService.rawPointToPointDto(pointDto);
  };
}
