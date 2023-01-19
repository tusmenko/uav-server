import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { UavEvent } from "src/uav/uav.interface";
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
    const events = await this.eventsService.getCachedEvents();
    console.log(`Sending ${events.length} events to client`);
    client.emit("history", events);
  }

  async broadcastEvent(event: UavEvent): Promise<void> {
    this.server.emit("uav-event", JSON.stringify(event));
  }
}
