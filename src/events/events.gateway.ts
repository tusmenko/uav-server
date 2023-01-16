import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
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
    client.emit("events", events);
  }
}
