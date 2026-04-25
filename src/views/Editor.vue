<template>
  <div class="main">
    <Header :show="!hideHeader" />

    <MenuBar
      :project-name="projectName"
      :menus="menus"
      :is-building="isBuilding"
      v-model:hide-header="hideHeader"
      v-model:hide-links-panel="hideLinksPanel"
      @menu-click="menuClick"
      @add-menu="dialog = true"
      @menu-drop="menuDrop"
      @save-build="saveAndBuild"
    />

    <div class="content flex" ref="contentRef">
      <LeftNav
        ref="leftNavRef"
        :sliders="sliders"
        :current-link="currentLink"
        v-model:collapsed="isCollapsed"
        @doc-click="docItemClick"
        @edit-doc="editDocItem"
        @add-doc="toggleSliderDialog"
        @add-child-doc="groupAddDocItem"
        @copy="copyValue"
        @slider-drop="sliderDrop"
        @slider-item-drop="sliderItemDrop"
      />

      <EditorPanel
        ref="editorPanelRef"
        :editor-visible="editorShow"
        :hide-links-panel="hideLinksPanel"
        :slider-u-r-l-s="sliderURLS"
        :theme="hero.theme || 'serene-rose'"
        :upload-file="uploadFile"
        :save-doc="saveDoc"
        :import-md="importMd"
        :open-upload-panel="openUploadPanel"
        :get-left-nav="() => leftNavRef?.getElement()"
        :warn="warn"
        :info="info"
        @import="importMd"
        @open-upload="openUploadPanel"
        @save="saveDoc"
        @copy="copyValue"
        @editor-ready="onEditorReady"
        @content-change="isDirty = true"
      />
    </div>

    <el-dialog
      v-model="dialog"
      title="添加菜单"
      width="30%"
      class="responsive-dialog"
    >
      <el-form label-width="80px">
        <el-form-item label="菜单名称">
          <el-input
            v-model="menuName"
            @input="menuInput"
            placeholder="请输入菜单名称"
          ></el-input>
        </el-form-item>
        <el-form-item label="菜单链接">
          <el-input v-model="menuLink" placeholder="请输入菜单链接"></el-input>
        </el-form-item>
        <el-divider content-position="left">已经存在的菜单集合</el-divider>
        <el-table
          :data="menus"
          style="width: 100%"
          size="small"
          border
          :header-cell-style="{ background: 'var(--table-header-bg)', color: 'var(--table-header-text)' }"
        >
          <el-table-column prop="name" label="菜单名称" width="120" />
          <el-table-column prop="link" label="菜单链接地址" />
        </el-table>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialog = false">取 消</el-button>
          <el-button
            type="primary"
            @click="addMenu"
            :disabled="saveButtonDisabled"
            >确 定</el-button
          >
        </span>
      </template>
    </el-dialog>

    <el-dialog
      v-model="docDialog"
      title="添加文档"
      width="30%"
      class="responsive-dialog"
    >
      <el-form label-width="80px">
        <el-form-item label="文档名称">
          <el-input
            v-model="docTitle"
            @input="docNameInput"
            placeholder="请输入文档名称"
          ></el-input>
        </el-form-item>
        <el-form-item label="文档类型">
          <el-select
            v-model="docType"
            :disabled="docTypeDisable"
            placeholder="请选择"
            style="width: 100%"
          >
            <el-option
              v-for="item in docTypes"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="文档链接">
          <el-input v-model="docLink" placeholder="请输入文档链接"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="docDialog = false">取 消</el-button>
          <el-button type="primary" @click="addDocItem">确 定</el-button>
        </span>
      </template>
    </el-dialog>

    <el-dialog
      v-model="docEditDialog"
      title="修改文档"
      width="30%"
      class="responsive-dialog"
    >
      <el-form label-width="80px">
        <el-form-item label="文档名称">
          <el-input
            v-model="docEditTitle"
            placeholder="请输入文档名称"
          ></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="docEditDialog = false">取 消</el-button>
          <el-button type="primary" @click="saveEditDocItem">确 定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- Upload Panel -->
    <UploadPanel v-model:visible="showUploadPanel" @upload-success="onUploadSuccess" />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useRoute, useRouter, onBeforeRouteLeave } from "vue-router";
import { getToken, getHost } from "@/utils";
import {
  validateToken,
  queryProject,
  queryMenu,
  querySlider,
  sortMenu,
  saveMenu,
  saveSlider,
  queryDoc,
  saveDoc as apiSaveDoc,
  querySliderList,
  uploadImageFile,
  buildProject,
  getBuildStatus,
} from "@/request/http";
import { getEditor } from "@/utils/editor";

import { ElMessage, ElLoading, ElMessageBox } from "element-plus";
import { pinyin } from "pinyin-pro";
import useClipboard from "vue-clipboard3";
import Header from "@/components/Header.vue";
import { MenuBar, LeftNav, EditorPanel, UploadPanel } from "@/components/editor";

const route = useRoute();
const router = useRouter();
const { toClipboard } = useClipboard();

// Build task SSE streams
const activeBuildStreams = new Map();
const isBuilding = ref(false);

// Refs
const contentRef = ref(null);
const leftNavRef = ref(null);
const editorPanelRef = ref(null);

// State
const hideHeader = ref(true);
const hideLinksPanel = ref(true);
const dialog = ref(false);
const hero = ref({});
const projectId = ref("");
const projectName = ref("");
const menus = ref([]);
const currentMenu = ref(null);
const currentLink = ref("");
const menuName = ref("");
const menuLink = ref("");
const saveButtonDisabled = ref(false);
const sliders = ref([]);
const docDialog = ref(false);
const docTitle = ref("");
const docLink = ref("");
const docType = ref("doc");
const docTypes = [
  { value: "doc", label: "文档(markdown)" },
  { value: "group", label: "分组(group)" },
];
const docTypeDisable = ref(false);
const currentGroup = ref(null);
const currentDoc = ref(null);
const editorShow = ref(false);
const uploading = ref(false);
const sliderURLS = ref([]);
const showUploadPanel = ref(false);
const docEditDialog = ref(false);
const docEditData = ref(null);
const docEditTitle = ref("");
const isCollapsed = ref(false);
const isLogin = ref(false);
const isDirty = ref(false);

// Helpers
const info = (msg) => ElMessage.info(msg);
const warn = (msg) => ElMessage.warning(msg);
const success = (msg) => ElMessage.success(msg);
const error = (msg) => ElMessage.error(msg);

const userValidate = () => {
  isLogin.value = false;
  validateToken(getToken())
    .then((res) => {
      isLogin.value = res;
    })
    .catch(() => {
      isLogin.value = false;
    });
};

const getProject = () => {
  if (route.query.name) {
    projectName.value = route.query.name;
  }

  queryProject({ projectId: projectId.value, token: getToken() }).then(
    (res) => {
      if (res && res.name) {
        projectName.value = res.name;
      }
      hero.value = (res && res.hero) || {};
    },
  );
};

const menuDrop = (dropResult) => {
  const { removedIndex, addedIndex } = dropResult;
  if (removedIndex === null || addedIndex === null) return;
  const item = menus.value[removedIndex];
  menus.value.splice(removedIndex, 1);
  menus.value.splice(addedIndex, 0, item);
  sortMenu({
    projectId: projectId.value,
    token: getToken(),
    data: menus.value,
  }).then((res) => {
    console.log(res);
  });
};

const loadMockMenus = () => {
  menus.value = [
    { name: "开始", link: "kaishi", isActive: true },
    { name: "开发计划", link: "kaifajihua", isActive: false },
    { name: "API", link: "api", isActive: false },
    { name: "样式", link: "yangshi", isActive: false },
    { name: "博客", link: "boke", isActive: false },
    { name: "插件", link: "chajian", isActive: false },
    { name: "关于", link: "guanyu", isActive: false },
  ];
  // Select the first mock menu
  menuClick(menus.value[0]);
};

const getMenus = () => {
  queryMenu({ projectId: projectId.value, token: getToken() })
    .then((res) => {
      menus.value = res || [];
      if (menus.value.length > 0) {
        // Automatically select the first menu if available
        menuClick(menus.value[0]);
      }
    })
    .catch(() => {
      loadMockMenus();
    });
};

const _reset = () => {
  menuName.value = "";
  menuLink.value = "";
  dialog.value = false;
  getMenus();
};

const menuInput = () => {
  if (menuName.value) {
    menuLink.value = pinyin(menuName.value, {
      toneType: "none",
      type: "array",
    }).join("");
  } else {
    menuLink.value = "";
  }
};

const getAllSliders = () => {
  querySlider({ projectId: projectId.value, token: getToken() }).then((res) => {
    let a = [];
    res.forEach((e) => {
      let t = e.sliders,
        o = e.name,
        r = e.link;
      t &&
        t.forEach((sub) => {
          let n = sub.name,
            sl = sub.link,
            children = sub.children,
            grp = sub.group;
          if (children && grp) {
            children.forEach((c) => {
              let path = `${o}/${n}/${c.name}`;
              let url = `./${r}/${c.link}`;
              a.push({ label: path, url: url });
            });
          } else {
            let path = `${o}/${n}`;
            let url = `./${r}/${sl}`;
            a.push({ label: path, url: url });
          }
        });
    });
    sliderURLS.value = a;
  });
};

const addMenu = () => {
  if (
    !menuName.value ||
    menuName.value.length < 2 ||
    !menuLink.value ||
    menuLink.value.length < 2
  ) {
    warn("请填写你的菜单名称和连接");
    return;
  }
  if (
    menus.value.some(
      (e) => e.link && e.link.toLowerCase() === menuLink.value.toLowerCase(),
    )
  ) {
    warn(`${menuLink.value} 链接已经存在请更换别的地址`);
    return;
  }
  saveButtonDisabled.value = true;
  saveMenu({
    projectId: projectId.value,
    token: getToken(),
    name: menuName.value,
    link: menuLink.value,
  })
    .then((res) => {
      saveButtonDisabled.value = false;
      success(`添加菜单(${menuName.value})成功`);
      _reset();
      getAllSliders();
    })
    .catch((e) => {
      error(e.message || e);
      saveButtonDisabled.value = false;
    });
};

const getSliders = (menu) => {
  querySliderList({
    projectId: projectId.value,
    token: getToken(),
    name: menu.name,
    link: menu.link,
  }).then((res) => {
    res = res || [];
    res.forEach((e) => {
      e.isActive = false;
      if (e.children) e.children.forEach((c) => (c.isActive = false));
    });
    sliders.value = res;
  });
};

const menuClick = (menu) => {
  checkSave(() => {
    menus.value.forEach((e) => (e.isActive = false));
    menu.isActive = true;
    getSliders(menu);
    currentMenu.value = menu;
    currentLink.value = `/${menu.link}`;
    editorShow.value = false;
    currentDoc.value = null;
  });
};

const _saveSliders = () => {
  console.log("🚀 ~ currentMenu:", currentMenu.value);
  console.log("🚀 ~ sliders:", sliders.value);
  return new Promise((resolve, reject) => {
    if (!currentMenu.value) {
      warn("请先选择一个菜单");
      return reject("No menu selected");
    }
    saveSlider({
      projectId: projectId.value,
      token: getToken(),
      link: currentMenu.value.link,
      data: sliders.value,
    })
      .then((res) => {
        resolve();
      })
      .catch((err) => reject(err));
  });
};

const toggleSliderDialog = () => {
  if (!currentMenu.value) {
    warn("请先选择一个菜单");
    return;
  }
  docTitle.value = "";
  docType.value = "doc";
  docLink.value = "";
  docDialog.value = true;
  docTypeDisable.value = false;
};

const docNameInput = () => {
  if (docTitle.value) {
    docLink.value = pinyin(docTitle.value, {
      toneType: "none",
      type: "array",
    })
      .join("")
      .toLowerCase();
  } else {
    docLink.value = "";
  }
};

const addDocItem = () => {
  if (!currentMenu.value) {
    warn("请先选择一个菜单");
    return;
  }
  let e = docTitle.value,
    t = docType.value,
    n = docLink.value;
  if (!e || e.length < 2 || !t) {
    warn("请填写文档名称和文档类别");
    return;
  }
  let a =
    n || pinyin(e, { toneType: "none", type: "array" }).join("").toLowerCase();

  let exists = false;
  if (sliders.value) {
    for (let i = 0; i < sliders.value.length; i++) {
      let s = sliders.value[i];
      if (s.link && s.link.toLowerCase() === a) {
        exists = true;
        break;
      }
      if (s.children) {
        for (let j = 0; j < s.children.length; j++) {
          if (s.children[j].link.toLowerCase() === a) {
            exists = true;
            break;
          }
        }
      }
      if (exists) break;
    }
  }

  if (!exists) {
    let newItem = { name: e, group: t === "group", link: a };
    let target = currentGroup.value
      ? ((currentGroup.value.children = currentGroup.value.children || []),
        currentGroup.value.children)
      : sliders.value;
    target.push(newItem);
    _saveSliders().then(() => {
      success(`添加 ${e} 文档成功`);
      docDialog.value = false;
      currentGroup.value = null;
      getAllSliders();
    });
  } else {
    warn(`${docTitle.value} 链接已经存在,请更换别的名称`);
  }
};

const groupAddDocItem = (slider) => {
  currentGroup.value = slider;
  toggleSliderDialog();
  docType.value = "doc";
  docTypeDisable.value = true;
};

const editDocItem = (slider) => {
  docEditData.value = slider;
  docEditTitle.value = slider.name;
  docEditDialog.value = true;
};

const saveEditDocItem = () => {
  if (!docEditTitle.value || docEditTitle.value.length < 2) {
    warn("请填写文档名字,长度不能小于2");
    return;
  }
  if (docEditData.value) {
    if (docEditData.value.name === docEditTitle.value) {
      warn("请修改名字否则关闭该弹窗");
      return;
    }
    docEditData.value.name = docEditTitle.value;
    _saveSliders().then(() => {
      success("修改文档成功");
      docEditDialog.value = false;
      docEditData.value = null;
      getAllSliders();
    });
  }
};

const beforeUnloadListener = (e) => {
  if (isDirty.value) {
    e.preventDefault();
    e.returnValue = "";
  }
};

const checkSave = (next, onCancel) => {
  if (isDirty.value) {
    ElMessageBox.confirm(
      '当前文档有未保存的修改，是否保存？',
      '提示',
      {
        confirmButtonText: '保存',
        cancelButtonText: '不保存',
        type: 'warning',
        distinguishCancelAndClose: true
      }
    )
      .then(() => {
        saveDoc().then(() => {
          next();
        });
      })
      .catch((action) => {
        if (action === 'cancel') {
          isDirty.value = false;
          next();
        } else if (onCancel) {
          onCancel();
        }
      });
  } else {
    next();
  }
};

const docItemClick = (slider) => {
  checkSave(() => {
    sliders.value.forEach((s) => {
      s.isActive = false;
      if (s.children) s.children.forEach((c) => (c.isActive = false));
    });
    slider.isActive = true;

    let t = slider.link;
    let n = currentLink.value
      ? currentLink.value.split("/").slice(0, 2)
      : ["", ""];
    n.push(t);
    currentLink.value = n.join("/");
    currentDoc.value = slider;
    editorShow.value = true;

    queryDoc({
      projectId: projectId.value,
      token: getToken(),
      link: currentMenu.value.link,
      item: slider.link,
      name: slider.name,
    }).then((res) => {
      if (editorPanelRef.value) {
        if (hero.value.theme) editorPanelRef.value.setTheme(hero.value.theme);
        editorPanelRef.value.setValue(res);
        isDirty.value = false;
      }
    });
  });
};

const saveDoc = () => {
  if (!currentMenu.value || !currentDoc.value) return Promise.resolve();
  if (!editorPanelRef.value) return Promise.resolve();
  
  const content = editorPanelRef.value.getValue();
  return apiSaveDoc({
    projectId: projectId.value,
    token: getToken(),
    link: currentMenu.value.link,
    item: currentDoc.value.link,
    data: content,
  }).then(() => {
    success(`(${currentMenu.value.name}/${currentDoc.value.name})文档保存成功`);
    isDirty.value = false;
  });
};

// Build task subscription helpers
const closeBuildStream = (taskId) => {
  const stream = activeBuildStreams.get(taskId);
  if (stream) {
    stream.close();
    activeBuildStreams.delete(taskId);
  }
};

const handleBuildTaskStatus = (taskId, task) => {
  if (task.status === "COMPLETED") {
    success('编译成功！');
    isBuilding.value = false;
    closeBuildStream(taskId);
    return true;
  }
  if (task.status === "FAILED") {
    error('编译失败');
    isBuilding.value = false;
    closeBuildStream(taskId);
    return true;
  }
  return false;
};

const subscribeBuildTask = (taskId, retryCount = 0) => {
  const token = getToken();
  if (!token) {
    error("登录状态失效，请重新登录");
    isBuilding.value = false;
    return;
  }

  closeBuildStream(taskId);
  const stream = new EventSource(`/api/build/${taskId}/stream?token=${encodeURIComponent(token)}`);
  activeBuildStreams.set(taskId, stream);

  stream.onmessage = (event) => {
    try {
      const payload = JSON.parse(event.data);
      const task = payload.task;
      handleBuildTaskStatus(taskId, task);
    } catch (e) {
      closeBuildStream(taskId);
      isBuilding.value = false;
      error("构建状态解析失败");
    }
  };

  stream.onerror = async () => {
    closeBuildStream(taskId);
    try {
      const { task } = await getBuildStatus(taskId);
      if (handleBuildTaskStatus(taskId, task)) {
        return;
      }
      if (retryCount < 5) {
        setTimeout(() => {
          subscribeBuildTask(taskId, retryCount + 1);
        }, 1500);
      } else {
        isBuilding.value = false;
        error("构建状态连接中断，请稍后重试");
      }
    } catch (e) {
      isBuilding.value = false;
      error("查询构建状态失败");
    }
  };
};

const saveAndBuild = async () => {
  if (isBuilding.value) return;
  isBuilding.value = true;
  
  try {
    await saveDoc();
    info('已加入构建队列...');
    const result = await buildProject({ projectId: projectId.value, token: getToken() });
    const taskId = result.taskId;
    
    if (!taskId) {
      throw new Error('未能获取任务ID');
    }
    
    subscribeBuildTask(taskId);
  } catch (e) {
    isBuilding.value = false;
    error('保存编译失败: ' + (e.message || '未知错误'));
  }
};

const openUploadPanel = () => {
  showUploadPanel.value = !showUploadPanel.value;
};

const uploadFile = (file, cb) => {
  uploading.value = true;
  let fd = new FormData();
  fd.append("avatar", file);
  fd.append("token", getToken());
  uploadImageFile(fd)
    .then((res) => {
      if (res && (res.fileName || res.url)) {
        let url = res.fileName || res.url;
        if (!url && res.fileName) {
          let t = getHost();
          url = `${t}/uploads/${res.fileName}`;
        }
        cb(url);
      } else {
        error("上传失败: 未知响应格式");
      }
      uploading.value = false;
    })
    .catch(() => {
      uploading.value = false;
      error("上传失败");
    });
};

const onUploadSuccess = ({ file, url }) => {
  console.log('Upload success:', file.name, url);
};

const importMd = () => {
  let input = document.createElement("input");
  input.type = "file";
  input.accept = ".md";
  input.addEventListener("change", () => {
    if (input.files.length) {
      let file = input.files[0];
      let reader = new FileReader();
      reader.onload = () => {
        if (editorPanelRef.value && reader.result) {
          editorPanelRef.value.setValue(reader.result);
        }
      };
      reader.readAsText(file);
    } else {
      error("没有发现上传文件");
    }
  });
  input.click();
};

const copyValue = (text) => {
  toClipboard(text)
    .then(() => {
      success(`复制 ${text} 成功`);
    })
    .catch(() => {
      error(`复制 ${text} 失败`);
    });
};

const sliderDrop = (dropResult) => {
  const { removedIndex, addedIndex } = dropResult;
  if (removedIndex === null || addedIndex === null) return;
  const item = sliders.value[removedIndex];
  sliders.value.splice(removedIndex, 1);
  sliders.value.splice(addedIndex, 0, item);
  _saveSliders().then(() => {
    docDialog.value = false;
    currentGroup.value = null;
  });
};

const sliderItemDrop = ({ dropResult, slider }) => {
  const { removedIndex, addedIndex } = dropResult;
  if (removedIndex === null || addedIndex === null) return;
  const children = slider.children || [];
  const item = children[removedIndex];
  children.splice(removedIndex, 1);
  children.splice(addedIndex, 0, item);
  _saveSliders().then(() => {
    docDialog.value = false;
    currentGroup.value = null;
  });
};

const onEditorReady = () => {
  console.log('Editor ready');
};

// Lifecycle
onMounted(async () => {
  const loading = ElLoading.service({
    lock: true,
    text: "Initializing Editor...",
    background: "rgba(0, 0, 0, 0.7)",
  });

  try {
    userValidate();
    const p = route.query.p;
    if (p) {
      projectId.value = p;
      getProject();
      getMenus();
    } else {
      getMenus();
    }

    getAllSliders();

    // Key binding
    document.addEventListener("keydown", (e) => {
      if (e.ctrlKey && e.keyCode === 83) {
        e.preventDefault();
        saveDoc();
      }
    });

    window.addEventListener("beforeunload", beforeUnloadListener);
  } catch (e) {
    console.error(e);
    error("Failed to load editor resources");
  } finally {
    loading.close();
  }
});

onBeforeRouteLeave((to, from) => {
  return new Promise((resolve) => {
    checkSave(
      () => resolve(true),
      () => resolve(false)
    );
  });
});

onBeforeUnmount(() => {
  window.removeEventListener("beforeunload", beforeUnloadListener);
  // Close all build task SSE streams
  for (const [taskId, stream] of activeBuildStreams.entries()) {
    stream.close();
    activeBuildStreams.delete(taskId);
  }
});
</script>

<style>
.markdown-body>*:first-child {
    margin-top: 0 !important;
}

.main {
  height: 100%;
  width: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.content {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.header,
.menu-container {
  flex-shrink: 0;
}

.flex {
  display: flex;
}

/* Global styles for responsive dialog */
.responsive-dialog {
  width: 30% !important;
}

@media (max-width: 768px) {
  .responsive-dialog {
    width: 90% !important;
    margin-top: 20vh !important;
  }
  
  .responsive-dialog .el-form-item {
    display: block !important;
    margin-bottom: 20px;
  }
  
  .responsive-dialog .el-form-item__label {
    width: 100% !important;
    text-align: left !important;
    display: block !important;
    float: none !important;
    padding: 0 0 8px 0 !important;
    line-height: normal !important;
  }
  
  .responsive-dialog .el-form-item__content {
    margin-left: 0 !important;
    display: block !important;
  }
}
</style>
