import { describe, expect, it } from 'vitest';

import { fetchWithTimeout } from '../src/fetch-timeout';

describe('fetchWithTimeout', () => {
  it('用 AbortController 取消超时子请求，不依赖 AbortSignal.timeout', async () => {
    const fetcher = ((_input: Request | string, init?: RequestInit) =>
      new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => reject(new Error('aborted')), {
          once: true,
        });
      })) as typeof fetch;

    await expect(fetchWithTimeout(fetcher, 'https://example.test', {}, 1)).rejects.toThrow(
      'aborted',
    );
  });
});
