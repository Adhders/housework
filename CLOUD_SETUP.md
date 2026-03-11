# 云开发配置指南

本项目已升级为使用微信云开发，实现真实的数据存储和跨设备同步。

## 一、开通云开发

### 1. 在微信开发者工具中开通云开发

1. 打开微信开发者工具
2. 点击工具栏的"云开发"按钮
3. 点击"开通"
4. 填写环境名称（如：housework-prod）
5. 选择基础版（免费）或按需选择其他版本
6. 点击"开通"

### 2. 获取环境ID

开通后，在云开发控制台可以看到你的环境ID，格式类似：`housework-prod-xxxxx`

## 二、配置项目

### 1. 修改 app.js

将 `e:/project/housework/app.js` 中的环境ID替换为你的环境ID：

```javascript
wx.cloud.init({
  env: 'your-env-id', // 替换为你的云开发环境ID
  traceUser: true,
});
```

### 2. 修改 project.config.json

在 `e:/project/housework/project.config.json` 中添加云开发配置：

```json
{
  "cloudfunctionRoot": "cloud/functions/",
  "cloudbaseRoot": "cloud/",
  "miniprogramRoot": "./",
  "cloudfunctionTemplateRoot": "cloudfunctionTemplate/"
}
```

## 三、创建数据库

### 1. 创建数据库集合

在云开发控制台 -> 数据库 -> 添加集合：

**users 集合（用户表）：**
- 字段：
  - _openid (string, 自动)
  - name (string)
  - phone (string)
  - role (string)
  - createTime (number)
  - updateTime (number)

**orders 集合（订单表）：**
- 字段：
  - _openid (string, 自动)
  - dispatcherId (string)
  - dispatcherName (string)
  - workerId (string)
  - workerName (string)
  - workerPhone (string)
  - serviceType (string)
  - serviceTypeName (string)
  - price (number)
  - duration (number)
  - serviceDate (string)
  - serviceTime (string)
  - serviceTimeStart (string)
  - serviceTimeEnd (string)
  - address (string)
  - contactName (string)
  - contactPhone (string)
  - requirements (string)
  - status (string)
  - grabTime (number)
  - createTime (number)
  - updateTime (number)

### 2. 设置数据库权限

在数据库权限设置中选择"自定义权限规则"：

**users 集合：**
```json
{
  "read": "auth.openid == doc._openid",
  "write": "auth.openid == doc._openid"
}
```

**orders 集合：**
```json
{
  "read": "auth.openid == doc._openid || auth.openid == doc.workerOpenid",
  "write": "auth.openid == doc._openid"
}
```

## 四、上传云函数

### 1. 安装云函数依赖

在云开发控制台 -> 云函数 -> 新建云函数

或者在本地使用终端：

```bash
cd cloud/functions/getOpenId
npm install

cd ../orderManager
npm install

cd ../userManager
npm install
```

### 2. 上传云函数

在微信开发者工具中：

1. 右键点击 `cloud/functions/getOpenId` 文件夹
2. 选择"上传并部署：云端安装依赖"
3. 等待上传完成
4. 重复以上步骤上传 `orderManager` 和 `userManager` 云函数

### 3. 测试云函数

在云开发控制台 -> 云函数 -> 选择函数 -> 测试

测试 getOpenId：
```json
{}
```

## 五、配置云函数权限

在云开发控制台 -> 云函数 -> 权限配置

选择"允许所有用户访问"或根据需要设置特定权限

## 六、测试运行

### 1. 编译项目

点击微信开发者工具的"编译"按钮

### 2. 测试登录

1. 在登录页选择角色（派单员/家政阿姨）
2. 输入姓名和手机号
3. 点击登录
4. 检查数据库 users 集合是否新增用户记录

### 3. 测试订单功能

**派单员：**
1. 发布订单
2. 检查数据库 orders 集合是否新增订单记录
3. 在订单管理中查看订单
4. 测试取消和完成订单

**家政阿姨：**
1. 在订单大厅查看可接订单
2. 测试抢单功能
3. 检查订单状态是否更新
4. 在我的订单中查看已接订单

## 七、注意事项

### 1. 环境ID配置

确保在 `app.js` 中正确配置了云开发环境ID，否则云函数调用会失败。

### 2. 权限设置

数据库权限设置很重要，确保：
- 用户只能查看和修改自己的数据
- 派单员可以管理自己的订单
- 家政阿姨可以查看可接订单和自己的订单

### 3. 云函数调试

如果遇到问题，可以在云开发控制台查看云函数日志进行调试。

### 4. 配额限制

免费版云开发有配额限制：
- 数据库读写次数：100万次/天
- 云函数调用次数：20万次/天
- 存储空间：2GB

如需更高配额，可以升级到付费版本。

### 5. 数据库索引

为提高查询性能，建议在 orders 集合上创建索引：
- status
- createTime
- dispatcherId
- workerId

## 八、常见问题

### Q1: 云函数调用失败

A: 检查：
1. 环境ID是否正确配置
2. 云函数是否已上传并部署
3. 云函数权限是否正确设置

### Q2: 数据库操作失败

A: 检查：
1. 数据库集合是否已创建
2. 数据库权限是否正确设置
3. 云函数中数据库操作逻辑是否正确

### Q3: 用户登录失败

A: 检查：
1. 用户信息是否填写完整
2. 手机号格式是否正确
3. userManager 云函数是否正常工作

### Q4: 订单无法显示

A: 检查：
1. orders 集合中是否有数据
2. 订单状态是否正确
3. 前端筛选逻辑是否正确

## 九、后续优化建议

1. **数据库索引优化**
   - 为常用查询字段创建索引
   - 使用聚合查询优化复杂查询

2. **云函数性能优化**
   - 使用缓存减少数据库查询
   - 异步处理耗时操作

3. **安全加固**
   - 实现更严格的权限控制
   - 添加数据验证和过滤
   - 实现防刷机制

4. **监控和日志**
   - 配置云开发监控告警
   - 完善云函数日志记录
   - 添加用户行为追踪

5. **扩展功能**
   - 实现消息推送
   - 添加订单评价功能
   - 集成支付功能
   - 添加位置服务

## 十、技术支持

如遇到问题，可以查看：
- 微信云开发官方文档：https://developers.weixin.qq.com/miniprogram/dev/wxcloud/basis/getting-started.html
- 云函数文档：https://developers.weixin.qq.com/miniprogram/dev/wxcloud/guide/functions.html
- 云数据库文档：https://developers.weixin.qq.com/miniprogram/dev/wxcloud/guide/database.html
