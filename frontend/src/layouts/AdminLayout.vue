<template>
  <el-container class="admin-layout">
    <el-aside width="220px">
      <div class="logo">管理后台</div>
      <el-menu
        :default-active="$route.path"
        router
        class="sidebar-menu"
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
      >
        <el-menu-item index="/admin/dashboard">
          <el-icon><DataLine /></el-icon>
          <span>数据概览</span>
        </el-menu-item>
        <el-menu-item index="/admin/documents">
          <el-icon><Document /></el-icon>
          <span>文件管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/assignments">
          <el-icon><List /></el-icon>
          <span>任务管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/users">
          <el-icon><User /></el-icon>
          <span>用户管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/departments">
          <el-icon><OfficeBuilding /></el-icon>
          <span>部门管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/statistics">
          <el-icon><TrendCharts /></el-icon>
          <span>学习统计</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="header">
        <div class="header-left">
          <span class="breadcrumb">管理员控制台</span>
        </div>
        <div class="header-right">
          <el-button @click="$router.push('/')">返回前台</el-button>
          <el-dropdown @command="handleCommand">
            <span class="user-info">
              {{ authStore.user?.name }}
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import { useAuthStore } from '@/store/modules/auth';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';

export default {
  name: 'AdminLayout',

  setup() {
    const authStore = useAuthStore();
    const router = useRouter();

    const handleCommand = (command) => {
      if (command === 'logout') {
        authStore.logout();
        ElMessage.success('已退出登录');
        router.push('/login');
      }
    };

    return {
      authStore,
      handleCommand
    };
  }
};
</script>

<style scoped>
.admin-layout {
  min-height: 100vh;
}
.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: bold;
  color: #fff;
  background: #304156;
}
.el-aside {
  background: #304156;
}
.sidebar-menu {
  border-right: none;
}
.header {
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}
.user-info {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
}
.el-main {
  background: #f5f7fa;
  padding: 20px;
}
</style>
