<template>
  <div class="admin-dashboard">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-icon blue">
            <el-icon><User /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.totalUsers }}</div>
            <div class="stat-label">总用户数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-icon green">
            <el-icon><Document /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.totalDocuments }}</div>
            <div class="stat-label">文件总数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-icon orange">
            <el-icon><List /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.totalAssignments }}</div>
            <div class="stat-label">任务总数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-icon purple">
            <el-icon><CircleCheck /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.completionRate }}%</div>
            <div class="stat-label">完成率</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>最近上传的文件</span>
            <el-button link @click="$router.push('/admin/documents')">查看更多</el-button>
          </template>
          <el-table :data="recentDocuments" stripe>
            <el-table-column prop="title" label="文件名" />
            <el-table-column prop="fileType" label="类型" width="80" />
            <el-table-column prop="createdAt" label="上传时间" width="180">
              <template #default="{ row }">
                {{ formatDate(row.createdAt) }}
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>最近的学习记录</span>
          </template>
          <el-table :data="recentLearning" stripe>
            <el-table-column prop="userName" label="用户" />
            <el-table-column prop="documentTitle" label="文件" />
            <el-table-column prop="progress" label="进度" width="80">
              <template #default="{ row }">
                {{ row.progress }}%
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import axios from 'axios';

export default {
  name: 'AdminDashboard',

  setup() {
    const stats = ref({
      totalUsers: 0,
      totalDocuments: 0,
      totalAssignments: 0,
      completionRate: 0
    });
    const recentDocuments = ref([]);
    const recentLearning = ref([]);

    const fetchStats = async () => {
      try {
        const response = await axios.get('/api/admin/stats');
        stats.value = response.data.stats;
        recentDocuments.value = response.data.recentDocuments;
        recentLearning.value = response.data.recentLearning;
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };

    const formatDate = (date) => {
      return new Date(date).toLocaleString('zh-CN');
    };

    onMounted(fetchStats);

    return {
      stats,
      recentDocuments,
      recentLearning,
      formatDate
    };
  }
};
</script>

<style scoped>
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
.stat-icon.green { background: #67C23A; }
.stat-icon.orange { background: #E6A23C; }
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
