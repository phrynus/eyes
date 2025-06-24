import { Elysia } from 'elysia';

// 可缓存的内容类型正则表达式
const CACHEABLE_REGEX = /^(image|video|audio|font|css|javascript|pdf|zip)/i;

// 类型定义
type StaticAssetOptions = {
  maxAge?: number;
  cacheControl?: string;
};

export const staticAssets =
  (maxAge = 31536000) =>
  (app: Elysia) =>
    app.mapResponse(async ({ response, set }: any) => {
      try {
        const contentType = response?.headers?.get('Content-Type') || '';
        if (CACHEABLE_REGEX.test(contentType)) {
          set.headers['Cache-Control'] = `public, max-age=${maxAge}, immutable`;
        } else {
          set.headers['Cache-Control'] = 'no-cache';
        }
      } catch (error) {
        console.error('Static assets middleware error:', error);
      }
    });
