<template>
  <div
    class="shopcar"
    :class="{ open: visible }"
    v-show="visible"
    ref="panelRef"
  >
    <div class="shopcar-title">
      <span class="close-btn" @click="$emit('update:visible', false)">
        <i class="close-btn-icon iconfont icon-guanbianniu"></i>
      </span>
    </div>
    
    <el-upload
      class="upload-demo"
      drag
      action="#"
      multiple
      :http-request="handleUploadRequest"
      v-model:file-list="fileList"
      :on-success="handleUploadSuccess"
      :on-error="handleUploadError"
    >
      <i class="iconfont icon-shangchuan" style="font-size: 48px; color: #c0c4cc;"></i>
      <div class="el-upload__text">
        Drop file here or <em>click to upload</em>
      </div>
      <template #file="{ file }">
        <div class="file-item-row" :style="getFileBackgroundStyle(file)" @click="handlePreview(file)">
          <span class="file-name">{{ file.name }}</span>
          <div class="file-actions">
            <el-button 
              v-if="file.status === 'success'" 
              type="success" 
              size="small" 
              circle 
              @click.stop="handleCopyFile(file)"
            >
              <i class="iconfont icon-fuzhi1"></i>
            </el-button>
            <el-button 
              type="danger" 
              size="small" 
              circle 
              @click.stop="handleDeleteFile(file)"
            >
              <i class="iconfont icon-shanchu"></i>
            </el-button>
          </div>
        </div>
      </template>
    </el-upload>
    
    <el-dialog v-model="previewVisible" append-to-body>
      <img :src="previewUrl" style="width: 100%" />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { uploadImageFile } from '@/request/http';
import { getToken, getHost } from '@/utils';
import useClipboard from 'vue-clipboard3';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:visible', 'upload-success']);

const { toClipboard } = useClipboard();
const panelRef = ref(null);
const fileList = ref([]);
const previewVisible = ref(false);
const previewUrl = ref('');
const uploading = ref(false);

const success = (msg) => ElMessage.success(msg);
const error = (msg) => ElMessage.error(msg);
const warn = (msg) => ElMessage.warning(msg);

const handleUploadRequest = (options) => {
  const { file, onSuccess, onError } = options;
  uploading.value = true;
  const fd = new FormData();
  fd.append('avatar', file);
  fd.append('token', getToken());
  
  uploadImageFile(fd)
    .then((res) => {
      if (res && (res.fileName || res.url)) {
        let url = res.fileName || res.url;
        if (!url && res.fileName) {
          const t = getHost();
          url = `${t}/uploads/${res.fileName}`;
        }
        onSuccess({ url: url });
        emit('upload-success', { file, url });
      } else {
        onError(new Error('Unknown response format'));
      }
      uploading.value = false;
    })
    .catch((err) => {
      onError(err);
      uploading.value = false;
    });
};

const getFileBackgroundStyle = (file) => {
  const url = file.url || (file.response && file.response.url);
  if (url && /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i.test(file.name)) {
    return {
      backgroundImage: `url(${url})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      color: '#fff',
      textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
      padding: '10px',
      borderRadius: '4px',
      cursor: 'pointer',
    };
  }
  return {};
};

const handlePreview = (file) => {
  const url = file.url || (file.response && file.response.url);
  if (url && /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i.test(file.name)) {
    previewUrl.value = url;
    previewVisible.value = true;
  }
};

const handleUploadSuccess = (response, file) => {
  if (response && response.url) {
    file.url = response.url;
    success('上传成功');
  }
};

const handleUploadError = (err) => {
  error('上传失败: ' + (err.message || '未知错误'));
};

const handleCopyFile = async (file) => {
  if (!file.url && !file.response?.url) {
    warn('文件链接无效');
    return;
  }
  const url = file.url || file.response?.url;
  const isImg = /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i.test(file.name);
  const name = file.name || 'file';
  const text = isImg
    ? `![${name}](${url})`
    : `[${name}](${url})`;
  
  try {
    await toClipboard(text);
    success(`复制 ${text} 成功`);
  } catch {
    error(`复制失败`);
  }
};

const handleDeleteFile = (file) => {
  const index = fileList.value.indexOf(file);
  if (index !== -1) {
    fileList.value.splice(index, 1);
  }
};

// Clear file list when panel closes
watch(() => props.visible, (newVal) => {
  if (!newVal) {
    // Optional: clear files when closing
  }
});
</script>

<style scoped>
.shopcar {
  position: fixed;
  right: 0;
  top: 0;
  bottom: 0;
  width: 300px;
  background-color: white;
  box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
  z-index: 2001;
  padding: 20px;
  display: flex;
  flex-direction: column;
  transform: translateX(100%);
  transition: transform 0.3s ease-in-out;
}

.shopcar.open {
  transform: translateX(0);
}

.shopcar-title {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
}

.close-btn {
  cursor: pointer;
  font-size: 20px;
}

.file-item-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 5px 0;
}

.file-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 180px;
}

.file-actions {
  display: flex;
  gap: 5px;
}
</style>
