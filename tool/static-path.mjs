import { isAbsolute, relative, resolve, sep } from 'node:path';

/**
 * 把 HTTP pathname 收敛到静态根目录内。返回 null 代表编码错误、base path 不匹配
 * 或目录穿越；调用方不得再把原始 pathname 交给文件系统 API。
 */
export function resolveStaticPath(root, rawPathname, basePath = '') {
  let pathname;
  try {
    pathname = decodeURIComponent(rawPathname);
  } catch {
    return null;
  }
  if (pathname.includes('\0')) return null;
  if (basePath && pathname !== basePath && !pathname.startsWith(basePath + '/')) return null;

  const stripped = basePath ? pathname.slice(basePath.length) || '/' : pathname;
  const relativeName = stripped === '/' ? 'index.html' : stripped.replace(/^\/+/, '');
  const rootPath = resolve(root);
  const filePath = resolve(rootPath, relativeName);
  const relation = relative(rootPath, filePath);
  if (relation === '..' || relation.startsWith('..' + sep) || isAbsolute(relation)) return null;
  return filePath;
}
