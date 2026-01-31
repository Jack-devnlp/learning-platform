# 企业内部学习平台 - 第二阶段实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 完成管理员功能模块、学习任务模块、学习记录模块、测验模块、统计报表模块和通知模块

**Architecture:** 前后端分离架构，前端 Vue3 + Element Plus，后端 Node.js + Express + Sequelize，数据库 PostgreSQL，文件存储 MinIO

**Tech Stack:** Vue3, Node.js, Express, Sequelize, PostgreSQL, MinIO, Docker, JWT

---

## 完整任务列表

| 阶段 | 任务 | 内容 | 状态 |
|------|------|------|------|
| 阶段5 | Task 13 | 管理员仪表盘页面 | 计划中 |
| 阶段5 | Task 14 | 文件管理页面 | 计划中 |
| 阶段5 | Task 15 | 用户管理页面 | 计划中 |
| 阶段6 | Task 16 | 部门管理页面 | 计划中 |
| 阶段6 | Task 17 | 任务管理功能 | 计划中 |
| 阶段7 | Task 18 | 用户 Dashboard | 计划中 |
| 阶段8 | Task 19 | 学习页面（进度跟踪） | 计划中 |
| 阶段8 | Task 20 | 测验模块 | 计划中 |
| 阶段9 | Task 21 | 通知系统 | 计划中 |
| 阶段10 | Task 22 | Docker 生产部署 | 计划中 |

---

## 阶段5：管理员功能模块（续）

### Task 13: 实现管理员仪表盘页面

**Files:**
- Create: `frontend/src/views/admin/Dashboard.vue`
- Create: `frontend/src/layouts/AdminLayout.vue`
- Create: `backend/src/routes/admin.js`

**Step 1: 创建 AdminLayout.vue** (侧边栏导航布局)

**Step 2: 创建 Admin Dashboard 页面** (统计数据卡片、最近文件/学习记录表格)

**Step 3: 创建后端 admin stats API** (/api/admin/stats)

**Commit:** `feat: add admin dashboard with statistics`

---

### Task 14: 实现文件管理页面

**Files:**
- Create: `frontend/src/views/admin/Documents.vue`

**详细实现：**
- 文件列表表格（文件名、类型、大小、上传者、时间）
- 搜索功能、分页
- 上传对话框（标题、描述、文件选择）
- 删除功能（软删除）

**Commit:** `feat: add document management page for admin`

---

### Task 15: 实现用户管理页面

**Files:**
- Create: `backend/src/routes/users.js`
- Create: `frontend/src/views/admin/Users.vue`

**详细实现：**
- 用户 CRUD API (GET/POST/PUT/DELETE)
- 用户列表表格（用户名、姓名、角色、部门、状态）
- 添加/编辑对话框（用户名、密码、姓名、角色、部门）
- 启用/禁用功能

**Commit:** `feat: add user management for admin`

---

### Task 16: 实现部门管理页面

**Files:**
- Create: `backend/src/routes/departments.js`
- Create: `frontend/src/views/admin/Departments.vue`

**详细实现：**
- 部门 CRUD API
- 树形结构展示（技术部 > 前端组/后端组）
- 父部门选择

**Commit:** `feat: add department management with tree structure`

---

## 阶段6：任务管理模块

### Task 17: 实现任务管理功能

**Files:**
- Create: `backend/src/routes/assignments.js`
- Create: `frontend/src/views/admin/Assignments.vue`

**详细实现：**
- 任务 CRUD API
- 创建任务对话框：
  - 选择学习文件
  - 指派给（多选：部门/用户）
  - 设置要求时长（分钟）
  - 设置截止日期
  - 是否包含测验
- 自动为指派用户创建 LearningRecord

**Commit:** `feat: add assignment management with target selection`

---

## 阶段7：用户学习模块

### Task 18: 实现用户 Dashboard 页面

**Files:**
- Create: `frontend/src/views/Dashboard.vue`
- Create: `backend/src/routes/learning.js`

**详细实现：**
- /api/learning/my-tasks API
- 统计卡片：总任务、学习中、已完成、完成率
- 任务列表表格（文件名称、状态、进度、操作）

**Commit:** `feat: add user dashboard with learning statistics`

---

## 阶段8：学习功能模块

### Task 19: 实现学习页面（文档浏览 + 进度跟踪）

**Files:**
- Create: `frontend/src/views/Learning.vue`
- Modify: `backend/src/routes/learning.js`

**详细实现：**
- /api/learning/progress/:id GET/POST API
- PDF 浏览（iframe）
- Word 内容渲染（HTML）
- 视频播放（video 标签）
- 自动进度更新（每30秒）
- 学习时长统计
- 进度达到100%显示"进入测验"按钮

**Commit:** `feat: add learning page with progress tracking`

---

### Task 20: 实现测验模块

**Files:**
- Create: `backend/src/routes/quizzes.js`
- Create: `frontend/src/views/admin/QuizEditor.vue`
- Create: `frontend/src/views/Quiz.vue`

**详细实现：**
- 测验 CRUD API
- 管理员：题目编辑器
  - 题目输入
  - 选项添加/删除（A/B/C/D）
  - 设置正确答案
- 学员：答题页面
  - 单选题列表
  - 提交答案
  - 显示得分和结果

**Commit:** `feat: add quiz module with editor and student view`

---

## 阶段9：通知系统

### Task 21: 实现通知系统

**Files:**
- Create: `backend/src/routes/notifications.js`
- Create: `frontend/src/components/NotificationBell.vue`

**详细实现：**
- 通知 API (GET /api/notifications, PUT /:id/read)
- 消息铃铛组件（Header 右侧）
- 未读数量角标
- 下拉通知列表
- 全部已读功能

**Commit:** `feat: add notification system with bell component`

---

## 阶段10：部署配置

### Task 22: Docker 生产部署配置

**Files:**
- Create: `docker-compose.yml`
- Create: `backend/Dockerfile`
- Create: `frontend/Dockerfile`
- Create: `nginx/nginx.conf`

**详细实现：**
- 生产级 Docker Compose 配置
- 前端多阶段构建（Node 构建 + Nginx 服务）
- 后端生产 Dockerfile
- Nginx 反向代理配置（/api -> backend）

**Commit:** `feat: add Docker production deployment configuration`

---

**Plan complete and saved to `docs/plans/2026-01-31-learning-platform-phase2.md`.**

**Two execution options:**

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

**Which approach?**
