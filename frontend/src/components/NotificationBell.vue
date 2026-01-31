<template>
  <el-dropdown trigger="click" @visible-change="onVisibleChange">
    <el-badge :value="unreadCount" :hidden="unreadCount === 0" class="notification-badge">
      <el-icon :size="20"><Bell /></el-icon>
    </el-badge>
    <template #dropdown>
      <el-dropdown-menu class="notification-menu">
        <div class="notification-header">
          <span>通知</span>
          <el-button link v-if="unreadCount > 0" @click="markAllRead">全部已读</el-button>
        </div>
        <el-dropdown-item
          v-for="notification in notifications"
          :key="notification.id"
          :class="{ unread: !notification.isRead }"
          @click="handleClick(notification)"
        >
          <div class="notification-item">
            <p class="notification-content">{{ notification.content }}</p>
            <span class="notification-time">{{ formatTime(notification.createdAt) }}</span>
          </div>
        </el-dropdown-item>
        <el-dropdown-item v-if="notifications.length === 0" disabled>
          暂无通知
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script>
import { ref, onMounted } from 'vue';
import axios from 'axios';

export default {
  name: 'NotificationBell',

  setup() {
    const notifications = ref([]);
    const unreadCount = ref(0);

    const fetchNotifications = async () => {
      try {
        const response = await axios.get('/api/notifications');
        notifications.value = response.data.notifications;
        unreadCount.value = response.data.unreadCount;
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    };

    const markAllRead = async () => {
      try {
        await axios.put('/api/notifications/read-all');
        fetchNotifications();
      } catch (error) {
        console.error('Failed to mark all read:', error);
      }
    };

    const handleClick = async (notification) => {
      if (!notification.isRead) {
        await axios.put(`/api/notifications/${notification.id}/read`);
        fetchNotifications();
      }
    };

    const onVisibleChange = (visible) => {
      if (visible) {
        fetchNotifications();
      }
    };

    const formatTime = (date) => {
      return new Date(date).toLocaleString('zh-CN');
    };

    onMounted(fetchNotifications);

    return {
      notifications,
      unreadCount,
      markAllRead,
      handleClick,
      onVisibleChange,
      formatTime
    };
  }
};
</script>

<style scoped>
.notification-badge {
  cursor: pointer;
  margin-right: 15px;
}
.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  border-bottom: 1px solid #ebeef5;
  font-weight: bold;
}
.notification-item {
  padding: 5px 0;
  max-width: 300px;
}
.notification-content {
  margin: 0 0 5px 0;
  font-size: 14px;
  line-height: 1.4;
}
.notification-time {
  font-size: 12px;
  color: #909399;
}
.unread {
  background: #f0f9ff;
}
</style>
