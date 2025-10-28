import { app } from '~/routes';
import { Applications } from '~/models/Application';

import { sqlite } from '~/config/sqlite';

// sqlite.init(); // 初始化数据库

// 启动服务;
app.listen((process.env.PORT as string) || 3000, () => {
  console.log(`服务器已启动，手册：http://localhost:${app.server?.port}/openapi`);
});

// let s = await sqlite.set({
//   key: 'app_name',
//   value: '测试应用',
//   expire: '1d',
// });
// console.log(s);

// let user = new Users();
// let applications = new Applications();

// console.log(await applications.create({ app_name: '测试应用' }));

// console.log(await applications.getAllApplications());

// console.log(await applications.getApplicationById('01994c94-1d3c-7000-bb69-53b78960d799'));

// let dbb = await user.create({ username: 'admin21', password: '123456Ab.' }).catch((err) => {
//   return err;
// });
// console.log(dbb);

// let password = await passwordUtils.hash('123456');
// console.log(password);
// console.log(await passwordUtils.verify('123456', password));

// import * as OTPAuth from 'otpauth';
// let totp = new OTPAuth.TOTP({
//   issuer: 'MyApp', // 签发者
//   label: 'user@example.com', // 邮箱
//   algorithm: 'SHA1', // 算法
// });

// console.log(totp, totp.secret.base32, totp.toString());
