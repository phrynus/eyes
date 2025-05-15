import log from '@/utils/logger';

if (Bun.env.NODE_ENV === 'development') {
  log.info('开发环境');
}
