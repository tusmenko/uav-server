import { Socket } from "socket.io";
import { CreatePointDto } from "src/points/dto/create-point.dto";
import { Injectable } from "@nestjs/common";
import { ModuleRef } from "@nestjs/core";
import { PointsService } from "src/points/points.service";
import { CacheService } from "src/cache/cache.service";
import { UavService } from "src/uav/uav.service";
import { UavEvent } from "src/uav/uav.interface";
import { EventsGateway } from "./events.gateway";

@Injectable()
export class EventsService {
  constructor(private moduleRef: ModuleRef) {}

  private pointsService: PointsService;
  private cacheService: CacheService;
  private uavService: UavService;
  private eventGateweay: EventsGateway;

  handleFound = (event: UavEvent) => {
    console.warn("Found ", event.id);
    this.eventGateweay.broadcastEvent(event);
  };

  handleIdle = (event: UavEvent) => {
    console.info("Idle ", event.id);
    this.eventGateweay.broadcastEvent(event);
  };

  handleLost = (event: UavEvent) => {
    console.info("Lost ", event.id);
    this.eventGateweay.broadcastEvent(event);
  };

  handleAltChange = (event: UavEvent) => {
    console.warn("Alt ", event.id);
    this.eventGateweay.broadcastEvent(event);
  };

  async onModuleInit() {
    this.pointsService = await this.moduleRef.get(PointsService, {
      strict: false,
    });
    this.cacheService = await this.moduleRef.get(CacheService, {
      strict: false,
    });
    this.uavService = await this.moduleRef.get(UavService, {
      strict: false,
    });
    this.eventGateweay = await this.moduleRef.get(EventsGateway, {
      strict: false,
    });

    this.uavService.onFound = this.handleFound;
    this.uavService.onIdle = this.handleIdle;
    this.uavService.onLost = this.handleLost;
    this.uavService.onAltChange = this.handleAltChange;
  }

  handlePointEvent = async (message: string, socket: Socket): Promise<void> => {
    console.log("Received point event");
    let point: CreatePointDto;

    try {
      point = await this.handleMessage(message);
      const uav = this.uavService.getUav(point.uid);
      uav.handleEvent(point);
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

  getCachedEvents = async () => this.uavService.getEventsHistory();
}
