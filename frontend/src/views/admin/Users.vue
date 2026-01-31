<template>
  <div class="users-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>用户管理</span>
          <el-button type="primary" @click="showAddDialog = true">
            <el-icon><Plus /></el-icon>添加用户
          </el-button>
        </div>
      </template>

      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="搜索">
          <el-input v-model="searchForm.keyword" placeholder="用户名/姓名" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="users" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="name" label="姓名" />
        <el-table-column prop="role" label="角色" width="100">
          <template #default="{ row }">
            <el-tag :type="row.role === 'admin' ? 'danger' : 'info'">
              {{ row.role === 'admin' ? '管理员' : '用户' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="Department" label="部门" width="120">
          <template #default="{ row }">
            {{ row.Department?.name || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'danger'">
              {{ row.status === 'active' ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button link type="primary" @click="editUser(row)">编辑</el-button>
            <el-button link :type="row.status === 'active' ? 'danger' : 'success'" @click="toggleStatus(row)">
              {{ row.status === 'active' ? '禁用' : '启用' }}
            </el-button>
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

    <!-- Add/Edit Dialog -->
    <el-dialog v-model="showAddDialog" :title="isEdit ? '编辑用户' : '添加用户'" width="500px">
      <el-form :model="userForm" label-width="80px" :rules="formRules" ref="formRef">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="userForm.username" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="userForm.name" />
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="!isEdit">
          <el-input v-model="userForm.password" type="password" show-password />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="userForm.role" style="width: 100%">
            <el-option label="用户" value="user" />
            <el-option label="管理员" value="admin" />
          </el-select>
        </el-form-item>
        <el-form-item label="部门">
          <el-select v-model="userForm.departmentId" clearable style="width: 100%">
            <el-option
              v-for="dept in departments"
              :key="dept.id"
              :label="dept.name"
              :value="dept.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="submitForm" :loading="submitting">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue';
import axios from 'axios';
import { ElMessage, ElMessageBox } from 'element-plus';

export default {
  name: 'AdminUsers',

  setup() {
    const users = ref([]);
    const departments = ref([]);
    const loading = ref(false);
    const showAddDialog = ref(false);
    const submitting = ref(false);
    const isEdit = ref(false);
    const formRef = ref(null);

    const searchForm = reactive({ keyword: '' });
    const pagination = reactive({ page: 1, limit: 10, total: 0 });

    const userForm = reactive({
      id: null,
      username: '',
      name: '',
      password: '',
      role: 'user',
      departmentId: null
    });

    const formRules = {
      username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
      name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
      password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
      role: [{ required: true, message: '请选择角色', trigger: 'change' }]
    };

    const fetchUsers = async () => {
      loading.value = true;
      try {
        const response = await axios.get('/api/users', {
          params: {
            page: pagination.page,
            limit: pagination.limit,
            search: searchForm.keyword
          }
        });
        users.value = response.data.users;
        pagination.total = response.data.pagination.total;
      } catch (error) {
        ElMessage.error('获取用户列表失败');
      } finally {
        loading.value = false;
      }
    };

    const fetchDepartments = async () => {
      try {
        const response = await axios.get('/api/departments');
        departments.value = response.data.departments;
      } catch (error) {
        console.error('Failed to fetch departments:', error);
      }
    };

    const handleSearch = () => {
      pagination.page = 1;
      fetchUsers();
    };

    const resetSearch = () => {
      searchForm.keyword = '';
      handleSearch();
    };

    const handlePageChange = (page) => {
      pagination.page = page;
      fetchUsers();
    };

    const handleSizeChange = (size) => {
      pagination.limit = size;
      pagination.page = 1;
      fetchUsers();
    };

    const editUser = (row) => {
      isEdit.value = true;
      Object.assign(userForm, {
        id: row.id,
        username: row.username,
        name: row.name,
        role: row.role,
        departmentId: row.departmentId
      });
      showAddDialog.value = true;
    };

    const submitForm = async () => {
      const valid = await formRef.value.validate().catch(() => false);
      if (!valid) return;

      submitting.value = true;
      try {
        if (isEdit.value) {
          await axios.put(`/api/users/${userForm.id}`, userForm);
          ElMessage.success('更新成功');
        } else {
          await axios.post('/api/users', userForm);
          ElMessage.success('添加成功');
        }
        showAddDialog.value = false;
        resetForm();
        fetchUsers();
      } catch (error) {
        ElMessage.error(error.response?.data?.error || '操作失败');
      } finally {
        submitting.value = false;
      }
    };

    const toggleStatus = async (row) => {
      const action = row.status === 'active' ? '禁用' : '启用';
      try {
        await ElMessageBox.confirm(`确定要${action}该用户吗？`, '提示', { type: 'warning' });
        await axios.delete(`/api/users/${row.id}`);
        ElMessage.success(`${action}成功`);
        fetchUsers();
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('操作失败');
        }
      }
    };

    const resetForm = () => {
      userForm.id = null;
      userForm.username = '';
      userForm.name = '';
      userForm.password = '';
      userForm.role = 'user';
      userForm.departmentId = null;
      isEdit.value = false;
    };

    onMounted(() => {
      fetchUsers();
      fetchDepartments();
    });

    return {
      users,
      departments,
      loading,
      showAddDialog,
      submitting,
      isEdit,
      formRef,
      searchForm,
      pagination,
      userForm,
      formRules,
      handleSearch,
      resetSearch,
      handlePageChange,
      handleSizeChange,
      editUser,
      submitForm,
      toggleStatus
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
.search-form {
  margin-bottom: 20px;
}
</style>
