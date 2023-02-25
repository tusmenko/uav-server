import { CreatePointDto } from "points/dto/create-point.dto";
import { Status, UavEvent, UavEventHandler } from "./uav.interface";
import {
  getHeading,
  getNewUavEvent,
  getLostUavEvent,
  getIdleUavEvent,
  getCriticalClimbingEvent,
} from "./utils";
import { CacheService } from "cache/cache.service";

export class UAV {
  private id: string;
  private status: Status;
  private events: UavEvent[] = [];

  private onFound?: UavEventHandler;
  private onIdle?: UavEventHandler;
  private onLost?: UavEventHandler;
  private onAltChange?: UavEventHandler;

  CLEAR_EVENTS_AFTER =
    Number(process.env.CLEAR_EVENT_AFTER_MINUTES) * 60 * 1000;
  CLEAR_POINTS_AFTER =
    Number(process.env.CLEAR_POINTS_AFTER_MINUTES) * 60 * 1000;
  CRITICAL_CLIMB = Number(process.env.CRITICAL_CLIMB);
  INACTIVE_AFTER = Number(process.env.INACTIVE_AFTER_MINUTES) * 60 * 1000;
  DISABLED_AFTER = Number(process.env.DISABLED_AFTER_MINUTES) * 60 * 1000;
  CONSIDER_NEW_AFTER =
    Number(process.env.CONSIDER_NEW_AFTER_MINUTES) * 60 * 1000;
  store: CacheService;

  constructor(
    id: string,
    store: CacheService,
    onFound: UavEventHandler,
    onIdle: UavEventHandler,
    onLost: UavEventHandler,
    onAltChange: UavEventHandler
  ) {
    this.id = id;
    this.status = "new";
    this.store = store;
    this.onFound = onFound;
    this.onIdle = onIdle;
    this.onLost = onLost;
    this.onAltChange = onAltChange;
  }

  public publishUpdates(): void {
    console.info("Updating", this.id, this.status);
    this.notifyIfNew();
    this.notifyIfIdle();
    this.notifyIfLost();
  }

  public handleEvent(event: CreatePointDto): void {
    this.store.setPoint(this.id, event);
    this.notifyIfClimbing();
    console.info("Event handled", this.id);
  }

  public getEvents(): UavEvent[] {
    return this.events.sort((a, b) => a?.time?.getTime() - b?.time?.getTime());
  }

  public clearOldEvents(): void {
    const now = Date.now();
    const eventsCountBefore = this.events.length;

    const relevantEvents = this.events.filter(
      (e) => now - e?.time.getTime() < this.CLEAR_EVENTS_AFTER
    );

    const archiveEvents = this.events
      .filter((e) => now - e?.time.getTime() >= this.CLEAR_EVENTS_AFTER)
      .filter((e) => e?.type !== "climb");
    this.events = [...archiveEvents, ...relevantEvents];

    console.log(
      "Events cleared",
      this.id,
      eventsCountBefore,
      this.events.length
    );
  }

  public getId(): string {
    return this.id;
  }

  public async getStatus() {
    const [last] = await this.getLastTwoPoint();
    return {
      ...last,
      status: this.status,
      heading: this.getHeading(),
      climb: this.getClimb(),
    };
  }

  private async getIsNew(): Promise<boolean> {
    const points = await this.store.getPoints(this.id);
    if (points.length == 1) return true;
    if (points.length > 1) {
      const [last, prev] = await this.getLastTwoPoint();
      if (last && prev) {
        const inactiveTime = last.time.getTime() - prev.time.getTime();
        const isNew = inactiveTime > this.CONSIDER_NEW_AFTER;
        return isNew;
      }
    }
    return false;
  }

  private async getClimb(): Promise<number> {
    const [last, prev] = await this.getLastTwoPoint();
    if (!last || !prev) return 0;
    const climb = last.alt - prev.alt;
    return climb;
  }

  private async getLastTwoPoint() {
    // Assuming points are sorted by time desc
    const points = await this.store.getPoints(this.id, 2);
    const last = points[0];
    const prev = points[1];
    return [last, prev];
  }

  private async getHeading(): Promise<number> {
    const [last, prev] = await this.getLastTwoPoint();
    if (last && last.heading) return last.heading;
    if (!last || !prev) return 0;
    return getHeading(last, prev);
  }

  private async getIsIdle(): Promise<boolean> {
    const [last] = await this.getLastTwoPoint();
    if (last && Date.now() - last.time.getTime() > this.INACTIVE_AFTER) {
      return true;
    }
    return false;
  }

  private async getIsLost(): Promise<boolean> {
    const [last] = await this.getLastTwoPoint();
    if (last && Date.now() - last.time.getTime() > this.DISABLED_AFTER) {
      return true;
    }
    return false;
  }

  private async notifyIfNew(): Promise<void> {
    const isNew = this.getIsNew();
    if (!isNew) return;
    if (this.status === "new") {
      this.status = "active";
      const [last] = await this.getLastTwoPoint();
      if (!last) return;
      const event = getNewUavEvent(last);
      this.events.push(event);
      this.onFound && this.onFound(event);
    }
  }

  private async notifyIfLost(): Promise<void> {
    const isLost = await this.getIsLost();
    const isAlreadyLost = this.status == "inactive";
    if (isLost && !isAlreadyLost) {
      this.status = "inactive";
      const [last] = await this.getLastTwoPoint();
      if (!last) return;
      const event = getLostUavEvent(last);
      this.events.push(event);
      this.onLost && this.onLost(event);
    }
  }

  private async notifyIfIdle(): Promise<void> {
    const isIdle = await this.getIsIdle();
    const isAlreadyIdle = this.status == "pending" || this.status == "inactive";
    if (isIdle && !isAlreadyIdle) {
      this.status = "pending";
      const [last] = await this.getLastTwoPoint();
      if (!last) return;
      const event = getIdleUavEvent(last);
      this.events.push(event);
      this.onIdle && this.onIdle(event);
    }
  }

  private async notifyIfClimbing(): Promise<void> {
    const climb = await this.getClimb();
    // TODO: ensure only one climb event is sent per point
    if (Math.abs(climb) > this.CRITICAL_CLIMB && this.status == "active") {
      const [last] = await this.getLastTwoPoint();
      if (!last) return;
      const event = getCriticalClimbingEvent({ ...last, climb });
      this.events.push(event);
      this.onAltChange && this.onAltChange(event);
    }
  }
}
