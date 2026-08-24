import { existsSync } from 'node:fs';

const CHROME_CANDIDATES = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
];

export function findBrowser() {
  return CHROME_CANDIDATES.find((path) => existsSync(path));
}

async function findPageSocket(debugPort) {
  for (let i = 0; i < 80; i++) {
    try {
      const targets = await fetch(`http://127.0.0.1:${debugPort}/json/list`).then((res) => res.json());
      const page = targets.find((target) => target.type === 'page');
      if (page?.webSocketDebuggerUrl) return page.webSocketDebuggerUrl;
    } catch {
      // 浏览器还没启动完成。
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error('连不上 CDP');
}

export async function openCdp(debugPort) {
  const socket = new WebSocket(await findPageSocket(debugPort));
  await new Promise((resolve) => socket.addEventListener('open', resolve, { once: true }));

  let nextId = 0;
  const pending = new Map();
  const listeners = [];
  socket.addEventListener('message', (event) => {
    const message = JSON.parse(event.data);
    if (message.id === undefined) {
      for (const listener of listeners) listener(message);
      return;
    }
    const request = pending.get(message.id);
    pending.delete(message.id);
    message.error
      ? request.reject(new Error(JSON.stringify(message.error)))
      : request.resolve(message.result);
  });

  return {
    socket,
    onEvent(listener) {
      listeners.push(listener);
    },
    send(method, params = {}) {
      const id = ++nextId;
      return new Promise((resolve, reject) => {
        pending.set(id, { resolve, reject });
        socket.send(JSON.stringify({ id, method, params }));
      });
    },
  };
}
