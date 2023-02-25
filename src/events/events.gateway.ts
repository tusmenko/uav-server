import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { UavEvent } from "uav/uav.interface";
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

  async handleConnection(client: Socket): Promise<void> {
    console.log(`Client connected: ${client.id}`);
    const events = this.eventsService.getCachedEvents();
    const status = this.eventsService.getUavStatuses();
    client.emit("history", events);
    client.emit("statuses", status);
  }

  async broadcastEvent(event: UavEvent): Promise<void> {
    this.server.emit("uav-event", event);
  }
}
