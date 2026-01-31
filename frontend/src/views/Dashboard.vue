<template>
  <div class="dashboard">
    <h2>欢迎使用学习平台</h2>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-icon blue">
            <el-icon><Document /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.total }}</div>
            <div class="stat-label">总任务</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-icon orange">
            <el-icon><Timer /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.inProgress }}</div>
            <div class="stat-label">学习中</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-icon green">
            <el-icon><CircleCheck /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.completed }}</div>
            <div class="stat-label">已完成</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-icon purple">
            <el-icon><TrendCharts /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ completionRate }}%</div>
            <div class="stat-label">完成率</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card style="margin-top: 20px;">
      <template #header>
        <span>我的学习任务</span>
      </template>
      <el-table :data="tasks" stripe>
        <el-table-column prop="Assignment.Document.title" label="文件名称" />
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="progress" label="进度" width="150">
          <template #default="{ row }">
            <el-progress :percentage="row.progress" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="startLearning(row)">
              {{ row.status === 'not_started' ? '开始学习' : '继续学习' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

export default {
  name: 'Dashboard',

  setup() {
    const router = useRouter();
    const tasks = ref([]);
    const stats = ref({ total: 0, completed: 0, inProgress: 0, notStarted: 0 });

    const completionRate = computed(() => {
      return stats.value.total > 0
        ? Math.round((stats.value.completed / stats.value.total) * 100)
        : 0;
    });

    const fetchTasks = async () => {
      try {
        const response = await axios.get('/api/learning/my-tasks');
        tasks.value = response.data.records;
        stats.value = response.data.stats;
      } catch (error) {
        console.error('Failed to fetch tasks:', error);
      }
    };

    const getStatusType = (status) => {
      const map = {
        not_started: 'info',
        in_progress: 'warning',
        completed: 'success',
        overdue: 'danger'
      };
      return map[status] || 'info';
    };

    const getStatusText = (status) => {
      const map = {
        not_started: '未开始',
        in_progress: '学习中',
        completed: '已完成',
        overdue: '已逾期'
      };
      return map[status] || status;
    };

    const startLearning = (row) => {
      router.push(`/learn/${row.assignmentId}`);
    };

    onMounted(fetchTasks);

    return {
      tasks,
      stats,
      completionRate,
      getStatusType,
      getStatusText,
      startLearning
    };
  }
};
</script>

<style scoped>
.dashboard h2 {
  margin: 0;
  color: #303133;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 10px;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 28px;
}

.stat-icon.blue { background: #409EFF; }
.stat-icon.orange { background: #E6A23C; }
.stat-icon.green { background: #67C23A; }
.stat-icon.purple { background: #909399; }

.stat-info {
  margin-left: 15px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 5px;
}
</style>
