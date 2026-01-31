# 企业内部学习平台设计文档

## 1. 项目概述

一个用于企业内部文件学习的网页应用，解决因出差等原因错过集体学习的问题。

### 1.1 核心功能
- 管理员：上传学习文件、设置学习要求（时间、题目、必学成员）、查看学习情况
- 普通用户：在线学习文件，系统检测并记录真实学习情况

### 1.2 约束条件
- 兼容老旧电脑（Win7-32位）
- 部署在内网服务器，使用 Docker
- 复用现有的 PostgreSQL 和 MinIO 服务
- 先实现独立账号系统，后续对接 OA 单点登录

---

## 2. 技术架构

### 2.1 技术栈
- **前端**：Vue 3（Options API 保证兼容性）+ Element Plus + Vue Router + Pinia
- **后端**：Node.js + Express + Sequelize ORM
- **数据库**：PostgreSQL（复用现有服务）
- **文件存储**：MinIO（复用现有服务）
- **部署**：Docker Compose

### 2.2 容器架构
```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Nginx (前端)   │────▶│  Node.js (后端)  │────▶│  PostgreSQL    │
│   Port: 80      │     │   Port: 3000    │     │  (现有容器)      │
└─────────────────┘     └────────┬────────┘     └─────────────────┘
                                 │
                                 ▼
                          ┌─────────────────┐
                          │   MinIO         │
                          │  (现有容器)      │
                          │  文件存储        │
                          └─────────────────┘
```

---

## 3. 数据库设计

### 3.1 核心数据表

| 表名 | 说明 |
|------|------|
| users | 用户表（id, username, password_hash, name, department_id, role, status） |
| departments | 部门表（id, name, parent_id） |
| documents | 文件表（id, title, description, file_url, file_type, file_size, uploader_id） |
| assignments | 学习任务表（id, document_id, required_time, has_quiz, deadline, created_by） |
| assignment_targets | 任务指派表（id, assignment_id, target_id, target_type） |
| learning_records | 学习记录表（id, user_id, assignment_id, start_time, end_time, progress, scroll_data） |
| quizzes | 测验表（id, assignment_id, question, options, correct_answer） |
| quiz_answers | 测验答案表（id, user_id, quiz_id, answer, is_correct） |
| notifications | 通知表（id, user_id, type, content, is_read） |

### 3.2 关键字段说明
- `scroll_data`: JSON 类型，存储用户滚动过的页面区域百分比数组
- `progress`: 0-100 的整数，表示学习进度
- `target_type`: enum('user', 'department')，指派对象类型

---

## 4. 功能模块

### 4.1 文件管理模块
- 管理员上传文件到 MinIO（支持拖拽上传）
- PDF 使用 PDF.js 预览
- Word 使用 mammoth.js 前端转换为 HTML 预览
- 视频文件使用原生 video 标签播放

### 4.2 学习任务模块
- 管理员创建任务：选择文件 → 设置必学人员/部门 → 可选设置测试题
- 任务发布时生成站内通知给目标用户
- 支持查看任务进度（按人/按部门统计）

### 4.3 学习检测模块（核心）
- 前端定时上报：当前滚动位置、页面可见性
- 记录用户真实浏览过的页面区域（去重计算），完成标准：浏览过 80% 内容
- 视频学习：禁止倍速、记录实际播放进度
- 定期活跃检测：每3分钟要求点击确认（防挂机）

### 4.4 学习记录模块
- 用户查看"我的任务"列表（待学习/已完成/已逾期）
- 学习过程实时保存进度，下次继续学习
- 完成学习后生成学习记录

### 4.5 统计报表模块
- 管理员看板：整体完成率、各部门对比、逾期人员列表
- 导出 Excel 报表

---

## 5. 页面路由

### 5.1 公共路由
- `/login` - 登录页

### 5.2 管理员路由
- `/admin/dashboard` - 管理看板
- `/admin/documents` - 文件管理
- `/admin/assignments` - 学习任务管理
- `/admin/assignments/:id/progress` - 任务详情/进度
- `/admin/users` - 用户管理
- `/admin/departments` - 部门管理

### 5.3 用户路由
- `/user/dashboard` - 个人中心
- `/user/tasks` - 我的任务列表
- `/user/learn/:assignmentId` - 学习页面
- `/user/history` - 学习历史记录

---

## 6. API 接口

### 6.1 认证模块
- `POST /api/auth/login` - 登录
- `POST /api/auth/logout` - 退出
- `GET /api/auth/me` - 获取当前用户信息

### 6.2 文件模块
- `POST /api/documents` - 上传文件
- `GET /api/documents` - 文件列表
- `DELETE /api/documents/:id` - 删除文件

### 6.3 学习任务模块
- `POST /api/assignments` - 创建学习任务
- `GET /api/assignments` - 任务列表
- `GET /api/assignments/:id` - 任务详情
- `GET /api/assignments/:id/progress` - 学习进度统计
- `PUT /api/assignments/:id` - 更新任务

### 6.4 学习模块
- `GET /api/my-tasks` - 我的任务列表
- `GET /api/my-tasks/:id` - 任务详情
- `POST /api/learning/:assignmentId/progress` - 上报学习进度
- `POST /api/learning/:assignmentId/complete` - 标记学习完成
- `POST /api/quiz/:assignmentId/submit` - 提交测试答案

### 6.5 支持性接口
- `GET /api/departments` - 部门列表
- `GET /api/users` - 用户列表（支持按部门筛选）
- `GET /api/notifications` - 获取通知列表
- `PUT /api/notifications/:id/read` - 标记已读

---

## 7. 部署方案

### 7.1 开发环境
使用 `docker-compose.dev.yml`，包含完整服务：
- frontend (Vue 应用)
- backend (Node.js API)
- postgres (PostgreSQL 开发实例)
- minio (MinIO 开发实例)

### 7.2 生产环境迁移
修改后端环境变量指向现有服务：
- `DB_HOST` - 公司 PostgreSQL 内网 IP
- `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- `MINIO_HOST` - 公司 MinIO 内网 IP
- `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY`

### 7.3 兼容性处理
- Vue3 使用 Options API
- Babel 转译为 ES5 语法
- 支持 Edge/Chrome 较老版本（不支持 IE）

---

## 8. 开发计划

### 阶段1：基础架构
1. 搭建 Docker 开发环境
2. 创建数据库表结构
3. 实现用户认证（登录/登出）

### 阶段2：管理员功能
1. 文件上传与管理
2. 部门/用户管理
3. 学习任务创建与管理

### 阶段3：学习功能
1. 文件预览（PDF/Word/视频）
2. 学习进度检测与上报
3. 测试题功能

### 阶段4：统计与优化
1. 学习进度统计报表
2. 通知系统
3. 性能优化与测试
