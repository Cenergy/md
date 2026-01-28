<template>
  <div class="main">
    <div class="header" v-show="!hideHeader">
      <div class="container flex">
        <div class="logo item">
          <a href="https://mdpress.glicon.design/">mdpress</a>
        </div>
        <div class="menu flex">
          <div class="item"><a href="https://mdpress.glicon.design/start.html">教程</a></div>
          <div class="item"><a href="https://mdpress.glicon.design/project.html">项目</a></div>
          <div class="item"><a href="https://mdpress.glicon.design/problem.html">常见问题</a></div>
          <div class="item"><a href="https://mdpress.glicon.design/about.html">关于</a></div>
        </div>
        <div class="users flex">
          <div class="item green"><i class="iconfont icon-ziyuanxhdpi"></i></div>
        </div>
      </div>
    </div>

    <div class="menu-container flex">
      <div class="project-text menu-panel">{{ projectName }}</div>
      <div class="menu-panel flex">
        <Container @drop="menuDrop" orientation="horizontal" class="flex">
          <Draggable v-for="(menu, index) in menus" :key="index">
            <el-tooltip content="可以拖拽来调节菜单顺序" placement="top">
              <div class="item draggable-item" :class="{active: menu.isActive}" @click="menuClick(menu)">
                {{ menu.name }}
              </div>
            </el-tooltip>
          </Draggable>
        </Container>
      </div>
      <div class="menu-panel">
        <button type="text" @click="dialog = true">+菜单</button>&nbsp;&nbsp;
        <el-checkbox v-model="hideHeader" @change="hideHeaderChange">隐藏头部菜单</el-checkbox>
        <el-checkbox v-model="hideLinksPanel" @change="hideLinksPanelChange">隐藏右侧菜单链接面板</el-checkbox>
      </div>
    </div>

    <div class="content flex" ref="content" :style="{height: hideHeader ? 'calc(100% - 32px)' : 'calc(100% - 92px)'}">
      <div class="left-nav animate__animated" ref="leftnav">
        <div class="link-panel">
          <div class="el-row">
            <div class="el-col el-col-18">
              <el-input size="mini" disabled></el-input>
            </div>
            <div class="el-col el-col-6">
              <el-button size="mini" @click="toggleSliderDialog">+文档</el-button>
            </div>
          </div>
        </div>
        <div class="slider-content">
          <Container @drop="sliderDrop" class="smooth-dnd-container vertical">
            <Draggable v-for="(slider, index) in sliders" :key="index">
              <div class="slider-item" :class="{active: slider.isActive}" @click="docItemClick(slider)">
                 <i class="column-drag-handle iconfont icon-tuozhuaicaidandaohang"></i>
                 <button class="btn" @click.stop="editDocItem(slider)"><i class="iconfont icon-xiugai"></i></button>
                 <span>{{ slider.name }}</span>
                 <!-- Simplified group handling -->
                 <div v-if="slider.children && slider.children.length > 0" class="group-children">
                    <Container @drop="(e) => sliderItemDrop(e, slider)">
                        <Draggable v-for="(child, cIndex) in slider.children" :key="cIndex">
                           <div class="slider-item child-item" :class="{active: child.isActive}" @click.stop="docItemClick(child)">
                              <span>{{ child.name }}</span>
                           </div>
                        </Draggable>
                    </Container>
                 </div>
              </div>
            </Draggable>
          </Container>
        </div>
      </div>

      <div class="right-nav" ref="editpanel" :style="{width: hideLinksPanel ? '100%' : 'calc(100% - 260px)'}">
         <div class="tools">
            <el-button size="mini" @click="importMd">导入Markdown</el-button>
            <el-button size="mini" @click="openUploadPanel">托管附件</el-button>
            <el-button size="mini" @click="saveDoc">保存文档</el-button>
         </div>
         <div class="edit-container flex">
            <div class="edit-panel flex" style="width: 100%">
               <div id="editor" class="editor panel" v-show="editorShow"></div>
               <div class="editor-desc panel" v-show="!editorShow">点击左侧的列表项进行文档编辑</div>
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
             <el-input v-model="menuName" @input="menuInput" placeholder="请输入菜单名称"></el-input>
          </el-form-item>
          <el-form-item label="菜单链接">
             <el-input v-model="menuLink" placeholder="请输入菜单链接"></el-input>
          </el-form-item>
       </el-form>
       <template #footer>
          <el-button @click="dialog = false">取 消</el-button>
          <el-button type="primary" @click="addMenu" :disabled="saveButtonDisabled">确 定</el-button>
       </template>
    </el-dialog>

    <el-dialog v-model="docDialog" title="添加文档" width="30%">
       <el-form label-width="80px">
          <el-form-item label="文档名称">
             <el-input v-model="docTitle" @input="docNameInput" placeholder="请输入文档名称"></el-input>
          </el-form-item>
          <el-form-item label="文档类型">
             <el-select v-model="docType" :disabled="docTypeDisable" placeholder="请选择">
                <el-option v-for="item in docTypes" :key="item.value" :label="item.label" :value="item.value"></el-option>
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
              <el-input v-model="docEditTitle" placeholder="请输入文档名称"></el-input>
           </el-form-item>
        </el-form>
        <template #footer>
           <el-button @click="docEditDialog = false">取 消</el-button>
           <el-button type="primary" @click="saveEditDocItem">确 定</el-button>
        </template>
    </el-dialog>

    <!-- Upload Panel (Shopcar) -->
    <div class="shopcar animate__animated animate__fadeInRight" v-show="showUploadPanel" ref="shopcar">
       <div class="shopcar-title">
          <span class="close-btn" @click="showUploadPanel = false"><i class="close-btn-icon iconfont icon-guanbianniu"></i></span>
       </div>
       <div class="drag-zone center"><h4>拖拽你的文件集合到这里</h4></div>
       <div class="shopcar-list">
          <div v-for="file in uploadFiles" :key="file.path">{{ file.path }}</div>
       </div>
    </div>

  </div>
</template>

<script>
import { defineComponent } from 'vue'
import { Container, Draggable } from 'vue3-smooth-dnd'
import { get, post, getToken, removeToken, wrapUrl, getHost } from '@/utils'
import * as monaco from 'monaco-editor'
import { ElMessage } from 'element-plus'
import { pinyin } from 'pinyin-pro'
import useClipboard from 'vue-clipboard3'

export default defineComponent({
  components: { Container, Draggable },
  setup() {
    const { toClipboard } = useClipboard()
    return { toClipboard }
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
      docTypes: [{value:"doc",label:"文档(markdown)"},{value:"group",label:"分组(group)"}],
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
      mdEditor: null,
      isLogin: false
    }
  },
  methods: {
    info(msg) { ElMessage.info(msg) },
    warn(msg) { ElMessage.warning(msg) },
    success(msg) { ElMessage.success(msg) },
    error(msg) { ElMessage.error(msg) },

    userValidate(){
       const token = getToken();
       this.isLogin = false;
       if(token){
           get("/tokenvalidate").then(res => {
               this.isLogin = res;
           }).catch(() => {
               this.isLogin = false;
           })
       }
    },

    hideHeaderChange(){
      // Handled by reactive style binding
    },
    hideLinksPanelChange(){
       // Handled by reactive style binding
    },
    getProject(){
      if(this.projectId){
        get("/project/query",{projectId:this.projectId}).then(res=>{
           this.projectName=res.name;
           this.hero=res.hero||{};
        })
      }
    },
    menuDrop(dropResult){
      const { removedIndex, addedIndex } = dropResult
      if (removedIndex === null || addedIndex === null) return
      const item = this.menus[removedIndex]
      this.menus.splice(removedIndex, 1)
      this.menus.splice(addedIndex, 0, item)
      post("/menu/sort",{projectId:this.projectId,data:this.menus}).then(res=>{
         console.log(res)
      })
    },
    getMenus(){
      get("/menu/list",{projectId:this.projectId}).then(res=>{
         this.menus=res || []
         if(this.menus.length === 0) this.loadMockMenus()
      }).catch(() => {
         this.loadMockMenus()
      })
    },
    loadMockMenus(){
        this.menus = [
              { name: '开始', link: 'kaishi', isActive: true },
              { name: '开发计划', link: 'kaifajihua', isActive: false },
              { name: 'API', link: 'api', isActive: false },
              { name: '样式', link: 'yangshi', isActive: false },
              { name: '博客', link: 'boke', isActive: false },
              { name: '插件', link: 'chajian', isActive: false },
              { name: '关于', link: 'guanyu', isActive: false }
        ]
    },
    _reset(){
      this.menuName="";
      this.menuLink="";
      this.dialog=false;
      this.getMenus();
    },
    menuInput(){
      if(this.menuName){
        this.menuLink = pinyin(this.menuName, { toneType: 'none', type: 'array' }).join('')
      } else {
        this.menuLink=""
      }
    },
    addMenu(){
      if(!this.menuName || this.menuName.length<2 || !this.menuLink || this.menuLink.length<2){
        this.warn("请填写你的菜单名称和连接")
        return
      }
      if(this.menus.some(e => e.link && e.link.toLowerCase()===this.menuLink.toLowerCase())){
        this.warn(`${this.menuLink} 链接已经存在请更换别的地址`)
        return
      }
      this.saveButtonDisabled=true
      post("/menu/save",{name:this.menuName,link:this.menuLink,projectId:this.projectId}).then(res=>{
        this.saveButtonDisabled=false
        this.success(`添加菜单(${this.menuName})成功`)
        this._reset()
        this.getAllSliders()
      }).catch(e=>{
        this.error(e.message || e)
        this.saveButtonDisabled=false
      })
    },
    menuClick(menu){
      this.menus.forEach(e => e.isActive=false)
      menu.isActive=true
      this.getSliders(menu)
      this.currentMenu=menu
      this.currentLink=`/${menu.link}`
      this.editorShow=false
      this.currentDoc=null
    },
    getAllSliders(){
      get("/slider/all",{projectId:this.projectId}).then(res=>{
         let a = [];
         res.forEach(e => {
            let t = e.sliders, o = e.name, r = e.link;
            t && t.forEach(sub => {
                let n = sub.name, sl = sub.link, children = sub.children, grp = sub.group;
                if(children && grp){
                    children.forEach(c => {
                        let path = `${o}/${n}/${c.name}`;
                        let url = `./${r}/${c.link}`;
                        a.push({label: path, url: url});
                    })
                } else {
                    let path = `${o}/${n}`;
                    let url = `./${r}/${sl}`;
                    a.push({label: path, url: url});
                }
            })
         })
         this.sliderURLS = a;
      })
    },
    _saveSliders(){
      return new Promise((resolve, reject)=>{
        post("/slider/save",{projectId:this.projectId,link:this.currentMenu.link,data:this.sliders}).then(res=>{
          resolve()
        })
      })
    },
    getSliders(menu){
      get("/slider/list",{projectId:this.projectId,link:menu.link,name:menu.name}).then(res=>{
        res = res || []
        res.forEach(e => {
           e.isActive=false
           if(e.children) e.children.forEach(c => c.isActive=false)
        })
        this.sliders=res
      })
    },
    toggleSliderDialog(){
      this.docTitle=""
      this.docType="doc"
      this.docLink=""
      this.docDialog=true
      this.docTypeDisable=false
    },
    docNameInput(){
       if(this.docTitle){
         this.docLink = pinyin(this.docTitle, { toneType: 'none', type: 'array' }).join('').toLowerCase()
       } else {
         this.docLink = ""
       }
    },
    addDocItem(){
       let e = this.docTitle, t = this.docType, n = this.docLink;
       if(!e || e.length<2 || !t){
           this.warn("请填写文档名称和文档类别")
           return
       }
       let a = n || pinyin(e, { toneType: 'none', type: 'array' }).join('').toLowerCase();
       
       let exists = false;
       if(this.sliders){
           for(let i=0; i<this.sliders.length; i++){
               let s = this.sliders[i];
               if(s.link && s.link.toLowerCase() === a) { exists = true; break; }
               if(s.children){
                   for(let j=0; j<s.children.length; j++){
                       if(s.children[j].link.toLowerCase() === a) { exists = true; break; }
                   }
               }
               if(exists) break;
           }
       }

       if(!exists){
           let newItem = {name: e, group: t === "group", link: a};
           let target = this.currentGroup ? (this.currentGroup.children = this.currentGroup.children || [], this.currentGroup.children) : this.sliders;
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
    groupAddDocItem(slider){
        this.currentGroup = slider;
        this.toggleSliderDialog();
        this.docType = "doc";
        this.docTypeDisable = true;
    },
    editDocItem(slider){
        this.docEditData = slider;
        this.docEditTitle = slider.name;
        this.docEditDialog = true;
    },
    saveEditDocItem(){
        if(!this.docEditTitle || this.docEditTitle.length < 2){
            this.warn("请填写文档名字,长度不能小于2");
            return;
        }
        if(this.docEditData){
            if(this.docEditData.name === this.docEditTitle){
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
    docItemClick(slider){
       this.sliders.forEach(s => {
           s.isActive = false;
           if(s.children) s.children.forEach(c => c.isActive = false);
       });
       slider.isActive = true;
       // Move to top logic was in original but might be annoying if list is long? 
       // Original: this.sliders.splice(0,0); ?? This line looks wrong in original source `this.sliders.splice(0,0)` does nothing.
       
       let t = slider.link;
       let n = this.currentLink ? this.currentLink.split("/").slice(0,2) : ["", ""];
       n.push(t);
       this.currentLink = n.join("/");
       this.currentDoc = slider;
       this.editorShow = true;
       
       get("/slider/item/list", {
           projectId: this.projectId, 
           link: this.currentMenu.link, 
           item: slider.link, 
           name: slider.name
       }).then(res => {
           this.createEditor(() => {
               if(this.mdEditor) this.mdEditor.setValue(res)
           })
       })
    },
    createEditor(cb){
        if(this.mdEditor){
            cb()
            return
        }
        if(!window.mdpress || !window.mdpress.MDEditor) {
            console.error("mdpress not found")
            return
        }
        let t = this.hero.theme || "vitepress";
        this.mdEditor = new window.mdpress.MDEditor("#editor", {
            autoParseVSCodePasteData: true,
            themeURL: "./theme/",
            monacoOptions: { minimap: { enabled: false } }
        });
        this.mdEditor.setTheme(t);
        
        // Add listeners
        this.mdEditor.on("closefullscreen", () => {
            if(this.$refs.leftnav){
                this.$refs.leftnav.classList.remove("left-nav-float");
                this.$refs.leftnav.classList.remove("animate__fadeInLeft");
            }
        });
        
        // Paste handler omitted for brevity but can be added if needed
        
        // Add tool icons
        this.addToolicons();
        
        cb();
    },
    addToolicons(){
        if(!window.mdpress || !window.mdpress.ToolIcon) return;
        const className = "majoricon";
        const icons = [
            {icon:"icon-zhankaicaidan",title:"打开左侧侧边栏",className:className,position:"right"},
            {icon:"icon-file-markdown1",title:"导入markdown",className:className},
            {icon:"icon-fujian1",title:"托管附件",className:className,position:"right"},
            {icon:"icon-baocun1",title:"保存文档",className:className,position:"right"}
        ].map(e => new window.mdpress.ToolIcon(e));
        
        icons.forEach(e => e.addTo(this.mdEditor));
        
        icons[0].on("click", () => {
            if(this.mdEditor.isFullScreen()){
                let cl = this.$refs.leftnav.classList;
                if(cl.contains("left-nav-float")){
                    cl.remove("left-nav-float");
                    cl.remove("animate__fadeInLeft");
                } else {
                    cl.add("left-nav-float");
                    cl.add("animate__fadeInLeft");
                }
            } else {
                this.info("当编辑器全屏时才可以进行该操作");
            }
        });
        icons[1].on("click", () => this.importMd());
        icons[2].on("click", () => this.openUploadPanel());
        icons[3].on("click", () => this.saveDoc());
    },
    saveDoc(){
       if(!this.currentMenu || !this.currentDoc) return;
       if(!this.mdEditor) return;
       post("/slider/item/save",{
           projectId: this.projectId,
           link: this.currentMenu.link,
           item: this.currentDoc.link,
           data: this.mdEditor.getValue()
       }).then(res => {
           this.success(`(${this.currentMenu.name}/${this.currentDoc.name})文档保存成功`)
       })
    },
    openUploadPanel(){
       this.showUploadPanel = !this.showUploadPanel;
       // setTimeout(() => { this.$refs.shopcar.style.right = 0 }, 32)
    },
    uploadFile(file, cb){
        this.uploading = true;
        let fd = new FormData();
        fd.append("avatar", file);
        fd.append("token", getToken());
        fetch(wrapUrl("/file/upload"), {method: "post", body: fd})
            .then(res => res.json())
            .then(res => {
                let t = getHost();
                t = t.substring(0, t.lastIndexOf("/")) + "/p/" + res.fileName;
                cb(t);
            })
            .catch(e => {
                this.error(e.message);
                cb();
            });
    },
    importMd(){
       let input = document.createElement("input");
       input.type = "file";
       input.accept = ".md";
       input.addEventListener("change", () => {
           if(input.files.length){
               let file = input.files[0];
               let reader = new FileReader();
               reader.onload = () => {
                   if(this.mdEditor && reader.result) this.mdEditor.setValue(reader.result);
               };
               reader.readAsText(file);
           } else {
               this.error("没有发现上传文件");
           }
       });
       input.click();
    },
    copyValue(text){
       this.toClipboard(text).then(()=>{
          this.success(`复制 ${text} 成功`)
       }).catch(()=>{
          this.error(`复制 ${text} 失败`)
       })
    },
    sliderDrop(dropResult){
      const { removedIndex, addedIndex } = dropResult
      if (removedIndex === null || addedIndex === null) return
      const item = this.sliders[removedIndex]
      this.sliders.splice(removedIndex, 1)
      this.sliders.splice(addedIndex, 0, item)
      this._saveSliders().then(() => {
         this.docDialog = false;
         this.currentGroup = null;
      })
    },
    sliderItemDrop(dropResult, slider){
      const { removedIndex, addedIndex } = dropResult
      if (removedIndex === null || addedIndex === null) return
      const children = slider.children || []
      const item = children[removedIndex]
      children.splice(removedIndex, 1)
      children.splice(addedIndex, 0, item)
      this._saveSliders().then(() => {
         this.docDialog = false;
         this.currentGroup = null;
      })
    }
  },
  mounted() {
    this.userValidate();
    const urlParams = new URLSearchParams(window.location.search);
    const p = urlParams.get('p');
    if(p){
      this.projectId = p
      this.getProject()
      this.getMenus()
    } else {
      // Local fallback
      this.getMenus()
    }
    
    // Register monaco if needed by mdpress
    if(window.mdpress && window.mdpress.registerMonaco){
       window.mdpress.registerMonaco(monaco)
    }

    // Initialize FileDND
    if(window.filednd && window.filednd.FileDND){
        new window.filednd.FileDND(document.querySelector(".drag-zone")).dnd((files) => {
            if(files.length){
                let i = 0;
                let list = [];
                this.uploading = true;
                const process = () => {
                    if(i < files.length){
                        let n = files[i];
                        this.uploadFile(n, (url) => {
                            list.push({path: n.path, url: url, type: n.type});
                            i++;
                            process();
                        });
                    } else {
                        setTimeout(() => { this.uploading = false }, 200);
                        this.uploadFiles = this.uploadFiles.concat(list);
                    }
                };
                process();
            } else {
                this.warn("你拖拽的文件里没有找到任何的文件");
            }
        });
    }
    
    // Key binding
    document.addEventListener("keydown", (e) => {
        if(e.ctrlKey && e.keyCode === 83){
            e.preventDefault();
            this.saveDoc();
        }
    });
  }
})
</script>

<style>
/* Add any necessary global styles or overrides here */
.main {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}
.flex {
  display: flex;
}
.hidden {
  display: none;
}
</style>
