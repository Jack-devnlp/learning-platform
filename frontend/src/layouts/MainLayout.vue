<template>
  <el-container class="main-layout">
    <el-aside width="200px">
      <div class="logo">学习平台</div>
      <el-menu
        :default-active="$route.path"
        router
        class="sidebar-menu"
      >
        <el-menu-item index="/dashboard">
          <el-icon><HomeFilled /></el-icon>
          <span>首页</span>
        </el-menu-item>
        <el-menu-item index="/tasks">
          <el-icon><Document /></el-icon>
          <span>我的任务</span>
        </el-menu-item>
        <el-menu-item index="/history">
          <el-icon><Clock /></el-icon>
          <span>学习历史</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="header">
        <div class="header-right">
          <notification-bell />
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
import NotificationBell from '@/components/NotificationBell.vue';

export default {
  name: 'MainLayout',

  components: {
    NotificationBell
  },

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
.main-layout {
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
  background: #304156;
}

.header {
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
}

.el-main {
  background: #f5f7fa;
}
</style>
