import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";

@WebSocketGateway({
  cors: {
    origin: "*",
  },
})
export class EventsGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage("message")
  onMessageEvent(
    @MessageBody() message: any,
    @ConnectedSocket() socket: Socket
  ): void {
    socket.broadcast.emit("message", message);
  }

  async populatePoint(message: string): Promise<void> {
    this.server.emit("message", message);
  }
}
