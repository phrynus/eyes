import { Elysia } from 'elysia';

// 导入所有认证路由
import registerPost from './register.post';
import loginPost from './login.post';
import refreshPost from './refresh.post';
import logoutPost from './logout.post';
import totpSetupPost from './totp-setup.post';
import totpVerifyPost from './totp-verify.post';

export default new Elysia({ prefix: '/auth' }).use(registerPost).use(loginPost).use(refreshPost).use(logoutPost).use(totpSetupPost).use(totpVerifyPost);
