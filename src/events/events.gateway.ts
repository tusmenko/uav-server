import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { CreatePointRawDto } from "src/points/dto/create-point-raw.dto";
import { CreatePointDto } from "src/points/dto/create-point.dto";

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

  @SubscribeMessage("point")
  onPointEvent(
    @MessageBody() message: string,
    @ConnectedSocket() socket: Socket
  ): void {
    this.handlePointEvent(message, socket);
  }

  @SubscribeMessage("mapsymbol")
  onMapsymbolEvent(
    @MessageBody() message: string,
    @ConnectedSocket() socket: Socket
  ): void {
    this.handlePointEvent(message, socket);
  }

  handlePointEvent = (message: string, socket: Socket): void => {
    console.log("Received point event:", message);
    const pointDto = JSON.parse(message);
    const point = pointToMessage(pointDto);
    socket.broadcast.emit("message", JSON.stringify(point));
  };

  async populatePoint(message: string): Promise<void> {
    this.server.emit("message", message);
  }
}

const pointToMessage = (point: CreatePointRawDto): CreatePointDto => {
  const uid = point.droneid;
  const lon = point.longitude?.toString() ?? "0";
  const lat = point.latitude?.toString() ?? "0";
  const alt = point.altitude?.toString() ?? "0";

  return {
    uid,
    time: new Date(),
    lon,
    lat,
    alt,
  };
};
