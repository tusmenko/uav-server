import { CACHE_MANAGER, Inject } from "@nestjs/common";
import { Cache } from "cache-manager";
import { CreatePointDto } from "points/dto/create-point.dto";

const ONE_DAY = 60 * 60 * 24;

export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  POINT_TTL = Number(process.env.CLEAR_POINTS_AFTER_MINUTES) * 60;

  // save = async (key: string, value: any): Promise<void> => {
  //   await this.cacheManager.set(key, value, ONE_DAY);
  // };

  // fetch = (key: string): Promise<any> => {
  //   return this.cacheManager.get(key);
  // };

  // fetchAll = async (): Promise<any> => {
  //   // const keys = await this.cacheManager.store.keys();
  //   // return await Promise.all(keys.map((key) => this.cacheManager.get(key)));
  // };

  async getPoint(id: string) {
    const point = await this.cacheManager.get<CreatePointDto>(id);
    console.log(`Fetched point by id ${id}`, point);
    return point;
  }

  async setPoint(uavId: string, point: CreatePointDto) {
    const key = getPointKey(uavId, point.time);
    console.log(`Saving point for uav id ${uavId}`, key);
    await this.cacheManager.set(key, point, this.POINT_TTL);
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
    console.log(`Points for UAV ${id}`, ordered);
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
    const values = (await store.mget(...keys)) as CreatePointDto[];
    console.log(`Fetched values for id ${id}`, values);
    return values ?? [];
  }

  // async setPoints(uavId: string, points: CreatePointDto[]) {
  //   // const values = await this.cacheManager.get<CreatePointDto[]>(id);
  //   console.log("Setting points for uav id", uavId, points.length);
  //   for (const point of points) {
  //     const id = `${uavId}-${point.time.getTime()}`;
  //     await this.cacheManager.set(id, point);
  //   }
  //   // console.log(`Saving values for id ${id}`, points);

  //   // await this.cacheManager.set(id, points);
  // }
}

const getPointKey = (uavId: string, time?: Date) => {
  const timeStamp = time ? time.getTime() - time.getMilliseconds() : ""; // 1 second resolution
  return `${uavId}-point-${timeStamp}`;
};
