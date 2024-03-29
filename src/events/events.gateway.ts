import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { UavEvent, UavPosition } from "uav/uav.interface";
import { EventsService } from "./events.service";

@WebSocketGateway({
  cors: {
    origin: "*",
  },
})
export class EventsGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  constructor(private readonly eventsService: EventsService) {}

  @SubscribeMessage("mapsymbol")
  onMapsymbolEvent(
    @MessageBody() message: string,
    @ConnectedSocket() socket: Socket
  ): void {
    this.eventsService.handlePointEvent(message, socket);
  }

  @SubscribeMessage("sensor")
  onSensorEvent(
    @MessageBody() message: string,
    @ConnectedSocket() socket: Socket
  ): void {
    this.eventsService.handleSensorEvent(message, socket);
  }

  // Consider distinguishing between Consumer and Producer connections
  // Only Client requires history and statuses
  async handleConnection(client: Socket): Promise<void> {
    console.log(`Client connected: ${client.id}`);
    const events = await this.eventsService.getCachedEvents();
    const status = await this.eventsService.getUavStatuses();
    console.log(
      `Provided ${events.length} events and ${Object.keys(status).length} uavs`
    );
    client.emit("history", events);
    client.emit("statuses", status);
  }

  async broadcastPosition(event: UavPosition): Promise<void> {
    this.server.emit("uav-position", event);
  }

  async broadcastEvent(event: UavEvent): Promise<void> {
    console.log("Broadcasting event: " + event.type);
    this.server.emit("uav-event", event);
  }
}
