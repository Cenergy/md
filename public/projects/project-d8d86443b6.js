"use strict";
var get = window.get,
  post = window.post,
  host = getHost();
function formatProjectURL(e) {
  return host.substring(0, host.lastIndexOf("/")) + "/p/".concat(e.id, "/");
}
var themes = [
    "vitepress",
    "v-green",
    "simplicity-green",
    "vuepress",
    "github",
    "github-dark",
    "serene-rose",
    "awesome-green",
    "channing-cyan",
    "chocolate",
    "condensed-night-purple",
    "nico",
    "rude-crab",
    "fancy",
    "jzman",
    "cyanosis",
    "devui-blue",
    "geek-black",
    "mk-cute",
    "scrolls",
    "smart-blue",
    "z-blue",
    "arknights",
    "Chinese-red",
    "greenwillow",
  ],
  vm = new window.Vue({
    mixins: [minxin],
    el: document.querySelector(".main"),
    data: {
      loading: !1,
      dialog: !1,
      saveButtonDisabled: !1,
      projectName: "",
      projectId: "",
      isEdit: !1,
      projects: [],
      projectBuildTime: {},
      collaborateProjects: [],
      currentProject: null,
      drawer: !1,
      drawerTitle: "",
      linkUserDrawer: !1,
      linkUserProject: null,
      linkUserTitle: "",
      keywords: "",
      searchLoading: !1,
      searchData: [],
      linkUsers: [],
      themes: themes.map(function (e) {
        return { value: e, label: e };
      }),
    },
    methods: {
      getStyle: function () {},
      _reset: function () {
        ((this.projectName = ""),
          (this.projectId = ""),
          (this.isEdit = !1),
          (this.dialog = !1),
          this.loadProjects());
      },
      addButtonClick: function () {
        (this._reset(), (this.dialog = !0));
      },
      edit: function (e) {
        ((this.isEdit = !0),
          (this.projectName = e.name),
          (this.projectId = e.id),
          (this.dialog = !0));
      },
      design: function (e) {
        e = e.id;
        window.open("./edit.html?p=".concat(e));
      },
      addProject: function () {
        var t = this;
        !this.projectName || this.projectName.length < 3
          ? this.$msg.warning(
              "\u8bf7\u586b\u5199\u4f60\u7684\u9879\u76ee\u540d\u79f0",
            )
          : ((this.saveButtonDisabled = !0),
            this.isEdit
              ? post("/project/update", {
                  name: this.projectName,
                  id: this.projectId,
                })
                  .then(function (e) {
                    ((t.saveButtonDisabled = !1),
                      t.$msg.success(
                        "\u7f16\u8f91\u9879\u76ee(".concat(
                          t.projectName,
                          ")\u6210\u529f",
                        ),
                      ),
                      t._reset());
                  })
                  .catch(function (e) {
                    (t.$msg.error(e), (t.saveButtonDisabled = !1));
                  })
              : post("/project/save", { name: this.projectName })
                  .then(function (e) {
                    ((t.saveButtonDisabled = !1),
                      t.$msg.success(
                        "\u6dfb\u52a0\u9879\u76ee(".concat(
                          t.projectName,
                          ")\u6210\u529f",
                        ),
                      ),
                      t._reset());
                  })
                  .catch(function (e) {
                    (t.$msg.error(e), (t.saveButtonDisabled = !1));
                  }));
      },
      loadProjects: function () {
        var t = this;
        get("/project/list", {}).then(function (e) {
          ((t.projects = e || []),
            t.projects.forEach(function (e) {
              e.url = formatProjectURL(e);
            }),
            t.enableStyle());
        });
      },
      loadCollaborateProjects: function () {
        var t = this;
        get("/project/collaborate", {}).then(function (e) {
          ((t.collaborateProjects = e || []),
            t.collaborateProjects.forEach(function (e) {
              e.url = formatProjectURL(e);
            }));
        });
      },
      copyProjectId: function (t) {
        var i = this;
        this.$copyText(t).then(
          function (e) {
            i.$msg.success("\u590d\u5236 ".concat(t, "  \u6210\u529f"));
          },
          function (e) {
            i.$msg.error("\u590d\u5236 ".concat(t, "  \u5931\u8d25"));
          },
        );
      },
      addProfileInfo: function (t) {
        var i = this;
        ((this.drawer = !0),
          (this.drawerTitle = t.name),
          post("/project/profile", { projectId: t.id, query: !0 }).then(
            function (e) {
              i.currentProject = Object.assign(
                { features: [], themeColor: "#10b981", theme: "vitepress" },
                e,
                { id: t.id },
              );
            },
          ));
      },
      addFeatue: function () {
        this.currentProject.features.push({
          theme: "vitepress",
          title: "",
          details: "",
        });
      },
      deleteFeature: function (e) {
        e = this.currentProject.features.indexOf(e);
        -1 < e && this.currentProject.features.splice(e, 1);
      },
      submitProjectProfileInfo: function () {
        var t = this;
        post(
          "/project/profile",
          Object.assign(
            { projectId: this.currentProject.id },
            this.currentProject,
          ),
        ).then(function (e) {
          (t.success(
            "\u4fdd\u5b58 ".concat(
              t.currentProject.name,
              " \u9996\u9875\u6587\u6848\u4fe1\u606f\u6210\u529f",
            ),
          ),
            (t.drawer = !1));
        });
      },
      buildProject: function (i) {
        var s = this;
        i.loading
          ? this.warn("".concat(i.name, " \u6b63\u5728\u7f16\u8bd1..."))
          : ((i.loading = !0),
            this.projects.splice(0, 0),
            (this.projectBuildTime[i.id] = Date.now()),
            get("/project/build", { projectId: i.id })
              .then(function (e) {
                ((i.loading = !1), s.projects.splice(0, 0));
                var t = Date.now() - s.projectBuildTime[i.id];
                s.success(
                  ""
                    .concat(i.name, " \u7f16\u8bd1\u6210\u529f,\u8017\u65f6:")
                    .concat(t / 1e3, "s"),
                );
              })
              .catch(function (e) {
                (s.projects.splice(0, 0), s.error(e), (i.loading = !1));
              }));
      },
      showLinkUser: function (e) {
        ((this.linkUserProject = e),
          (this.linkUserDrawer = !0),
          (this.linkUserTitle = "".concat(
            e.name,
            " \u534f\u4f5c\u7ba1\u7406\u9875\u9762",
          )),
          (this.keywords = ""),
          (this.searchData = []),
          (this.linkUsers = []),
          this._getProjectLinkUsers());
      },
      _getProjectLinkUsers: function () {
        var t = this;
        get("/project_link/users", { projectId: this.linkUserProject.id }).then(
          function (e) {
            t.linkUsers = e;
          },
        );
      },
      searchUser: function () {
        var t = this;
        this.keywords &&
          ((this.searchLoading = !0),
          get("/userinfo/search", { keywords: this.keywords }).then(
            function (e) {
              (0 === e.length &&
                t.warn(
                  "\u6ca1\u6709\u67e5\u8be2\u5230\u7528\u6237,\u5207\u6362\u8f93\u5165\u6761\u4ef6\u6216\u8005\u63d0\u9192\u5bf9\u7528\u7528\u6237\u6765\u6ce8\u518c\u8d26\u53f7",
                ),
                (t.searchData = e),
                setTimeout(function () {
                  t.searchLoading = !1;
                }, 500));
            },
          ));
      },
      addLinkUser: function (t, i) {
        var s = this;
        post("/project_link/save", {
          projectId: this.linkUserProject.id,
          uid: i.id,
          email: i.email,
        }).then(function (e) {
          (s.success(
            "\u5df2\u7ecf\u6210\u529f\u7684\u5c06 "
              .concat(i.email, " \u52a0\u5165 ")
              .concat(s.linkUserProject.name, " \u7684\u534f\u4f5c\u8005"),
          ),
            s.searchData.splice(t, 1),
            s._getProjectLinkUsers());
        });
      },
      deleteLinkUser: function (e, t) {
        var i = this;
        get("/project_link/delete", {
          projectId: this.linkUserProject.id,
          uid: t.id,
        }).then(function (e) {
          (i.success(
            "\u5220\u9664\u534f\u4f5c\u8005 ".concat(t.email, "\u6210\u529f"),
          ),
            i._getProjectLinkUsers());
        });
      },
    },
    mounted: function () {
      var t = this;
    //   this.tokenValidate(function (e) {
    //     e ? (t.loadProjects(), t.loadCollaborateProjects()) : t.login();
    //   });
    },
  });
