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
      <div class="menu-panel">
        <button type="text" @click="dialog = true">+菜单</button>&nbsp;&nbsp;
        <el-checkbox v-model="hideHeader" @change="hideHeaderChange"
          >隐藏头部菜单</el-checkbox
        >
        <el-checkbox v-model="hideLinksPanel" @change="hideLinksPanelChange"
          >隐藏右侧菜单链接面板</el-checkbox
        >
      </div>
    </div>

    <div
      class="content flex"
      ref="content"
      :style="{
        height: hideHeader ? 'calc(100% - 32px)' : 'calc(100% - 92px)',
      }"
    >
      <div class="left-nav animate__animated" ref="leftnav">
        <div class="link-panel">
          <div class="el-row">
            <div class="el-col el-col-18">
              <el-input size="mini" disabled></el-input>
            </div>
            <div class="el-col el-col-6">
              <el-button size="mini" @click="toggleSliderDialog"
                >+文档</el-button
              >
            </div>
          </div>
        </div>
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

      <div
        class="right-nav"
        ref="editpanel"
        :style="{ width: hideLinksPanel ? '100%' : 'calc(100% - 260px)' }"
      >
        <div class="tools">
          <el-button size="mini" @click="importMd">导入Markdown</el-button>
          <el-button size="mini" @click="openUploadPanel">托管附件</el-button>
          <el-button size="mini" @click="saveDoc">保存文档</el-button>
        </div>
        <div class="edit-container flex">
          <div class="edit-panel flex" style="width: 100%">
            <div id="editor" class="editor panel" v-show="editorShow"></div>
            <div class="editor-desc panel" v-show="!editorShow">
              点击左侧的列表项进行文档编辑
            </div>
          </div>
          <div class="menuurls" v-show="!hideLinksPanel">
            <h3>相对目录</h3>
            <div class="row" v-for="url in sliderURLS" :key="url.url">
              <button @click="copyValue(url.url)">复制</button>{{ url.label }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <el-dialog v-model="dialog" title="添加菜单" width="30%">
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
      </el-form>
      <template #footer>
        <el-button @click="dialog = false">取 消</el-button>
        <el-button
          type="primary"
          @click="addMenu"
          :disabled="saveButtonDisabled"
          >确 定</el-button
        >
      </template>
    </el-dialog>

    <el-dialog v-model="docDialog" title="添加文档" width="30%">
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
        <el-button @click="docDialog = false">取 消</el-button>
        <el-button type="primary" @click="addDocItem">确 定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="docEditDialog" title="修改文档" width="30%">
      <el-form label-width="80px">
        <el-form-item label="文档名称">
          <el-input
            v-model="docEditTitle"
            placeholder="请输入文档名称"
          ></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="docEditDialog = false">取 消</el-button>
        <el-button type="primary" @click="saveEditDocItem">确 定</el-button>
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
      <div class="drag-zone center"><h4>拖拽你的文件集合到这里</h4></div>
      <div class="shopcar-list">
        <div class="row" v-for="(file, index) in uploadFiles" :key="file.path">
          {{ file.path }}
          <div class="el-row">
            <div class="el-col el-col-16">
              <button class="green" @click="copyUploadFile(file)"><i class="iconfont icon-fuzhi1"></i></button
              ><button class="red" @click="deleteUploadFile(index)">
                <i class="iconfont icon-shanchu"></i>
              </button>
            </div>
            <div class="el-col el-col-8"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import { Container, Draggable } from "vue3-smooth-dnd";
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
  saveDoc,
  querySliderList,
} from "@/request/http";
import {
  loadMonaco,
  createEditor,
  getEditor,
  destroyEditor,
} from "@/utils/editor";
import { ElMessage, ElLoading } from "element-plus";
import { pinyin } from "pinyin-pro";
import useClipboard from "vue-clipboard3";
import Header from "@/components/Header.vue";
import { loadEditorPlugins } from "@/utils/lazy-loader";
import { uploadImageFile } from "../request/http";

export default defineComponent({
  components: { Container, Draggable, Header },
  setup() {
    const { toClipboard } = useClipboard();
    return { toClipboard };
  },
  data() {
    return {
      hideHeader: true,
      hideLinksPanel: true,
      dialog: false,
      hero: {},
      projectId: "",
      projectName: "",
      menus: [],
      currentMenu: null,
      currentLink: "",
      menuName: "",
      menuLink: "",
      saveButtonDisabled: false,
      sliders: [],
      docDialog: false,
      docTitle: "",
      docLink: "",
      docType: "doc",
      docTypes: [
        { value: "doc", label: "文档(markdown)" },
        { value: "group", label: "分组(group)" },
      ],
      docTypeDisable: false,
      currentGroup: null,
      currentDoc: null,
      editorShow: true,
      uploading: false,
      uploadFileURL: "",
      sliderURLS: [],
      showUploadPanel: false,
      uploadFiles: [],
      docEditDialog: false,
      docEditData: null,
      docEditTitle: "",
      isLogin: false,
    };
  },
  methods: {
    info(msg) {
      ElMessage.info(msg);
    },
    warn(msg) {
      ElMessage.warning(msg);
    },
    success(msg) {
      ElMessage.success(msg);
    },
    error(msg) {
      ElMessage.error(msg);
    },

    userValidate() {
      this.isLogin = false;
      validateToken(getToken())
        .then((res) => {
          this.isLogin = res;
        })
        .catch(() => {
          this.isLogin = false;
        });
    },

    hideHeaderChange() {
      // Handled by reactive style binding
    },
    hideLinksPanelChange() {
      // Handled by reactive style binding
    },
    getProject() {
      // If we already have the name from the query params, we can use it initially
      if (this.$route.query.name) {
        this.projectName = this.$route.query.name;
      }

      queryProject({ projectId: this.projectId, token: getToken() }).then(
        (res) => {
          if (res.name) {
            this.projectName = res.name;
          }
          this.hero = res.hero || {};
        },
      );
    },
    menuDrop(dropResult) {
      const { removedIndex, addedIndex } = dropResult;
      if (removedIndex === null || addedIndex === null) return;
      const item = this.menus[removedIndex];
      this.menus.splice(removedIndex, 1);
      this.menus.splice(addedIndex, 0, item);
      sortMenu({
        projectId: this.projectId,
        token: getToken(),
        data: this.menus,
      }).then((res) => {
        console.log(res);
      });
    },
    getMenus() {
      queryMenu({ projectId: this.projectId, token: getToken() })
        .then((res) => {
          this.menus = res || [];
          if (this.menus.length > 0) {
            // Automatically select the first menu if available
            this.menuClick(this.menus[0]);
          }
        })
        .catch(() => {
          this.loadMockMenus();
        });
    },
    loadMockMenus() {
      this.menus = [
        { name: "开始", link: "kaishi", isActive: true },
        { name: "开发计划", link: "kaifajihua", isActive: false },
        { name: "API", link: "api", isActive: false },
        { name: "样式", link: "yangshi", isActive: false },
        { name: "博客", link: "boke", isActive: false },
        { name: "插件", link: "chajian", isActive: false },
        { name: "关于", link: "guanyu", isActive: false },
      ];
      // Select the first mock menu
      this.menuClick(this.menus[0]);
    },
    _reset() {
      this.menuName = "";
      this.menuLink = "";
      this.dialog = false;
      this.getMenus();
    },
    menuInput() {
      if (this.menuName) {
        this.menuLink = pinyin(this.menuName, {
          toneType: "none",
          type: "array",
        }).join("");
      } else {
        this.menuLink = "";
      }
    },
    addMenu() {
      if (
        !this.menuName ||
        this.menuName.length < 2 ||
        !this.menuLink ||
        this.menuLink.length < 2
      ) {
        this.warn("请填写你的菜单名称和连接");
        return;
      }
      if (
        this.menus.some(
          (e) => e.link && e.link.toLowerCase() === this.menuLink.toLowerCase(),
        )
      ) {
        this.warn(`${this.menuLink} 链接已经存在请更换别的地址`);
        return;
      }
      this.saveButtonDisabled = true;
      saveMenu({
        projectId: this.projectId,
        token: getToken(),
        name: this.menuName,
        link: this.menuLink,
      })
        .then((res) => {
          this.saveButtonDisabled = false;
          this.success(`添加菜单(${this.menuName})成功`);
          this._reset();
          this.getAllSliders();
        })
        .catch((e) => {
          this.error(e.message || e);
          this.saveButtonDisabled = false;
        });
    },
    menuClick(menu) {
      this.menus.forEach((e) => (e.isActive = false));
      menu.isActive = true;
      this.getSliders(menu);
      this.currentMenu = menu;
      this.currentLink = `/${menu.link}`;
      this.editorShow = false;
      this.currentDoc = null;
    },
    getAllSliders() {
      querySlider({ projectId: this.projectId, token: getToken() }).then(
        (res) => {
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
          this.sliderURLS = a;
        },
      );
    },
    _saveSliders() {
      console.log("🚀 ~ this.currentMenu:", this.currentMenu);
      console.log("🚀 ~ this.sliders:", this.sliders);
      return new Promise((resolve, reject) => {
        if (!this.currentMenu) {
          this.warn("请先选择一个菜单");
          return reject("No menu selected");
        }
        saveSlider({
          projectId: this.projectId,
          token: getToken(),
          link: this.currentMenu.link,
          data: this.sliders,
        })
          .then((res) => {
            resolve();
          })
          .catch((err) => reject(err));
      });
    },
    getSliders(menu) {
      querySliderList({
        projectId: this.projectId,
        token: getToken(),
        name: menu.name,
        link: menu.link,
      }).then((res) => {
        res = res || [];
        res.forEach((e) => {
          e.isActive = false;
          if (e.children) e.children.forEach((c) => (c.isActive = false));
        });
        this.sliders = res;
      });
    },
    toggleSliderDialog() {
      // 判断是否有当前菜单
      if (!this.currentMenu) {
        this.warn("请先选择一个菜单");
        return;
      }
      this.docTitle = "";
      this.docType = "doc";
      this.docLink = "";
      this.docDialog = true;
      this.docTypeDisable = false;
    },
    docNameInput() {
      if (this.docTitle) {
        this.docLink = pinyin(this.docTitle, {
          toneType: "none",
          type: "array",
        })
          .join("")
          .toLowerCase();
      } else {
        this.docLink = "";
      }
    },
    addDocItem() {
      if (!this.currentMenu) {
        this.warn("请先选择一个菜单");
        return;
      }
      let e = this.docTitle,
        t = this.docType,
        n = this.docLink;
      if (!e || e.length < 2 || !t) {
        this.warn("请填写文档名称和文档类别");
        return;
      }
      let a =
        n ||
        pinyin(e, { toneType: "none", type: "array" }).join("").toLowerCase();

      let exists = false;
      if (this.sliders) {
        for (let i = 0; i < this.sliders.length; i++) {
          let s = this.sliders[i];
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
        let target = this.currentGroup
          ? ((this.currentGroup.children = this.currentGroup.children || []),
            this.currentGroup.children)
          : this.sliders;
        target.push(newItem);
        this._saveSliders().then(() => {
          this.success(`添加 ${e} 文档成功`);
          this.docDialog = false;
          this.currentGroup = null;
          this.getAllSliders();
        });
      } else {
        this.warn(`${this.docTitle} 链接已经存在,请更换别的名称`);
      }
    },
    groupAddDocItem(slider) {
      this.currentGroup = slider;
      this.toggleSliderDialog();
      this.docType = "doc";
      this.docTypeDisable = true;
    },
    editDocItem(slider) {
      this.docEditData = slider;
      this.docEditTitle = slider.name;
      this.docEditDialog = true;
    },
    saveEditDocItem() {
      if (!this.docEditTitle || this.docEditTitle.length < 2) {
        this.warn("请填写文档名字,长度不能小于2");
        return;
      }
      if (this.docEditData) {
        if (this.docEditData.name === this.docEditTitle) {
          this.warn("请修改名字否则关闭该弹窗");
          return;
        }
        this.docEditData.name = this.docEditTitle;
        this._saveSliders().then(() => {
          this.success("修改文档成功");
          this.docEditDialog = false;
          this.docEditData = null;
          this.getAllSliders();
        });
      }
    },
    docItemClick(slider) {
      this.sliders.forEach((s) => {
        s.isActive = false;
        if (s.children) s.children.forEach((c) => (c.isActive = false));
      });
      slider.isActive = true;

      let t = slider.link;
      let n = this.currentLink
        ? this.currentLink.split("/").slice(0, 2)
        : ["", ""];
      n.push(t);
      this.currentLink = n.join("/");
      this.currentDoc = slider;
      this.editorShow = true;

      queryDoc({
        projectId: this.projectId,
        token: getToken(),
        link: this.currentMenu.link,
        item: slider.link,
        name: slider.name,
      }).then((res) => {
        createEditor("#editor", this, () => {
          if (getEditor()) getEditor().setValue(res);
        });
      });
    },
    saveDoc() {
      if (!this.currentMenu || !this.currentDoc) return;
      if (!getEditor()) return;
      saveDoc({
        projectId: this.projectId,
        token: getToken(),
        link: this.currentMenu.link,
        item: this.currentDoc.link,
        data: getEditor().getValue(),
      }).then((res) => {
        this.success(
          `(${this.currentMenu.name}/${this.currentDoc.name})文档保存成功`,
        );
      });
    },
    openUploadPanel() {
      this.showUploadPanel = !this.showUploadPanel;
      // setTimeout(() => { this.$refs.shopcar.style.right = 0 }, 32)
    },
    uploadFile(file, cb) {
      this.uploading = true;
      let fd = new FormData();
      fd.append("avatar", file);
      fd.append("token", getToken());
      uploadImageFile(fd)
        .then((res) => {
          console.log("🚀 ~ res:", res);
          if (res && (res.fileName || res.url)) {
            let url = res.fileName;
            if (!url && res.fileName) {
              let t = getHost();
              // If getHost is just origin, we might need to handle it carefully.
              // But sticking to the logic that was commented out (implied intent):
              // t.substring(0, t.lastIndexOf("/")) + "/p/" + res.fileName;
              // If t is "http://localhost:3000", lastIndexOf("/") is 6 (//).
              // This logic seems to want to strip the last path segment?
              // If t was "http://domain.com/app", it becomes "http://domain.com/p/..."
              // Since getHost() is now just origin, we can probably just append.

              // However, let's look at getHost usage again.
              // It is imported from '@/utils'.

              // I will just use origin + /p/ for now.
              url = `${t}/p/${res.fileName}`;
            }
            cb(url);
          } else {
            this.error("上传失败: 未知响应格式");
          }
          this.uploading = false;
        })
        .catch((err) => {
          console.error(err);
          this.uploading = false;
          this.error("上传失败");
        });

      // fetch(wrapUrl("/file/upload"), {method: "post", body: fd})
      //     .then(res => res.json())
      //     .then(res => {
      //         let t = getHost();
      //         t = t.substring(0, t.lastIndexOf("/")) + "/p/" + res.fileName;
      //         cb(t);
      //     })
      //     .catch(e => {
      //         this.error(e.message);
      //         cb();
      //     });
    },
    copyUploadFile(file) {
      if (!file.url) {
        this.warn("文件链接无效");
        return;
      }
      const prefixURL="//mdpress.glicon.design/p/";
      const isImage = file.type && file.type.startsWith('image/');
      const name = file.path ? file.path.split(/[\\/]/).pop() : "file";
      const text = isImage ? `![${name}](${prefixURL}${file.url})` : `[${name}](${prefixURL}${file.url})`;
      this.copyValue(text);
    },
    deleteUploadFile(index) {
      this.uploadFiles.splice(index, 1);
    },
    importMd() {
      let input = document.createElement("input");
      input.type = "file";
      input.accept = ".md";
      input.addEventListener("change", () => {
        if (input.files.length) {
          let file = input.files[0];
          let reader = new FileReader();
          reader.onload = () => {
            if (getEditor() && reader.result)
              getEditor().setValue(reader.result);
          };
          reader.readAsText(file);
        } else {
          this.error("没有发现上传文件");
        }
      });
      input.click();
    },
    copyValue(text) {
      this.toClipboard(text)
        .then(() => {
          this.success(`复制 ${text} 成功`);
        })
        .catch(() => {
          this.error(`复制 ${text} 失败`);
        });
    },
    sliderDrop(dropResult) {
      const { removedIndex, addedIndex } = dropResult;
      if (removedIndex === null || addedIndex === null) return;
      const item = this.sliders[removedIndex];
      this.sliders.splice(removedIndex, 1);
      this.sliders.splice(addedIndex, 0, item);
      this._saveSliders().then(() => {
        this.docDialog = false;
        this.currentGroup = null;
      });
    },
    sliderItemDrop(dropResult, slider) {
      const { removedIndex, addedIndex } = dropResult;
      if (removedIndex === null || addedIndex === null) return;
      const children = slider.children || [];
      const item = children[removedIndex];
      children.splice(removedIndex, 1);
      children.splice(addedIndex, 0, item);
      this._saveSliders().then(() => {
        this.docDialog = false;
        this.currentGroup = null;
      });
    },
  },
  async mounted() {
    const loading = ElLoading.service({
      lock: true,
      text: "Initializing Editor...",
      background: "rgba(0, 0, 0, 0.7)",
    });

    try {
      await loadEditorPlugins();

      this.userValidate();
      const p = this.$route.query.p;
      if (p) {
        this.projectId = p;
        this.getProject();
        this.getMenus();
      } else {
        // Local fallback
        this.getMenus();
      }

      // Register monaco if needed by mdpress
      loadMonaco();

      this.getAllSliders();

      // Initialize FileDND
      if (window.filednd && window.filednd.FileDND) {
        new window.filednd.FileDND(document.querySelector(".drag-zone")).dnd(
          (files) => {
            if (files.length) {
              let i = 0;
              let list = [];
              this.uploading = true;
              const process = () => {
                if (i < files.length) {
                  let fileItem = files[i];
                  this.uploadFile(fileItem, (url) => {
                    list.push({
                      path: fileItem.path,
                      url: url,
                      type: fileItem.type,
                    });
                    i++;
                    process();
                  });
                } else {
                  setTimeout(() => {
                    this.uploading = false;
                  }, 200);
                  this.uploadFiles = this.uploadFiles.concat(list);
                }
              };
              process();
            } else {
              this.warn("你拖拽的文件里没有找到任何的文件");
            }
          },
        );
      }

      // Key binding
      document.addEventListener("keydown", (e) => {
        if (e.ctrlKey && e.keyCode === 83) {
          e.preventDefault();
          this.saveDoc();
        }
      });
    } catch (e) {
      console.error(e);
      this.error("Failed to load editor resources");
    } finally {
      loading.close();
    }
  },
  beforeUnmount() {
    destroyEditor();
  },
});
</script>

<style>
/* Add any necessary global styles or overrides here */
.main {
  height: 100%;
  width: 100%;
  overflow: hidden;
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
</style>
