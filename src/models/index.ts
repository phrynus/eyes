// 导出所有模型
import { Users } from './User';
import { Applications } from './Application';

// 默认导出所有模型
export default {
  user: new Users(),
  application: new Applications(),
};
