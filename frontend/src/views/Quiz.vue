<template>
  <div class="quiz-page">
    <el-page-header @back="goBack" content="学习测验" />

    <el-card v-if="!submitted" style="margin-top: 20px;">
      <template #header>
        <span>测验题目 (共 {{ quizzes.length }} 题)</span>
      </template>

      <div v-for="(quiz, index) in quizzes" :key="quiz.id" class="quiz-item">
        <p class="question">{{ index + 1 }}. {{ quiz.question }}</p>
        <el-radio-group v-model="answers[quiz.id]">
          <el-radio
            v-for="(option, optIndex) in quiz.options"
            :key="optIndex"
            :label="optIndex"
          >
            {{ String.fromCharCode(65 + optIndex) }}. {{ option }}
          </el-radio>
        </el-radio-group>
      </div>

      <div style="margin-top: 30px; text-align: center;">
        <el-button type="primary" size="large" @click="submitAnswers" :loading="submitting">
          提交答案
        </el-button>
      </div>
    </el-card>

    <el-card v-else style="margin-top: 20px; text-align: center;">
      <el-result
        :icon="score >= 60 ? 'success' : 'warning'"
        :title="`得分: ${score}分`"
        :sub-title="score >= 60 ? '恭喜通过测验！' : '需要继续努力哦'"
      >
        <template #extra>
          <el-button type="primary" @click="goBack">返回</el-button>
        </template>
      </el-result>
    </el-card>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import { ElMessage } from 'element-plus';

export default {
  name: 'Quiz',

  setup() {
    const route = useRoute();
    const router = useRouter();
    const assignmentId = route.params.assignmentId;

    const quizzes = ref([]);
    const answers = reactive({});
    const submitted = ref(false);
    const submitting = ref(false);
    const score = ref(0);

    const fetchQuizzes = async () => {
      try {
        const response = await axios.get(`/api/quizzes/assignment/${assignmentId}`);
        quizzes.value = response.data.quizzes.filter(q => !q.answered);
        if (response.data.hasSubmitted) {
          submitted.value = true;
        }
      } catch (error) {
        ElMessage.error('获取测验失败');
      }
    };

    const submitAnswers = async () => {
      const unanswered = quizzes.value.filter(q => answers[q.id] === undefined);
      if (unanswered.length > 0) {
        ElMessage.warning(`还有 ${unanswered.length} 道题未作答`);
        return;
      }

      submitting.value = true;
      try {
        const response = await axios.post('/api/quizzes/submit', {
          assignmentId,
          answers: quizzes.value.map(q => ({
            quizId: q.id,
            answer: answers[q.id]
          }))
        });
        score.value = response.data.score;
        submitted.value = true;
      } catch (error) {
        ElMessage.error('提交失败');
      } finally {
        submitting.value = false;
      }
    };

    const goBack = () => {
      router.push('/dashboard');
    };

    onMounted(fetchQuizzes);

    return {
      quizzes,
      answers,
      submitted,
      submitting,
      score,
      submitAnswers,
      goBack
    };
  }
};
</script>

<style scoped>
.quiz-page {
  padding: 20px;
}
.quiz-item {
  padding: 20px 0;
  border-bottom: 1px solid #ebeef5;
}
.question {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 15px;
}
</style>
