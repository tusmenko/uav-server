import { Socket } from "socket.io";
import { CreatePointDto } from "src/points/dto/create-point.dto";
import { Injectable } from "@nestjs/common";
import { ModuleRef } from "@nestjs/core";
import { PointsService } from "src/points/points.service";
import { CacheService } from "src/cache/cache.service";

@Injectable()
export class EventsService {
  constructor(private moduleRef: ModuleRef) {}

  private pointsService: PointsService;
  private cacheService: CacheService;

  async onModuleInit() {
    this.pointsService = await this.moduleRef.get(PointsService, {
      strict: false,
    });
    this.cacheService = await this.moduleRef.get(CacheService, {
      strict: false,
    });
  }

  handlePointEvent = async (message: string, socket: Socket): Promise<void> => {
    console.log("Received point event:", message);
    let point: CreatePointDto;

    try {
      point = await this.handleMessage(message);
      socket.broadcast.emit("message", JSON.stringify(point));
    } catch {
      socket.emit("error", "Invalid point");
    }
  };

  handleMessage = async (message: string): Promise<CreatePointDto> => {
    const pointDto = this.pointsService.parse(message);
    // TODO: implement caching
    this.cacheService.save("events", new Date());
    this.pointsService.validateRawPoint(pointDto);
    return this.pointsService.rawPointToPointDto(pointDto);
  };

  getCachedEvents = async (): Promise<any> => this.cacheService.fetchAll();
}
