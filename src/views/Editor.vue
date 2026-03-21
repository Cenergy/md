<template>
  <div class="main">
    <Header :show="!hideHeader" />

    <div class="menu-container flex">
      <div class="project-text menu-panel">{{ projectName }}</div>
      <div class="menu-panel flex">
        <Container @drop="menuDrop" orientation="horizontal" class="flex">
          <Draggable v-for="(menu, index) in menus" :key="index">
            <el-tooltip content="可以拖拽来调节菜单顺序" placement="top">
              <div
                class="item draggable-item"
                :class="{ active: menu.isActive }"
                @click="menuClick(menu)"
              >
                {{ menu.name }}
              </div>
            </el-tooltip>
          </Draggable>
        </Container>
      </div>
      <div class="menu-panel flex" style="align-items: center; flex: 1; padding-right: 20px; justify-content: space-between">
        <div class="left-action">
          <el-button type="primary" size="mini" @click="dialog = true" plain>
            <i class="iconfont icon-tianjia"></i> +菜单
          </el-button>
        </div>
        <div class="right-action flex" style="align-items: center">
          <div style="width: 1px; height: 16px; background: #e5e7eb; margin: 0 10px"></div>
          <el-checkbox v-model="hideHeader" size="mini" border>隐藏头部</el-checkbox>
          <el-checkbox v-model="hideLinksPanel" size="mini" border>隐藏侧边</el-checkbox>
        </div>
      </div>
    </div>

    <div
      class="content flex"
      ref="contentRef"
    >
      <div class="left-nav animate__animated" :class="{ collapsed: isCollapsed }" ref="leftnav">
        <div class="left-nav-header">
          <div class="nav-toggle" @click="toggleLeftNav" :title="isCollapsed ? '展开侧边栏' : '收起侧边栏'">
            <i class="iconfont" style="font-style: normal; font-size: 16px;" v-html="isCollapsed ? '&#10095;' : '&#10094;'"></i>
          </div>
          <el-button
            type="primary"
            size="mini"
            @click.stop="toggleSliderDialog"
            plain
            v-if="!isCollapsed"
            style="flex: 1; margin: 0 10px;"
          >
            <i class="iconfont icon-tianjia"></i> +文档
          </el-button>
        </div>
        <div class="nav-content">
          <div class="slider-content">
            <Container @drop="sliderDrop" class="smooth-dnd-container vertical">
              <Draggable v-for="(slider, index) in sliders" :key="index">
                <div
                  class="slider-item"
                  :class="{ active: slider.isActive, group: slider.group }"
                  @click="docItemClick(slider)"
                >
                  <div class="slider-header">
                    <i
                      class="column-drag-handle iconfont icon-tuozhuaicaidandaohang"
                    ></i>
                    <button class="btn" @click.stop="editDocItem(slider)">
                      <i class="iconfont icon-xiugai"></i>
                    </button>
                    <span :class="{ label: slider.group }">{{
                      slider.name
                    }}</span>
                    <button
                      class="btn"
                      v-if="slider.group"
                      @click.stop="groupAddDocItem(slider)"
                      style="margin-left: 5px"
                    >
                      <i class="iconfont icon-tianjia"></i>+
                    </button>
                  </div>
                  <!-- Simplified group handling -->
                  <div v-if="slider.group" class="group-children">
                    <Container
                      @drop="(e) => sliderItemDrop(e, slider)"
                      :min-height="10"
                    >
                      <Draggable
                        v-for="(child, cIndex) in slider.children || []"
                        :key="cIndex"
                      >
                        <div
                          class="slider-item child-item"
                          :class="{ active: child.isActive }"
                          @click.stop="docItemClick(child)"
                        >
                          <div class="slider-header">
                            <i
                              class="column-drag-handle iconfont icon-tuozhuaicaidandaohang"
                            ></i>
                            <button class="btn" @click.stop="editDocItem(child)">
                              <i class="iconfont icon-xiugai"></i>
                            </button>
                            <span>{{ child.name }}</span>
                          </div>
                        </div>
                      </Draggable>
                    </Container>
                  </div>
                </div>
              </Draggable>
            </Container>
          </div>
        </div>
        <div class="left-nav-footer">
          <div class="link-info" v-if="currentLink">
            <el-button type="text" size="mini" @click="copyValue(currentLink)" class="copy-btn" title="点击复制">
              <i class="iconfont icon-fuzhi1"></i>
            </el-button>
            <span class="link-text" :title="currentLink">{{ currentLink }}</span>
          </div>
          <div class="link-info empty" v-else>
            <span class="placeholder">暂无文档链接</span>
          </div>
        </div>
      </div>

      <div
        class="right-nav"
        ref="editpanel"
      >
        <div class="tools">
          <el-button size="mini" @click="importMd">导入Markdown</el-button>
          <el-button size="mini" @click="openUploadPanel">托管附件</el-button>
          <el-button size="mini" @click="saveDoc">保存文档</el-button>
        </div>
        <div class="edit-container flex" style="flex: 1; overflow: hidden">
          <div class="edit-panel flex" style="flex: 1; height: 100%">
            <div id="editor" ref="editorContainer" class="editor panel" v-show="editorShow"></div>
            <div class="editor-desc panel" v-show="!editorShow">
              点击左侧的列表项进行文档编辑
            </div>
          </div>
          <div
            class="menuurls"
            v-show="!hideLinksPanel"
            style="width: 260px; flex-shrink: 0"
          >
            <div class="menuurls-header">
              <i class="iconfont icon-link"></i> 相对目录参考
            </div>
            <div class="menuurls-list">
              <div class="row" v-for="url in sliderURLS" :key="url.url">
                <div class="url-label" :title="url.url">{{ url.label }}</div>
                <el-button type="primary" link size="small" @click="copyValue(url.url)">复制</el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
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
          :header-cell-style="{ background: '#f5f7fa', color: '#606266' }"
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

    <!-- Upload Panel (Shopcar) -->
    <div
      class="shopcar"
      :class="{ open: showUploadPanel }"
      v-show="showUploadPanel"
      ref="shopcar"
    >
      <div class="shopcar-title">
        <span class="close-btn" @click="showUploadPanel = false"
          ><i class="close-btn-icon iconfont icon-guanbianniu"></i
        ></span>
      </div>
      
      <el-upload
        class="upload-demo"
        drag
        action="#"
        multiple
        :http-request="handleUploadRequest"
        v-model:file-list="uploadFiles"
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
                @click.stop="copyUploadFile(file)"
              >
                <i class="iconfont icon-fuzhi1"></i>
              </el-button>
              <el-button 
                type="danger" 
                size="small" 
                circle 
                @click.stop="deleteUploadFile(file)"
              >
                <i class="iconfont icon-shanchu"></i>
              </el-button>
            </div>
          </div>
        </template>
      </el-upload>
    </div>
    <el-dialog v-model="previewDialogVisible" append-to-body>
      <img :src="previewImageUrl" style="width: 100%" />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount } from "vue";
import { useRoute, useRouter, onBeforeRouteLeave } from "vue-router";
import { getToken, wrapUrl, getHost } from "@/utils";
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
} from "@/request/http";
import {
  loadMonaco,
  createEditor,
  getEditor,
  destroyEditor
} from "@/utils/editor";

import { ElMessage, ElLoading, ElMessageBox } from "element-plus";
import { pinyin } from "pinyin-pro";
import useClipboard from "vue-clipboard3";
import Header from "@/components/Header.vue";
import { loadEditorPlugins } from "@/utils/lazy-loader";

const route = useRoute();
const router = useRouter();
const { toClipboard } = useClipboard();

// State
const editorContainer = ref(null);
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
const editorShow = ref(true);
const uploading = ref(false);
const uploadFileURL = ref("");
const sliderURLS = ref([]);
const showUploadPanel = ref(false);
const uploadFiles = ref([]);
const docEditDialog = ref(false);
const docEditData = ref(null);
const docEditTitle = ref("");
const isCollapsed = ref(false);

const toggleLeftNav = () => {
  isCollapsed.value = !isCollapsed.value;
};

const handleResize = () => {
  if (window.innerWidth < 900) {
    isCollapsed.value = true;
  } else {
    isCollapsed.value = false;
  }
};
const isLogin = ref(false);
const isDirty = ref(false);
const previewDialogVisible = ref(false);
const previewImageUrl = ref("");
let isSettingValue = false;

const contentRef = ref(null);
const leftnav = ref(null);
const shopcar = ref(null);

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
        console.log("🚀 ~ docItemClick ~ hero:", hero.value)

      if (getEditor()) {
          if (hero.value.theme) getEditor().setTheme(hero.value.theme);
          isSettingValue = true;
          getEditor().setValue(res);
          isSettingValue = false;
          isDirty.value = false;
      }
    });
  });
};

const saveDoc = () => {
  if (!currentMenu.value || !currentDoc.value) return Promise.resolve();
  if (!getEditor()) return Promise.resolve();
  return apiSaveDoc({
    projectId: projectId.value,
    token: getToken(),
    link: currentMenu.value.link,
    item: currentDoc.value.link,
    data: getEditor().getValue(),
  }).then((res) => {
    success(`(${currentMenu.value.name}/${currentDoc.value.name})文档保存成功`);
    isDirty.value = false;
  });
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
      console.log("🚀 ~ res:", res);
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
    .catch((err) => {
      console.error(err);
      uploading.value = false;
      error("上传失败");
    });
};

const handleUploadRequest = (options) => {
  const { file, onSuccess, onError } = options;
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
        onSuccess({ url: url });
      } else {
        onError(new Error("Unknown response format"));
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
      backgroundSize: "cover",
      backgroundPosition: "center",
      color: "#fff",
      textShadow: "1px 1px 2px rgba(0,0,0,0.8)",
      padding: "10px",
      borderRadius: "4px",
      cursor: "pointer",
    };
  }
  return {};
};

const handlePreview = (file) => {
  const url = file.url || (file.response && file.response.url);
  if (url && /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i.test(file.name)) {
    previewImageUrl.value = url;
    previewDialogVisible.value = true;
  }
};

const handleUploadSuccess = (response, file, fileList) => {
  if (response && response.url) {
    file.url = response.url;
    success("上传成功");
  }
};

const handleUploadError = (err, file, fileList) => {
  error("上传失败: " + (err.message || "未知错误"));
};

const copyUploadFile = (file) => {
  if (!file.url && !file.response?.url) {
    warn("文件链接无效");
    return;
  }
  // Element Plus file object structure compatibility
  const url = file.url || file.response?.url;
  const prefixURL = "";
  // Check type from file.raw or file.name extension
  const isImg = /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i.test(file.name);
  const name = file.name || "file";
  const text = isImg
    ? `![${name}](${prefixURL}${url})`
    : `[${name}](${prefixURL}${url})`;
  copyValue(text);
};

const deleteUploadFile = (file) => {
  const index = uploadFiles.value.indexOf(file);
  if (index !== -1) {
    uploadFiles.value.splice(index, 1);
  }
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
        if (getEditor() && reader.result) getEditor().setValue(reader.result);
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

const sliderItemDrop = (dropResult, slider) => {
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

// Lifecycle
onMounted(async () => {
  handleResize();
  window.addEventListener("resize", handleResize);
  const loading = ElLoading.service({
    lock: true,
    text: "Initializing Editor...",
    background: "rgba(0, 0, 0, 0.7)",
  });

  try {
    await loadEditorPlugins();

    userValidate();
    const p = route.query.p;
    if (p) {
      projectId.value = p;
      getProject();
      getMenus();
    } else {
      // Local fallback
      getMenus();
    }

    

    // Init MDEditor
    if (editorContainer.value) {
      createEditor(editorContainer.value, {
        theme: hero.value.theme || 'serene-rose',
        warn: warn,
        info: info,
        uploadFile: uploadFile,
        saveDoc: saveDoc,
        importMd: importMd,
        openUploadPanel: openUploadPanel,
        getLeftNav: () => leftnav.value
      }, () => {
        const mEditor = getEditor();
        // Dirty check listener
        mEditor.editor.onDidChangeModelContent(() => {
          if (!isSettingValue) {
            isDirty.value = true;
          }
        });
      });
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
  window.removeEventListener("resize", handleResize);
  window.removeEventListener("beforeunload", beforeUnloadListener);
  destroyEditor();
});
</script>

<style>
.markdown-body>*:first-child {
    margin-top: 0 !important;
}
/* Add any necessary global styles or overrides here */
.main {
  height: 100%;
  width: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* Ensure content fills remaining vertical space */
.content {
  flex: 1;
  min-height: 0; /* Critical for nested scroll containers in flex column */
  overflow: hidden;
}

/* Prevent header/menu from shrinking */
.header,
.menu-container {
  flex-shrink: 0;
}

.flex {
  display: flex;
}
.hidden {
  display: none;
}
.slider-header {
  display: flex;
  align-items: center;
}
.slider-item.group {
  border-top: 1px solid rgba(60, 60, 67, 0.12);
  margin-top: 12px;
  padding-top: 10px;
}
.group-children {
  padding-left: 20px;
}
.slider-item .label {
  font-weight: 700;
  color: rgba(60, 60, 67);
}
.slider-item.active span {
  color: #10b981;
}
.column-drag-handle {
  margin-right: 5px;
  cursor: grab;
}
.slider-item .btn {
  margin-right: 5px;
}
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
.drag-zone {
  border: 2px dashed #ccc;
  border-radius: 4px;
  padding: 20px;
  text-align: center;
  margin-bottom: 20px;
  color: #666;
}
.shopcar-list {
  flex: 1;
  overflow-y: auto;
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

/* Global styles for responsive dialog - copied from Projects.vue */
.responsive-dialog {
  width: 30% !important; /* Default desktop width */
}

@media (max-width: 768px) {
  .responsive-dialog {
    width: 90% !important;
    margin-top: 20vh !important;
  }
  
  /* Stack label and input on mobile */
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

#editor {
  display: flex;
  flex-direction: column;
}
</style>
