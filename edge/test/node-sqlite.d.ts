/**
 * 测试里用 Node 自带的 SQLite 跑 DownloadLedger（生产是 Durable Object 的 ctx.storage.sql）。
 * 只声明用到的两个方法，省掉整套 @types/node——edge 的 tsconfig 只带 workers-types。
 */
declare module 'node:sqlite' {
  export class DatabaseSync {
    constructor(path: string);
    prepare(sql: string): {
      run(...bindings: unknown[]): unknown;
      all(...bindings: unknown[]): Record<string, unknown>[];
    };
  }
}
