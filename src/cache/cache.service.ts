import { CACHE_MANAGER, Inject } from "@nestjs/common";
import { Cache } from "cache-manager";

const ONE_DAY = 60 * 60 * 24;

export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  save = async (key: string, value: any): Promise<void> => {
    await this.cacheManager.set(key, value, ONE_DAY);
  };

  fetch = (key: string): Promise<any> => {
    return this.cacheManager.get(key);
  };

  fetchAll = async (): Promise<any> => {
    // const keys = await this.cacheManager.store.keys();
    // return await Promise.all(keys.map((key) => this.cacheManager.get(key)));
  };
}
