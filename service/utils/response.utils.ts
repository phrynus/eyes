import { BunRequest } from 'bun';
// 响应状态码枚举
export enum ResponseCode {
  SUCCESS = 200,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  INTERNAL_ERROR = 500,
  SERVICE_UNAVAILABLE = 503,
}

// 错误信息映射
export const ERROR_MESSAGES = {
  [ResponseCode.BAD_REQUEST]: '请求参数错误',
  [ResponseCode.UNAUTHORIZED]: '未授权访问',
  [ResponseCode.FORBIDDEN]: '禁止访问',
  [ResponseCode.NOT_FOUND]: '资源不存在',
  [ResponseCode.INTERNAL_ERROR]: '服务器内部错误',
  [ResponseCode.SERVICE_UNAVAILABLE]: '服务暂不可用',
} as const;

/**
 * 成功响应
 * @param data 响应数据
 * @param message 响应消息
 * @param code 响应码，默认200
 */
export function success<T = any>(data?: T, message: string = '操作成功', code: number = ResponseCode.SUCCESS) {
  const success = {
    code,
    message,
    data,
    timestamp: Date.now(),
  };
  return Response.json(success, {
    status: success.code,
  });
}

/**
 * 错误响应
 * @param code 错误码
 * @param message 错误消息
 * @param data 错误数据
 */
export function err(code: number = ResponseCode.INTERNAL_ERROR, message?: string, data?: any) {
  const error = {
    code,
    message: message || ERROR_MESSAGES[code as keyof typeof ERROR_MESSAGES] || '未知错误',
    data,
    timestamp: Date.now(),
  };
  throw Response.json(error, {
    status: error.code,
  });
}
