<template>
  <div class="assignments-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>任务管理</span>
          <el-button type="primary" @click="showAddDialog = true">
            <el-icon><Plus /></el-icon>创建任务
          </el-button>
        </div>
      </template>

      <el-table :data="assignments" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="Document.title" label="学习文件" />
        <el-table-column prop="requiredTime" label="要求时长" width="100">
          <template #default="{ row }">
            {{ row.requiredTime ? row.requiredTime + ' 分钟' : '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="deadline" label="截止时间" width="180">
          <template #default="{ row }">
            {{ row.deadline ? formatDate(row.deadline) : '无' }}
          </template>
        </el-table-column>
        <el-table-column prop="hasQuiz" label="包含测验" width="100">
          <template #default="{ row }">
            <el-tag :type="row.hasQuiz ? 'success' : 'info'">
              {{ row.hasQuiz ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="指派对象" min-width="200">
          <template #default="{ row }">
            <el-tag v-for="target in row.AssignmentTargets" :key="target.id" size="small" class="target-tag">
              {{ target.targetType === 'user' ? '用户' : '部门' }}:{{ target.targetId }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button link type="danger" @click="cancelAssignment(row)">取消</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.limit"
        :total="pagination.total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
        style="margin-top: 20px; justify-content: flex-end;"
      />
    </el-card>

    <!-- Create Dialog -->
    <el-dialog v-model="showAddDialog" title="创建学习任务" width="600px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="选择文件">
          <el-select v-model="form.documentId" filterable style="width: 100%">
            <el-option
              v-for="doc in documents"
              :key="doc.id"
              :label="doc.title"
              :value="doc.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="指派给">
          <el-select v-model="form.targets" multiple style="width: 100%">
            <el-option-group label="部门">
              <el-option
                v-for="dept in departments"
                :key="'dept-' + dept.id"
                :label="dept.name"
                :value="{ id: dept.id, type: 'department' }"
              />
            </el-option-group>
            <el-option-group label="用户">
              <el-option
                v-for="user in users"
                :key="'user-' + user.id"
                :label="user.name"
                :value="{ id: user.id, type: 'user' }"
              />
            </el-option-group>
          </el-select>
        </el-form-item>
        <el-form-item label="要求时长">
          <el-input-number v-model="form.requiredTime" :min="0" style="width: 200px">
            <template #append>分钟</template>
          </el-input-number>
        </el-form-item>
        <el-form-item label="截止时间">
          <el-date-picker v-model="form.deadline" type="datetime" placeholder="选择截止时间" />
        </el-form-item>
        <el-form-item label="包含测验">
          <el-switch v-model="form.hasQuiz" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="submitForm" :loading="submitting">创建</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue';
import axios from 'axios';
import { ElMessage, ElMessageBox } from 'element-plus';

export default {
  name: 'AdminAssignments',

  setup() {
    const assignments = ref([]);
    const documents = ref([]);
    const departments = ref([]);
    const users = ref([]);
    const loading = ref(false);
    const showAddDialog = ref(false);
    const submitting = ref(false);

    const pagination = reactive({ page: 1, limit: 10, total: 0 });
    const form = reactive({
      documentId: null,
      targets: [],
      requiredTime: 30,
      deadline: null,
      hasQuiz: false
    });

    const fetchAssignments = async () => {
      loading.value = true;
      try {
        const response = await axios.get('/api/assignments', {
          params: { page: pagination.page, limit: pagination.limit }
        });
        assignments.value = response.data.assignments;
        pagination.total = response.data.pagination.total;
      } catch (error) {
        ElMessage.error('获取任务列表失败');
      } finally {
        loading.value = false;
      }
    };

    const fetchDocuments = async () => {
      const response = await axios.get('/api/documents', { params: { limit: 1000 } });
      documents.value = response.data.documents;
    };

    const fetchDepartments = async () => {
      const response = await axios.get('/api/departments');
      departments.value = response.data.departments;
    };

    const fetchUsers = async () => {
      const response = await axios.get('/api/users', { params: { limit: 1000 } });
      users.value = response.data.users;
    };

    const submitForm = async () => {
      if (!form.documentId) {
        ElMessage.warning('请选择文件');
        return;
      }
      if (form.targets.length === 0) {
        ElMessage.warning('请选择指派对象');
        return;
      }

      submitting.value = true;
      try {
        await axios.post('/api/assignments', form);
        ElMessage.success('任务创建成功');
        showAddDialog.value = false;
        resetForm();
        fetchAssignments();
      } catch (error) {
        ElMessage.error(error.response?.data?.error || '创建失败');
      } finally {
        submitting.value = false;
      }
    };

    const cancelAssignment = async (row) => {
      try {
        await ElMessageBox.confirm('确定要取消这个任务吗？', '提示', { type: 'warning' });
        await axios.delete(`/api/assignments/${row.id}`);
        ElMessage.success('已取消');
        fetchAssignments();
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('操作失败');
        }
      }
    };

    const handlePageChange = (page) => {
      pagination.page = page;
      fetchAssignments();
    };

    const handleSizeChange = (size) => {
      pagination.limit = size;
      pagination.page = 1;
      fetchAssignments();
    };

    const resetForm = () => {
      form.documentId = null;
      form.targets = [];
      form.requiredTime = 30;
      form.deadline = null;
      form.hasQuiz = false;
    };

    const formatDate = (date) => {
      return new Date(date).toLocaleString('zh-CN');
    };

    onMounted(() => {
      fetchAssignments();
      fetchDocuments();
      fetchDepartments();
      fetchUsers();
    });

    return {
      assignments,
      documents,
      departments,
      users,
      loading,
      showAddDialog,
      submitting,
      pagination,
      form,
      submitForm,
      cancelAssignment,
      handlePageChange,
      handleSizeChange,
      formatDate
    };
  }
};
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.target-tag {
  margin-right: 5px;
  margin-bottom: 5px;
}
</style>
