import { CACHE_MANAGER, Inject } from "@nestjs/common";
import { Cache } from "cache-manager";
import { CreatePointDto } from "points/dto/create-point.dto";
import { UavEvent } from "uav/uav.interface";

export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  POINT_TTL = Number(process.env.CLEAR_POINTS_AFTER_MINUTES) * 60;
  EVENT_TTL = Number(process.env.CLEAR_EVENT_AFTER_MINUTES) * 60;

  async getMany(keys: string[]) {
    if (this.cacheManager.store.mget && keys.length)
      return await this.cacheManager.store.mget(...keys);
    return [];
  }

  async setPoint(uavId: string, point: CreatePointDto) {
    const key = getPointKey(uavId, point.time);
    await this.cacheManager.set(key, point, {
      ttl: this.POINT_TTL,
    });
  }

  async getPointKeysForUav(id: string): Promise<string[]> {
    const store = await this.cacheManager.store;
    if (!(store.keys && store.mget)) {
      console.warn("Cache store does not support keys or mget");
      return [];
    }
    const keys = ((await store.keys<string>()) ?? []) as string[];
    const uavPointKeys = keys.filter((key) => key.startsWith(getPointKey(id)));
    const ordered = uavPointKeys.sort().reverse();
    return ordered;
  }

  async getPoints(id: string, qty?: number): Promise<CreatePointDto[]> {
    const store = this.cacheManager.store;
    if (!store.mget) {
      console.warn("Cache store does not support mget");
      return [];
    }
    const allKeys = await this.getPointKeysForUav(id);
    const keys = qty ? allKeys.slice(0, qty) : allKeys;
    const values = (
      keys.length ? await store.mget(...keys) : []
    ) as CreatePointDto[];
    return values;
  }

  async setEvent(uavId: string, event: UavEvent) {
    const key = getEventKey(uavId, event.time);
    await this.cacheManager.set(key, event, {
      ttl: this.EVENT_TTL,
    });
  }

  async getEventKeysForUav(id: string) {
    const store = await this.cacheManager.store;
    if (!(store.keys && store.mget)) {
      console.warn("Cache store does not support keys or mget");
      return [];
    }
    const keys = ((await store.keys<string>()) ?? []) as string[];
    const uavEventsKeys = keys.filter((key) => key.startsWith(getEventKey(id)));
    const ordered = uavEventsKeys.sort().reverse();
    return ordered;
  }

  async getEvents(id: string) {
    const store = this.cacheManager.store;
    if (!store.mget) {
      console.warn("Cache store does not support mget");
      return [];
    }
    const keys = await this.getEventKeysForUav(id);
    const values = (keys.length ? await store.mget(...keys) : []) as UavEvent[];
    return values ?? [];
  }

  async getKeys() {
    const store = await this.cacheManager.store;
    if (!store.keys) {
      console.warn("Cache store does not support keys");
      return [];
    }
    const keys = ((await store.keys<string>()) ?? []) as string[];
    return keys;
  }
}

const getPointKey = (uavId: string, time?: number) => {
  const timeStamp = time
    ? new Date(time).getTime() - new Date(time).getMilliseconds()
    : ""; // 1 second resolution
  return `${uavId}-point-${timeStamp}`;
};

const getEventKey = (uavId: string, time?: number) => {
  const timeStamp = time ? new Date(time).getTime() : "";
  return `${uavId}-event-${timeStamp}`;
};
