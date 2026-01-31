<template>
  <div class="learning-page">
    <el-page-header @back="goBack" :content="document?.title" />

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="18">
        <el-card class="viewer-card">
          <div v-if="document?.fileType === 'pdf'" class="pdf-viewer">
            <iframe
              :src="fileUrl"
              width="100%"
              height="800px"
              @load="onViewerLoad"
            />
          </div>
          <div v-else-if="document?.fileType === 'word'" class="word-viewer">
            <div v-html="wordContent" class="word-content" />
          </div>
          <div v-else-if="document?.fileType === 'video'" class="video-viewer">
            <video
              ref="videoPlayer"
              :src="fileUrl"
              controls
              @timeupdate="onVideoProgress"
              @ended="onVideoComplete"
              style="width: 100%; max-height: 600px;"
            />
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card>
          <template #header>
            <span>学习进度</span>
          </template>
          <el-progress
            type="circle"
            :percentage="progress"
            :status="progress === 100 ? 'success' : ''"
          />
          <div style="margin-top: 20px;">
            <p>状态: {{ getStatusText() }}</p>
            <p>学习时长: {{ formatTime(totalTime) }}</p>
          </div>
          <el-button
            v-if="progress === 100"
            type="primary"
            style="width: 100%; margin-top: 20px;"
            @click="goToQuiz"
          >
            进入测验
          </el-button>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';

export default {
  name: 'Learning',

  setup() {
    const route = useRoute();
    const router = useRouter();
    const assignmentId = route.params.id;

    const document = ref(null);
    const fileUrl = ref('');
    const wordContent = ref('');
    const progress = ref(0);
    const status = ref('not_started');
    const totalTime = ref(0);
    const videoPlayer = ref(null);

    let progressInterval = null;
    let startTime = Date.now();

    const fetchProgress = async () => {
      try {
        const response = await axios.get(`/api/learning/progress/${assignmentId}`);
        const record = response.data.record;
        document.value = record.Assignment.Document;
        progress.value = record.progress;
        status.value = record.status;
        totalTime.value = record.totalTime;

        if (document.value.fileType === 'pdf' || document.value.fileType === 'video') {
          fileUrl.value = `/api/documents/${document.value.id}/view`;
        } else if (document.value.fileType === 'word') {
          await fetchWordContent();
        }
      } catch (error) {
        console.error('Failed to fetch progress:', error);
      }
    };

    const fetchWordContent = async () => {
      try {
        const response = await axios.get(`/api/documents/${document.value.id}/content`);
        wordContent.value = response.data.content;
      } catch (error) {
        console.error('Failed to fetch word content:', error);
      }
    };

    const updateProgress = async (newProgress) => {
      try {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        await axios.post(`/api/learning/progress/${assignmentId}`, {
          progress: newProgress,
          totalTime: totalTime.value + elapsed
        });
        progress.value = newProgress;
      } catch (error) {
        console.error('Failed to update progress:', error);
      }
    };

    const onViewerLoad = () => {
      progressInterval = setInterval(() => {
        const newProgress = Math.min(progress.value + 5, 100);
        if (newProgress > progress.value) {
          updateProgress(newProgress);
        }
      }, 30000);
    };

    const onVideoProgress = () => {
      if (videoPlayer.value) {
        const percent = Math.round(
          (videoPlayer.value.currentTime / videoPlayer.value.duration) * 100
        );
        if (percent > progress.value) {
          updateProgress(percent);
        }
      }
    };

    const onVideoComplete = () => {
      updateProgress(100);
    };

    const getStatusText = () => {
      const map = {
        not_started: '未开始',
        in_progress: '学习中',
        completed: '已完成'
      };
      return map[status.value] || status.value;
    };

    const formatTime = (seconds) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}分${secs}秒`;
    };

    const goBack = () => {
      router.push('/dashboard');
    };

    const goToQuiz = () => {
      router.push(`/quiz/${assignmentId}`);
    };

    onMounted(() => {
      fetchProgress();
    });

    onUnmounted(() => {
      if (progressInterval) {
        clearInterval(progressInterval);
      }
    });

    return {
      document,
      fileUrl,
      wordContent,
      progress,
      status,
      totalTime,
      videoPlayer,
      onViewerLoad,
      onVideoProgress,
      onVideoComplete,
      getStatusText,
      formatTime,
      goBack,
      goToQuiz
    };
  }
};
</script>

<style scoped>
.learning-page {
  padding: 20px;
}
.viewer-card {
  min-height: 800px;
}
.word-content {
  padding: 20px;
  line-height: 1.8;
}
</style>
