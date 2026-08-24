/**
 * 熔断状态存储。
 *
 * 生产实现落在 Cloudflare Cache API 上：熔断状态天生就该按 colo 隔离——
 * 东京边缘到 GitHub Pages 不通，不代表法兰克福边缘也不通。全局 KV 会把
 * 单点探测结果放大成全球降级，是错的数据模型。
 */
export interface HealthStore {
  /** 该源当前是否处于熔断（不健康）状态。 */
  isDown(name: string): Promise<boolean>;
  /** 标记该源不健康，冷却 ttlSeconds 秒后自动恢复到半开状态。 */
  markDown(name: string, ttlSeconds: number): Promise<void>;
  /** 标记该源健康，立即清除熔断。 */
  markUp(name: string): Promise<void>;
}

const BREAKER_ORIGIN = 'https://breaker.fushi.invalid/';

/** 基于 Cloudflare Cache API 的 per-colo 熔断存储。 */
export class CacheHealthStore implements HealthStore {
  constructor(private readonly cache: Cache) {}

  private key(name: string): Request {
    return new Request(BREAKER_ORIGIN + encodeURIComponent(name));
  }

  async isDown(name: string): Promise<boolean> {
    const hit = await this.cache.match(this.key(name));
    return hit !== undefined;
  }

  async markDown(name: string, ttlSeconds: number): Promise<void> {
    const ttl = Math.max(1, Math.floor(ttlSeconds));
    await this.cache.put(
      this.key(name),
      new Response('down', {
        headers: { 'Cache-Control': `max-age=${ttl}` },
      }),
    );
  }

  async markUp(name: string): Promise<void> {
    await this.cache.delete(this.key(name));
  }
}

/** 测试与本地开发用的内存实现。 */
export class MemoryHealthStore implements HealthStore {
  private readonly downUntil = new Map<string, number>();

  constructor(private now: () => number = () => Date.now()) {}

  setClock(now: () => number): void {
    this.now = now;
  }

  async isDown(name: string): Promise<boolean> {
    const until = this.downUntil.get(name);
    if (until === undefined) return false;
    if (this.now() >= until) {
      this.downUntil.delete(name);
      return false;
    }
    return true;
  }

  async markDown(name: string, ttlSeconds: number): Promise<void> {
    this.downUntil.set(name, this.now() + ttlSeconds * 1000);
  }

  async markUp(name: string): Promise<void> {
    this.downUntil.delete(name);
  }
}
