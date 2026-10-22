import { describe, expect, it } from 'vitest';
import { httpsRedirect } from '../src/https';

describe('httpsRedirect', () => {
  it('http 规范域名 308 到 https 同路径、保留查询串', () => {
    const res = httpsRedirect(new URL('http://fushi.moe/faq/youtube.en?x=1#h'), 'fushi.moe');
    expect(res?.status).toBe(308);
    expect(res?.headers.get('location')).toBe('https://fushi.moe/faq/youtube.en?x=1#h');
  });

  it('https 不跳', () => {
    expect(httpsRedirect(new URL('https://fushi.moe/'), 'fushi.moe')).toBeNull();
  });

  it('www 子域（http / https）308 到规范域名同路径', () => {
    for (const u of ['https://www.fushi.moe/download?a=1', 'http://www.fushi.moe/download?a=1']) {
      const res = httpsRedirect(new URL(u), 'fushi.moe');
      expect(res?.status).toBe(308);
      expect(res?.headers.get('location')).toBe('https://fushi.moe/download?a=1');
    }
  });

  it('非规范域名不改写', () => {
    expect(httpsRedirect(new URL('http://fushi-moe-edge.example.workers.dev/'), 'fushi.moe')).toBeNull();
  });
});
