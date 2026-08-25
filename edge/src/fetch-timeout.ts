/** Workers 兼容的可取消 fetch 超时；不依赖运行时是否实现 AbortSignal.timeout。 */
export async function fetchWithTimeout(
  fetcher: typeof fetch,
  input: Request | string,
  init: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetcher(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}
