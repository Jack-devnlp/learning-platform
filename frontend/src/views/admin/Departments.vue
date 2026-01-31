<template>
  <div class="departments-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>部门管理</span>
          <el-button type="primary" @click="showAddDialog = true">
            <el-icon><Plus /></el-icon>添加部门
          </el-button>
        </div>
      </template>

      <el-table :data="departments" v-loading="loading" row-key="id" default-expand-all>
        <el-table-column prop="name" label="部门名称" />
        <el-table-column prop="parentId" label="上级部门" width="200">
          <template #default="{ row }">
            {{ getParentName(row.parentId) || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button link type="primary" @click="editDepartment(row)">编辑</el-button>
            <el-button link type="danger" @click="deleteDepartment(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- Add/Edit Dialog -->
    <el-dialog v-model="showAddDialog" :title="isEdit ? '编辑部门' : '添加部门'" width="400px">
      <el-form :model="deptForm" label-width="80px">
        <el-form-item label="部门名称">
          <el-input v-model="deptForm.name" />
        </el-form-item>
        <el-form-item label="上级部门">
          <el-select v-model="deptForm.parentId" clearable style="width: 100%">
            <el-option label="无" :value="null" />
            <el-option
              v-for="dept in availableParents"
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
import { ref, reactive, computed, onMounted } from 'vue';
import axios from 'axios';
import { ElMessage, ElMessageBox } from 'element-plus';

export default {
  name: 'AdminDepartments',

  setup() {
    const departments = ref([]);
    const loading = ref(false);
    const showAddDialog = ref(false);
    const submitting = ref(false);
    const isEdit = ref(false);

    const deptForm = reactive({
      id: null,
      name: '',
      parentId: null
    });

    const fetchDepartments = async () => {
      loading.value = true;
      try {
        const response = await axios.get('/api/departments');
        departments.value = buildTree(response.data.departments);
      } catch (error) {
        ElMessage.error('获取部门列表失败');
      } finally {
        loading.value = false;
      }
    };

    const buildTree = (list) => {
      const map = {};
      const tree = [];
      list.forEach(item => map[item.id] = { ...item, children: [] });
      list.forEach(item => {
        if (item.parentId && map[item.parentId]) {
          map[item.parentId].children.push(map[item.id]);
        } else {
          tree.push(map[item.id]);
        }
      });
      return tree;
    };

    const getParentName = (parentId) => {
      if (!parentId) return null;
      const findInTree = (list) => {
        for (const item of list) {
          if (item.id === parentId) return item.name;
          if (item.children) {
            const found = findInTree(item.children);
            if (found) return found;
          }
        }
        return null;
      };
      return findInTree(departments.value);
    };

    const availableParents = computed(() => {
      const flatten = (list, result = []) => {
        list.forEach(item => {
          if (item.id !== deptForm.id) {
            result.push(item);
            if (item.children) flatten(item.children, result);
          }
        });
        return result;
      };
      return flatten(departments.value);
    });

    const editDepartment = (row) => {
      isEdit.value = true;
      deptForm.id = row.id;
      deptForm.name = row.name;
      deptForm.parentId = row.parentId;
      showAddDialog.value = true;
    };

    const submitForm = async () => {
      if (!deptForm.name) {
        ElMessage.warning('请输入部门名称');
        return;
      }
      submitting.value = true;
      try {
        if (isEdit.value) {
          await axios.put(`/api/departments/${deptForm.id}`, deptForm);
          ElMessage.success('更新成功');
        } else {
          await axios.post('/api/departments', deptForm);
          ElMessage.success('添加成功');
        }
        showAddDialog.value = false;
        resetForm();
        fetchDepartments();
      } catch (error) {
        ElMessage.error(error.response?.data?.error || '操作失败');
      } finally {
        submitting.value = false;
      }
    };

    const deleteDepartment = async (row) => {
      try {
        await ElMessageBox.confirm('确定要删除该部门吗？', '提示', { type: 'warning' });
        await axios.delete(`/api/departments/${row.id}`);
        ElMessage.success('删除成功');
        fetchDepartments();
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('删除失败');
        }
      }
    };

    const resetForm = () => {
      deptForm.id = null;
      deptForm.name = '';
      deptForm.parentId = null;
      isEdit.value = false;
    };

    onMounted(fetchDepartments);

    return {
      departments,
      loading,
      showAddDialog,
      submitting,
      isEdit,
      deptForm,
      availableParents,
      getParentName,
      editDepartment,
      submitForm,
      deleteDepartment
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
</style>
