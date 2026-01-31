<template>
  <div class="documents-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>文件管理</span>
          <el-button type="primary" @click="showUploadDialog = true">
            <el-icon><Plus /></el-icon>上传文件
          </el-button>
        </div>
      </template>

      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="搜索">
          <el-input v-model="searchForm.keyword" placeholder="输入文件名" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="documents" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="title" label="文件名" />
        <el-table-column prop="fileType" label="类型" width="80">
          <template #default="{ row }">
            <el-tag :type="getFileTypeTag(row.fileType)">{{ row.fileType }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="fileSize" label="大小" width="100">
          <template #default="{ row }">
            {{ formatFileSize(row.fileSize) }}
          </template>
        </el-table-column>
        <el-table-column prop="uploader" label="上传者" width="120">
          <template #default="{ row }">
            {{ row.uploader?.name }}
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="上传时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button link type="primary" @click="viewDocument(row)">查看</el-button>
            <el-button link type="danger" @click="deleteDocument(row)">删除</el-button>
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

    <!-- Upload Dialog -->
    <el-dialog v-model="showUploadDialog" title="上传文件" width="500px">
      <el-form :model="uploadForm" label-width="80px">
        <el-form-item label="标题">
          <el-input v-model="uploadForm.title" placeholder="输入文件标题" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="uploadForm.description" type="textarea" rows="3" />
        </el-form-item>
        <el-form-item label="文件">
          <el-upload
            ref="uploadRef"
            action=""
            :auto-upload="false"
            :on-change="handleFileChange"
            :limit="1"
          >
            <el-button type="primary">选择文件</el-button>
            <template #tip>
              <div class="el-upload__tip">
                支持 PDF、Word、视频文件
              </div>
            </template>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showUploadDialog = false">取消</el-button>
        <el-button type="primary" @click="submitUpload" :loading="uploading">上传</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue';
import axios from 'axios';
import { ElMessage, ElMessageBox } from 'element-plus';

export default {
  name: 'AdminDocuments',

  setup() {
    const documents = ref([]);
    const loading = ref(false);
    const showUploadDialog = ref(false);
    const uploading = ref(false);
    const uploadRef = ref(null);
    const selectedFile = ref(null);

    const searchForm = reactive({
      keyword: ''
    });

    const pagination = reactive({
      page: 1,
      limit: 10,
      total: 0
    });

    const uploadForm = reactive({
      title: '',
      description: ''
    });

    const fetchDocuments = async () => {
      loading.value = true;
      try {
        const response = await axios.get('/api/documents', {
          params: {
            page: pagination.page,
            limit: pagination.limit,
            search: searchForm.keyword
          }
        });
        documents.value = response.data.documents;
        pagination.total = response.data.pagination.total;
      } catch (error) {
        ElMessage.error('获取文件列表失败');
      } finally {
        loading.value = false;
      }
    };

    const handleSearch = () => {
      pagination.page = 1;
      fetchDocuments();
    };

    const resetSearch = () => {
      searchForm.keyword = '';
      handleSearch();
    };

    const handlePageChange = (page) => {
      pagination.page = page;
      fetchDocuments();
    };

    const handleSizeChange = (size) => {
      pagination.limit = size;
      pagination.page = 1;
      fetchDocuments();
    };

    const handleFileChange = (file) => {
      selectedFile.value = file.raw;
      if (!uploadForm.title) {
        uploadForm.title = file.name.replace(/\.[^/.]+$/, '');
      }
    };

    const submitUpload = async () => {
      if (!uploadForm.title) {
        ElMessage.warning('请输入文件标题');
        return;
      }
      if (!selectedFile.value) {
        ElMessage.warning('请选择文件');
        return;
      }

      uploading.value = true;
      const formData = new FormData();
      formData.append('file', selectedFile.value);
      formData.append('title', uploadForm.title);
      formData.append('description', uploadForm.description);

      try {
        await axios.post('/api/documents', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        ElMessage.success('上传成功');
        showUploadDialog.value = false;
        resetUploadForm();
        fetchDocuments();
      } catch (error) {
        ElMessage.error(error.response?.data?.error || '上传失败');
      } finally {
        uploading.value = false;
      }
    };

    const resetUploadForm = () => {
      uploadForm.title = '';
      uploadForm.description = '';
      selectedFile.value = null;
      if (uploadRef.value) {
        uploadRef.value.clearFiles();
      }
    };

    const deleteDocument = async (row) => {
      try {
        await ElMessageBox.confirm('确定要删除这个文件吗？', '提示', {
          type: 'warning'
        });
        await axios.delete(`/api/documents/${row.id}`);
        ElMessage.success('删除成功');
        fetchDocuments();
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('删除失败');
        }
      }
    };

    const viewDocument = (row) => {
      window.open(`/api/documents/${row.id}/view`, '_blank');
    };

    const getFileTypeTag = (type) => {
      const map = { pdf: 'danger', word: 'primary', video: 'success' };
      return map[type] || 'info';
    };

    const formatFileSize = (size) => {
      if (size < 1024) return size + ' B';
      if (size < 1024 * 1024) return (size / 1024).toFixed(2) + ' KB';
      return (size / (1024 * 1024)).toFixed(2) + ' MB';
    };

    const formatDate = (date) => {
      return new Date(date).toLocaleString('zh-CN');
    };

    onMounted(fetchDocuments);

    return {
      documents,
      loading,
      showUploadDialog,
      uploading,
      uploadRef,
      searchForm,
      pagination,
      uploadForm,
      handleSearch,
      resetSearch,
      handlePageChange,
      handleSizeChange,
      handleFileChange,
      submitUpload,
      deleteDocument,
      viewDocument,
      getFileTypeTag,
      formatFileSize,
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
.search-form {
  margin-bottom: 20px;
}
</style>
