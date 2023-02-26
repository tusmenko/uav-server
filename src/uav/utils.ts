import { CreatePointDto } from "points/dto/create-point.dto";
import { UavPosition, UavEvent } from "./uav.interface";

export const getNewUavEvent = ({
  uid,
  lat,
  lng,
  time,
}: UavPosition): UavEvent => {
  const id = `${uid}-${time}-new`;
  return {
    id,
    uid,
    position: { lat, lng },
    type: "new",
    time,
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
  const id = `${uid}-${new Date(time).getTime()}-climb`;
  return {
    id,
    uid,
    position: { lat: lat, lng: lng },
    type: "climb",
    time,
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
  const id = `${uid}-${time}-lost`;
  return {
    id,
    uid,
    position: { lat: lat, lng: lng },
    type: "lost",
    time,
    kind: "info",
  };
};

export const getIdleUavEvent = ({
  uid,
  lat,
  lng,
  time,
}: UavPosition): UavEvent => {
  const id = `${uid}-${time}-idle`;
  return {
    id,
    uid,
    position: { lat: lat, lng: lng },
    type: "idle",
    time,
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
  new Date(point.time).getTime() < time;
