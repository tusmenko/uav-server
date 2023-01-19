import { CreatePointDto } from "src/points/dto/create-point.dto";
import {
  CLEAR_EVENT_AFTER_MINUTES,
  CONSIDER_NEW_AFTER_MINUTES,
  CRITICAL_CLIMB,
  DISABLED_AFTER_MINUTES,
  INACTIVE_AFTER_MINUTES,
  CLEAR_POINTS_AFTER_MINUTES,
} from "./uav.constants";
import {
  Status,
  UavEvent,
  UavEventHandler,
  UavPosition,
} from "./uav.interface";

const CLEAR_EVENTS_AFTER = CLEAR_EVENT_AFTER_MINUTES * 60 * 1000;
const CLEAR_POINTS_AFTER = CLEAR_POINTS_AFTER_MINUTES * 60 * 1000;

const getNewUavEvent = ({ uid, lat, lng, time }: UavPosition): UavEvent => {
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

const getCriticalClimbingEvent = ({
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

const getLostUavEvent = ({ uid, lat, lng, time }: UavPosition): UavEvent => {
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

const getIdleUavEvent = ({ uid, lat, lng, time }: UavPosition): UavEvent => {
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

const getHeading = (last: CreatePointDto, prev: CreatePointDto): number => {
  return Math.atan2(last.lng - prev.lng, last.lat - prev.lat) * (180 / Math.PI);
};

export class UAV {
  private id: string;
  private status: Status;
  private points: CreatePointDto[] = [];
  private events: UavEvent[] = [];

  private onFound: UavEventHandler;
  private onIdle: UavEventHandler;
  private onLost: UavEventHandler;
  private onAltChange: UavEventHandler;

  constructor(
    id: string,
    onFound?: UavEventHandler,
    onIdle?: UavEventHandler,
    onLost?: UavEventHandler,
    onAltChange?: UavEventHandler
  ) {
    this.id = id;
    this.status = "active";
    this.onFound = onFound;
    this.onIdle = onIdle;
    this.onLost = onLost;
    this.onAltChange = onAltChange;
  }

  public publishUpdates(): void {
    console.log("Updating", this.id, this.status);
    this.notifyIfNew();
    this.notifyIfIdle();
    this.notifyIfLost();
  }

  public handleEvent(event: CreatePointDto): void {
    this.points.push(event);
    this.status = "active";
    this.notifyIfClimbing();
    console.log("Event handled", this.id, this.points.length);
  }

  public getEvents(): UavEvent[] {
    return this.events.sort((a, b) => a.time.getTime() - b.time.getTime());
  }

  public clearOldEvents(): void {
    const now = Date.now();
    const relevantEvents = this.events.filter(
      (e) => now - e.time.getTime() < CLEAR_EVENTS_AFTER
    );
    const archiveEvents = this.events
      .filter((e) => now - e.time.getTime() >= CLEAR_EVENTS_AFTER)
      .filter((e) => e.type === "new");
    this.events = [...archiveEvents, ...relevantEvents];
  }

  public clearOldPoints(): void {
    const now = Date.now();
    const relevantPoints = this.points.filter(
      (p) => now - p.time.getTime() < CLEAR_POINTS_AFTER
    );
    this.points = relevantPoints;
  }

  public getId(): string {
    return this.id;
  }

  public getStatus() {
    return {
      ...this.getLastPoint(),
      status: this.status,
      heading: this.getHeading(),
      climb: this.getClimb(),
    };
  }

  private getIsNew(): boolean {
    if (this.points.length == 1) return true;
    if (this.points.length > 1) {
      const last = this.getLastPoint();
      const prev = this.points[this.points.length - 2];
      const inactiveTime = last.time.getTime() - prev.time.getTime();
      const isNew = inactiveTime > CONSIDER_NEW_AFTER_MINUTES * 60 * 1000;
      return isNew;
    }
    return false;
  }

  private getClimb(): number {
    if (this.points.length < 2) return 0;
    const last = this.getLastPoint();
    const prev = this.points[this.points.length - 2];
    const climb = last.alt - prev.alt;
    return climb;
  }

  private getLastPoint(): CreatePointDto {
    return this.points[this.points.length - 1];
  }

  private getHeading(): number {
    const last = this.getLastPoint();
    if (last.heading) return last.heading;

    const prev = this.points[this.points.length - 2];
    return getHeading(last, prev);
  }

  private getIsIdle(): boolean {
    const last = this.getLastPoint();
    if (Date.now() - last.time.getTime() > INACTIVE_AFTER_MINUTES * 60 * 1000) {
      return true;
    }
    return false;
  }

  private getIsLost(): boolean {
    const last = this.getLastPoint();
    if (Date.now() - last.time.getTime() > DISABLED_AFTER_MINUTES * 60 * 1000) {
      return true;
    }
    return false;
  }

  private notifyIfNew(): void {
    const isNew = this.getIsNew();

    if (isNew) {
      const lastPoint = this.getLastPoint();
      const event = getNewUavEvent(lastPoint);
      this.events.push(event);
      this.onFound && this.onFound(event);
    }
  }

  private notifyIfLost(): void {
    const isLost = this.getIsLost();
    const isAlreadyLost = this.status == "inactive";
    if (isLost && !isAlreadyLost) {
      this.status = "inactive";
      const lastPoint = this.getLastPoint();
      const event = getLostUavEvent(lastPoint);
      this.events.push(event);
      this.onLost && this.onLost(event);
    }
  }

  private notifyIfIdle(): void {
    const isIdle = this.getIsIdle();
    const isAlreadyIdle = this.status == "pending" || this.status == "inactive";
    if (isIdle && !isAlreadyIdle) {
      this.status = "pending";
      const lastPoint = this.getLastPoint();
      const event = getIdleUavEvent(lastPoint);
      this.events.push(event);
      this.onIdle && this.onIdle(event);
    }
  }

  private notifyIfClimbing(): void {
    const climb = this.getClimb();
    //TODO: ensure only one climb event is sent per point
    if (Math.abs(climb) > CRITICAL_CLIMB && this.status == "active") {
      const lastPoint = this.getLastPoint();
      const event = getCriticalClimbingEvent({ ...lastPoint, climb });
      this.events.push(event);
      this.onAltChange && this.onAltChange(event);
    }
  }
}
