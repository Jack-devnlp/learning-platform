<template>
  <div class="quiz-editor">
    <el-page-header @back="goBack" content="测验管理" />

    <el-card style="margin-top: 20px;">
      <template #header>
        <div class="card-header">
          <span>测验题目</span>
          <el-button type="primary" @click="showAddDialog = true">添加题目</el-button>
        </div>
      </template>

      <el-empty v-if="quizzes.length === 0" description="暂无测验题目" />

      <div v-for="(quiz, index) in quizzes" :key="quiz.id" class="quiz-item">
        <div class="quiz-header">
          <span class="quiz-number">题目 {{ index + 1 }}</span>
          <el-button link type="danger" @click="deleteQuiz(quiz)">删除</el-button>
        </div>
        <p class="quiz-question">{{ quiz.question }}</p>
        <el-radio-group v-model="selectedAnswers[quiz.id]" disabled>
          <el-radio
            v-for="(option, optIndex) in quiz.options"
            :key="optIndex"
            :label="optIndex"
            :class="{ 'correct-answer': optIndex === quiz.correctAnswer }"
          >
            {{ String.fromCharCode(65 + optIndex) }}. {{ option }}
          </el-radio>
        </el-radio-group>
      </div>
    </el-card>

    <!-- Add Dialog -->
    <el-dialog v-model="showAddDialog" title="添加题目" width="600px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="题目">
          <el-input v-model="form.question" type="textarea" rows="3" />
        </el-form-item>
        <el-form-item label="选项">
          <div v-for="(option, index) in form.options" :key="index" class="option-row">
            <el-radio v-model="form.correctAnswer" :label="index">
              {{ String.fromCharCode(65 + index) }}.
            </el-radio>
            <el-input v-model="form.options[index]" style="flex: 1;" />
            <el-button link type="danger" @click="removeOption(index)" v-if="form.options.length > 2">删除</el-button>
          </div>
          <el-button link type="primary" @click="addOption">添加选项</el-button>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="submitQuiz" :loading="submitting">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import { ElMessage, ElMessageBox } from 'element-plus';

export default {
  name: 'QuizEditor',

  setup() {
    const route = useRoute();
    const router = useRouter();
    const assignmentId = route.params.assignmentId;

    const quizzes = ref([]);
    const showAddDialog = ref(false);
    const submitting = ref(false);
    const selectedAnswers = ref({});

    const form = reactive({
      assignmentId,
      question: '',
      options: ['', ''],
      correctAnswer: 0
    });

    const fetchQuizzes = async () => {
      try {
        const response = await axios.get(`/api/quizzes/assignment/${assignmentId}`);
        quizzes.value = response.data.quizzes;
      } catch (error) {
        ElMessage.error('获取测验失败');
      }
    };

    const addOption = () => {
      form.options.push('');
    };

    const removeOption = (index) => {
      form.options.splice(index, 1);
      if (form.correctAnswer >= form.options.length) {
        form.correctAnswer = form.options.length - 1;
      }
    };

    const submitQuiz = async () => {
      if (!form.question.trim()) {
        ElMessage.warning('请输入题目');
        return;
      }
      if (form.options.some(o => !o.trim())) {
        ElMessage.warning('请填写所有选项');
        return;
      }

      submitting.value = true;
      try {
        await axios.post('/api/quizzes', form);
        ElMessage.success('添加成功');
        showAddDialog.value = false;
        resetForm();
        fetchQuizzes();
      } catch (error) {
        ElMessage.error('添加失败');
      } finally {
        submitting.value = false;
      }
    };

    const deleteQuiz = async (quiz) => {
      try {
        await ElMessageBox.confirm('确定要删除这道题目吗？', '提示', { type: 'warning' });
        await axios.delete(`/api/quizzes/${quiz.id}`);
        ElMessage.success('删除成功');
        fetchQuizzes();
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('删除失败');
        }
      }
    };

    const resetForm = () => {
      form.question = '';
      form.options = ['', ''];
      form.correctAnswer = 0;
    };

    const goBack = () => {
      router.push('/admin/assignments');
    };

    onMounted(fetchQuizzes);

    return {
      quizzes,
      showAddDialog,
      submitting,
      selectedAnswers,
      form,
      addOption,
      removeOption,
      submitQuiz,
      deleteQuiz,
      goBack
    };
  }
};
</script>

<style scoped>
.quiz-editor {
  padding: 20px;
}
.quiz-item {
  padding: 20px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  margin-bottom: 15px;
}
.quiz-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
.quiz-number {
  font-weight: bold;
  color: #409EFF;
}
.quiz-question {
  margin: 0 0 15px 0;
  font-size: 14px;
}
.option-row {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  gap: 10px;
}
.correct-answer {
  color: #67C23A;
  font-weight: bold;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
