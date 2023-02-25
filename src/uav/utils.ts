import { CreatePointDto } from "points/dto/create-point.dto";
import { UavPosition, UavEvent } from "./uav.interface";

export const getNewUavEvent = ({
  uid,
  lat,
  lng,
  time,
}: UavPosition): UavEvent => {
  const id = `${uid}-${time.getTime()}-new`;
  return {
    id,
    uid,
    position: { lat, lng },
    type: "new",
    time: new Date(time),
    kind: "alert",
  };
};

export const getCriticalClimbingEvent = ({
  uid,
  lat,
  lng,
  time,
  climb,
}: UavPosition): UavEvent => {
  const id = `${uid}-${time.getTime()}-climb`;
  return {
    id,
    uid,
    position: { lat: lat, lng: lng },
    type: "climb",
    time: new Date(time),
    kind: "warning",
    climb,
  };
};

export const getLostUavEvent = ({
  uid,
  lat,
  lng,
  time,
}: UavPosition): UavEvent => {
  const id = `${uid}-${time.getTime()}-lost`;
  return {
    id,
    uid,
    position: { lat: lat, lng: lng },
    type: "lost",
    time: new Date(time),
    kind: "info",
  };
};

export const getIdleUavEvent = ({
  uid,
  lat,
  lng,
  time,
}: UavPosition): UavEvent => {
  const id = `${uid}-${time.getTime()}-idle`;
  return {
    id,
    uid,
    position: { lat: lat, lng: lng },
    type: "idle",
    time: new Date(time),
    kind: "info",
  };
};

export const getHeading = (
  last: CreatePointDto,
  prev: CreatePointDto
): number => {
  return Math.atan2(last.lng - prev.lng, last.lat - prev.lat) * (180 / Math.PI);
};

export const isOlderThan = (point: CreatePointDto, time: number): boolean =>
  point.time.getTime() < time;
