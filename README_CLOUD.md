# 家政服务小程序 - 云开发版本

基于微信云开发的家政服务派单系统，支持派单员发布订单和家政阿姨抢单功能，实现真实的数据存储和跨设备同步。

## 云开发特性

✅ **云数据库** - 持久化存储订单和用户数据  
✅ **云函数** - 安全的服务端逻辑处理  
✅ **用户认证** - 基于 openid 的身份识别  
✅ **跨设备同步** - 数据实时同步到云端  
✅ **权限控制** - 精细的数据访问权限管理  

## 功能特性

### 派单员功能
- ✅ 发布家政服务订单（云端存储）
- ✅ 管理订单（查看、取消、完成）
- ✅ 查看订单统计（实时数据）
- ✅ 联系阿姨
- ✅ 查看订单详情

### 家政阿姨功能
- ✅ 浏览可接订单（实时更新）
- ✅ 快速抢单（云函数处理）
- ✅ 查看我的订单
- ✅ 联系客户
- ✅ 查看订单详情

### 订单管理
- 📋 订单状态：待接单、已接单、已完成、已取消
- 🏷️ 服务类型：日常保洁、深度清洁、做饭服务、老人护理、儿童托管、宠物护理
- 🔍 订单筛选：按状态、类型、价格筛选
- 🔎 关键词搜索

## 项目结构

```
housework/
├── app.js/json/wxss          # 小程序配置和入口
├── project.config.json       # 项目配置
├── cloud/                     # 云开发目录
│   ├── functions/            # 云函数
│   │   ├── getOpenId/        # 获取openid
│   │   ├── orderManager/     # 订单管理
│   │   └── userManager/      # 用户管理
│   └── database.json         # 数据库结构定义
├── utils/                     # 工具类
│   ├── cloudStorage.js       # 云数据库操作
│   ├── userManager.js        # 用户管理
│   └── util.js               # 通用工具函数
└── pages/                     # 页面目录
    ├── index/                # 首页
    ├── login/                # 登录页
    ├── dispatcher/           # 派单员模块
    └── worker/               # 家政阿姨模块
```

## 云函数说明

### 1. getOpenId
获取用户的 openid，用于身份识别。

### 2. orderManager
订单管理云函数，提供订单的增删改查功能。

支持的操作：
- create - 创建订单
- update - 更新订单
- get - 获取订单详情
- getAvailable - 获取可抢单列表
- getDispatcherOrders - 获取派单员的订单
- getWorkerOrders - 获取阿姨的订单
- grab - 抢单
- cancel - 取消订单
- complete - 完成订单

### 3. userManager
用户管理云函数，提供用户的登录和注册功能。

支持的操作：
- login - 登录/注册
- get - 获取用户信息
- update - 更新用户信息

## 数据库结构

### users 集合
- _openid (string) - 用户openid（自动）
- name (string) - 用户姓名
- phone (string) - 手机号
- role (string) - 角色：dispatcher/worker
- createTime (number) - 创建时间
- updateTime (number) - 更新时间

### orders 集合
- _openid (string) - 派单员openid（自动）
- dispatcherId (string) - 派单员ID
- dispatcherName (string) - 派单员姓名
- workerId (string) - 接单人ID
- workerName (string) - 接单人姓名
- workerPhone (string) - 接单人电话
- serviceType (string) - 服务类型
- price (number) - 价格
- duration (number) - 服务时长
- address (string) - 服务地址
- status (string) - 状态：pending/accepted/completed/cancelled
- createTime (number) - 创建时间
- updateTime (number) - 更新时间

## 快速开始

详见 `CLOUD_SETUP.md` 配置指南。

## 技术栈

- 微信小程序原生开发
- 微信云开发（云数据库、云函数）
- 组件化开发
- 响应式设计

## 与本地存储版本的区别

| 特性 | 本地存储版本 | 云开发版本 |
|------|-------------|-----------|
| 数据持久化 | 本地 | 云端 |
| 跨设备同步 | ❌ | ✅ |
| 多用户协作 | ❌ | ✅ |
| 数据安全 | 较低 | 高 |
| 可扩展性 | 有限 | 优秀 |
| 用户认证 | 简单 | 基于openid |

## 许可证

MIT License
