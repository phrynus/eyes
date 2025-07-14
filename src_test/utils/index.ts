/**
 * 生成随机字符串
 * @param length 字符串长度
 * @returns 随机字符串
 */
export function generateRandomString(length: number): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

/**
 * 格式化日期
 * @param date 日期
 * @param format 格式
 * @returns 格式化后的日期字符串
 */
export function formatDate(date: Date, format: string = 'YYYY-MM-DD HH:mm:ss'): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
}

/**
 * 检查权限
 * @param userPermissions 用户权限列表
 * @param requiredPermission 需要的权限
 * @returns 是否有权限
 */
export function checkPermission(userPermissions: string[], requiredPermission: string): boolean {
  // 检查是否有通配符权限
  if (userPermissions.includes('*:*:*')) {
    return true;
  }
  
  // 拆分权限代码
  const [reqResource, reqTarget, reqAction] = requiredPermission.split(':');
  
  // 检查每个权限
  return userPermissions.some(code => {
    const [resource, target, action] = code.split(':');
    
    // 检查资源是否匹配（*表示所有）
    const resourceMatch = resource === '*' || resource === reqResource;
    if (!resourceMatch) return false;
    
    // 检查目标是否匹配（*表示所有）
    const targetMatch = target === '*' || target === reqTarget;
    if (!targetMatch) return false;
    
    // 检查操作是否匹配（*表示所有）
    const actionMatch = action === '*' || action === reqAction;
    return actionMatch;
  });
} 