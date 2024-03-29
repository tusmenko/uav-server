import { Socket } from "socket.io";
import { CreatePointDto } from "points/dto/create-point.dto";
import { Injectable } from "@nestjs/common";
import { ModuleRef } from "@nestjs/core";
import { PointsService } from "points/points.service";
import { UavService } from "uav/uav.service";
import { UavEvent, UavPosition } from "uav/uav.interface";
import { EventsGateway } from "./events.gateway";

@Injectable()
export class EventsService {
  constructor(private moduleRef: ModuleRef) {}

  private pointsService: PointsService;
  private uavService: UavService;
  private eventGateweay: EventsGateway;

  async onModuleInit() {
    this.pointsService = this.moduleRef.get(PointsService, {
      strict: false,
    });
    this.uavService = this.moduleRef.get(UavService, {
      strict: false,
    });
    this.eventGateweay = this.moduleRef.get(EventsGateway, {
      strict: false,
    });

    this.uavService.onFound = this.handleFound;
    this.uavService.onIdle = this.handleIdle;
    this.uavService.onLost = this.handleLost;
    this.uavService.onAltChange = this.handleAltChange;
    this.uavService.onPosition = this.handlePosition;
  }

  public handlePointEvent = async (
    message: string,
    socket: Socket
  ): Promise<void> => {
    console.log(`Point from ${socket.id}`);
    let point: CreatePointDto;

    try {
      point = await this.handleMessage(message);
      const uav = this.uavService.getUav(point.uid);
      uav?.handleEvent(point);
    } catch (error) {
      if (error instanceof Error)
        console.error("Invalid point:", error.message, message);
    }
  };

  public handleMessage = async (message: string): Promise<CreatePointDto> => {
    const pointDto = this.pointsService.parse(message);
    this.pointsService.validateRawPoint(pointDto);
    return this.pointsService.rawPointToPointDto(pointDto);
  };

  public handleSensorEvent = async (
    message: string,
    socket: Socket
  ): Promise<void> => {
    console.log(`Sensor event ${socket.id}`, message);
  };

  public getCachedEvents = async () => await this.uavService.getEventsHistory();
  public getUavStatuses = async () => await this.uavService.getUavStatuses();

  private handleFound = (event: UavEvent) => {
    console.info("Found ", event.id);
    this.eventGateweay.broadcastEvent(event);
  };

  private handleIdle = (event: UavEvent) => {
    console.info("Idle ", event.id);
    this.eventGateweay.broadcastEvent(event);
  };

  private handleLost = (event: UavEvent) => {
    console.info("Lost ", event.id);
    this.eventGateweay.broadcastEvent(event);
  };

  private handleAltChange = (event: UavEvent) => {
    console.info("Alt ", event.id);
    this.eventGateweay.broadcastEvent(event);
  };

  private handlePosition = (event: UavPosition) => {
    console.info("Position ", event.uid);
    this.eventGateweay.broadcastPosition(event);
  };
}
