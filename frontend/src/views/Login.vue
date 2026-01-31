<template>
  <div class="login-container">
    <el-card class="login-card">
      <template #header>
        <h2>企业内部学习平台</h2>
      </template>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        @submit.prevent="handleSubmit"
      >
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="form.username"
            placeholder="请输入用户名"
            prefix-icon="User"
          />
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            prefix-icon="Lock"
            show-password
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            native-type="submit"
            :loading="loading"
            style="width: 100%"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>

      <div class="demo-accounts">
        <p>测试账号：</p>
        <p>管理员：admin / admin123</p>
        <p>普通用户：zhangsan / user123</p>
      </div>
    </el-card>
  </div>
</template>

<script>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/modules/auth';
import { ElMessage } from 'element-plus';

export default {
  name: 'Login',

  setup() {
    const router = useRouter();
    const authStore = useAuthStore();
    const formRef = ref(null);
    const loading = ref(false);

    const form = reactive({
      username: '',
      password: ''
    });

    const rules = {
      username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
      password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
    };

    const handleSubmit = async () => {
      const valid = await formRef.value.validate().catch(() => false);
      if (!valid) return;

      loading.value = true;
      const result = await authStore.login(form);
      loading.value = false;

      if (result.success) {
        ElMessage.success('登录成功');
        router.push(authStore.isAdmin ? '/admin/dashboard' : '/dashboard');
      } else {
        ElMessage.error(result.error);
      }
    };

    return {
      formRef,
      form,
      rules,
      loading,
      handleSubmit
    };
  }
};
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
  width: 400px;
}

.login-card h2 {
  text-align: center;
  margin: 0;
}

.demo-accounts {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
  font-size: 12px;
  color: #666;
}

.demo-accounts p {
  margin: 5px 0;
}
</style>
