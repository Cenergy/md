<template>
  <div class="main">
    <Header />
    <div class="content-container">
      <div class="start container">
        <div class="item">
          1.用邮箱注册个账号并登录 <i class="iconfont icon-ziyuanxhdpi"></i>
        </div>
        <div class="item">
          2.进入项目页面&nbsp;<a href="./project.html"
            ><i class="iconfont icon-xiangmu"></i></a
          >&nbsp;创建一个自己的项目,注意项目页面你也会看到你作为协作者的项目的
          <i class="iconfont icon-renren"></i>
        </div>
        <div class="item">
          3.编辑你的项目基本信息,主要包括：
          <ul>
            <li>产品的名字,比如VuePress</li>
            <li>产品简易描述</li>
            <li>产品的宣传标语</li>
            <li>产品的特点特色</li>
            <li class="green">
              项目编译后会自动生成如下的首页信息(这里以maptalks产品举例)
            </li>
          </ul>
          <img src="./img/maptalks.png" />
        </div>
        <div class="item">
          4.接着点击项目的文档按钮,为你的项目添加菜单,目录结构,文档等了
          <ul>
            <li>添加菜单</li>
            <li>为每个菜单添加对应的目录结构和文档内容</li>
            <li>编辑每个文档的内容</li>
            <li>上传已经存在的markdown文件</li>
            <li>保存你编辑好的文档</li>
            <li>...</li>
          </ul>
          <img src="./img/editpage.png" /> 注意：<br />
          <ul class="red">
            <li>
              仅仅支持二级目录,如果你文档有多级目录的需求,应该尽可能的将其平行话,不要进行嵌套,技术上支持多级目录没有问题,但是生成的侧边栏会非常丑陋
            </li>
            <li>
              比如有个需求是要展示：中国-&gt;省-&gt;市这样的需求,你可以改成中国-江苏,中国-上海这样的结构目录
            </li>
            <li>
              多人协作一个项目时要尽可能的按照菜单和功能的划分来协作文档的书写,比如人员1负责菜单1,人员2负责菜单2这样来安排任务,尽可能的减少多人同时操作同一个文档的可能,以此来减少文档的冲突
            </li>
          </ul>
        </div>
        <div class="item">
          5.当你认为文档写的差不多了,你就可以编译你的项目了,然后点击浏览地址就可以查看你的项目文档的内容了
        </div>
      </div>
      <div
        id="start-video"
        class="container xgplayer xgplayer-pc xgplayer-nostart xgplayer-pause xgplayer-skin-default"
        style="width: 1521.59px; height: 700px"
      >
        <xg-controls
          class="xgplayer-controls"
          unselectable="on"
          onselectstart="return false"
          ><xg-placeholder class="xgplayer-placeholder"></xg-placeholder
          ><xg-progress class="xgplayer-progress" tabindex="1"
            ><xg-outer class="xgplayer-progress-outer">
              <xg-cache class="xgplayer-progress-cache"></xg-cache>
              <xg-played class="xgplayer-progress-played">
                <xg-progress-btn
                  class="xgplayer-progress-btn"
                ></xg-progress-btn>
                <xg-point
                  class="xgplayer-progress-point xgplayer-tips"
                ></xg-point>
                <xg-thumbnail
                  class="xgplayer-progress-thumbnail xgplayer-tips"
                ></xg-thumbnail>
              </xg-played> </xg-outer></xg-progress
          ><xg-play class="xgplayer-play"
            ><xg-icon class="xgplayer-icon">
              <div class="xgplayer-icon-play">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="40"
                  height="40"
                  viewBox="0 0 40 40"
                >
                  <path
                    transform="translate(2,2) scale(0.0320625 0.0320625)"
                    d="M576,363L810,512L576,661zM342,214L576,363L576,661L342,810z"
                  ></path>
                </svg>
              </div>
              <div class="xgplayer-icon-pause">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="40"
                  height="40"
                  viewBox="0 0 40 40"
                >
                  <path
                    transform="translate(2,2) scale(0.0320625 0.0320625)"
                    d="M598,214h170v596h-170v-596zM256 810v-596h170v596h-170z"
                  ></path>
                </svg>
              </div> </xg-icon
            ><xg-tips class="xgplayer-tips"
              ><span class="xgplayer-tip-play">播放</span>
              <span class="xgplayer-tip-pause">暂停</span></xg-tips
            ></xg-play
          ><xg-fullscreen class="xgplayer-fullscreen"
            ><xg-icon class="xgplayer-icon">
              <div class="xgplayer-icon-requestfull">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="40"
                  height="40"
                  viewBox="0 0 40 40"
                >
                  <path
                    transform="scale(0.0320625 0.0320625)"
                    d="M598 214h212v212h-84v-128h-128v-84zM726 726v-128h84v212h-212v-84h128zM214 426v-212h212v84h-128v128h-84zM298 598v128h128v84h-212v-212h84z"
                  ></path>
                </svg>
              </div>
              <div class="xgplayer-icon-exitfull">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="40"
                  height="40"
                  viewBox="0 0 40 40"
                >
                  <path
                    transform="scale(0.0320625 0.0320625)"
                    d="M682 342h128v84h-212v-212h84v128zM598 810v-212h212v84h-128v128h-84zM342 342v-128h84v212h-212v-84h128zM214 682v-84h212v212h-84v-128h-128z"
                  ></path>
                </svg>
              </div> </xg-icon
            ><xg-tips class="xgplayer-tips"
              ><span class="xgplayer-tip-requestfull">进入全屏</span>
              <span class="xgplayer-tip-exitfull">退出全屏</span></xg-tips
            ></xg-fullscreen
          ><xg-volume class="xgplayer-volume"
            ><xg-icon class="xgplayer-icon">
              <div class="xgplayer-icon-large">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="28"
                  height="28"
                  viewBox="0 0 28 28"
                >
                  <path
                    transform="scale(0.0220625 0.0220625)"
                    d="M358.4 358.4h-204.8v307.2h204.8l256 256v-819.2l-256 256z"
                  ></path>
                  <path
                    transform="scale(0.0220625 0.0220625)"
                    d="M940.632 837.632l-72.192-72.192c65.114-64.745 105.412-154.386 105.412-253.44s-40.299-188.695-105.396-253.424l-0.016-0.016 72.192-72.192c83.639 83.197 135.401 198.37 135.401 325.632s-51.762 242.434-135.381 325.612l-0.020 0.020zM795.648 693.248l-72.704-72.704c27.756-27.789 44.921-66.162 44.921-108.544s-17.165-80.755-44.922-108.546l0.002 0.002 72.704-72.704c46.713 46.235 75.639 110.363 75.639 181.248s-28.926 135.013-75.617 181.227l-0.021 0.021z"
                  ></path>
                </svg>
              </div>
              <div class="xgplayer-icon-small">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="28"
                  height="28"
                  viewBox="0 0 28 28"
                >
                  <path
                    transform="scale(0.0220625 0.0220625)"
                    d="M358.4 358.4h-204.8v307.2h204.8l256 256v-819.2l-256 256z"
                  ></path>
                  <path
                    transform="scale(0.0220625 0.0220625)"
                    d="M795.648 693.248l-72.704-72.704c27.756-27.789 44.921-66.162 44.921-108.544s-17.165-80.755-44.922-108.546l0.002 0.002 72.704-72.704c46.713 46.235 75.639 110.363 75.639 181.248s-28.926 135.013-75.617 181.227l-0.021 0.021zM795.648 693.248l-72.704-72.704c27.756-27.789 44.921-66.162 44.921-108.544s-17.165-80.755-44.922-108.546l0.002 0.002 72.704-72.704c46.713 46.235 75.639 110.363 75.639 181.248s-28.926 135.013-75.617 181.227l-0.021 0.021z"
                  ></path>
                </svg>
              </div>
              <div class="xgplayer-icon-muted">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="28"
                  height="28"
                  viewBox="0 0 28 28"
                >
                  <path
                    transform="scale(0.0220625 0.0220625)"
                    d="M358.4 358.4h-204.8v307.2h204.8l256 256v-819.2l-256 256z"
                  ></path>
                  <path
                    transform="scale(0.0220625 0.0220625)"
                    d="M920.4 439.808l-108.544-109.056-72.704 72.704 109.568 108.544-109.056 108.544 72.704 72.704 108.032-109.568 108.544 109.056 72.704-72.704-109.568-108.032 109.056-108.544-72.704-72.704-108.032 109.568z"
                  ></path>
                </svg>
              </div>
            </xg-icon>
            <xg-slider class="xgplayer-slider" tabindex="2">
              <xg-bar class="xgplayer-bar">
                <xg-drag class="xgplayer-drag" style="height: 30%"></xg-drag>
              </xg-bar> </xg-slider></xg-volume
          ><xg-time class="xgplayer-time"
            ><span class="xgplayer-time-current">00:00</span>
            <span>00:00</span></xg-time
          ></xg-controls
        ><xg-enter class="xgplayer-enter"
          ><div class="xgplayer-enter-spinner">
            <div class="xgplayer-enter-bar1"></div>
            <div class="xgplayer-enter-bar2"></div>
            <div class="xgplayer-enter-bar3"></div>
            <div class="xgplayer-enter-bar4"></div>
            <div class="xgplayer-enter-bar5"></div>
            <div class="xgplayer-enter-bar6"></div>
            <div class="xgplayer-enter-bar7"></div>
            <div class="xgplayer-enter-bar8"></div>
            <div class="xgplayer-enter-bar9"></div>
            <div class="xgplayer-enter-bar10"></div>
            <div class="xgplayer-enter-bar11"></div>
            <div class="xgplayer-enter-bar12"></div></div></xg-enter
        ><xg-start class="xgplayer-start"
          ><div class="xgplayer-icon-play">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="70"
              height="70"
              viewBox="0 0 70 70"
            >
              <path
                transform="translate(15,15) scale(0.04,0.04)"
                d="M576,363L810,512L576,661zM342,214L576,363L576,661L342,810z"
              ></path>
            </svg>
          </div>
          <div class="xgplayer-icon-pause">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="70"
              height="70"
              viewBox="0 0 70 70"
            >
              <path
                transform="translate(15,15) scale(0.04 0.04)"
                d="M598,214h170v596h-170v-596zM256 810v-596h170v596h-170z"
              ></path>
            </svg></div></xg-start
        ><xg-loading class="xgplayer-loading"
          ><svg
            xmlns="http://www.w3.org/2000/svg"
            width="100"
            height="100"
            viewBox="0 0 100 100"
          >
            <path d="M100,50A50,50,0,1,1,50,0"></path>
          </svg> </xg-loading
        ><xg-replay class="xgplayer-replay"
          ><svg
            class="xgplayer-replay-svg"
            xmlns="http://www.w3.org/2000/svg"
            width="78"
            height="78"
            viewBox="0 0 78 78"
          >
            <path
              d="M8.22708362,13.8757234 L11.2677371,12.6472196 C11.7798067,12.4403301 12.3626381,12.6877273 12.5695276,13.1997969 L12.9441342,14.1269807 C13.1510237,14.6390502 12.9036264,15.2218816 12.3915569,15.4287712 L6.8284538,17.6764107 L5.90126995,18.0510173 C5.38920044,18.2579068 4.80636901,18.0105096 4.5994795,17.49844 L1.97723335,11.0081531 C1.77034384,10.4960836 2.0177411,9.91325213 2.52981061,9.70636262 L3.45699446,9.33175602 C3.96906396,9.12486652 4.5518954,9.37226378 4.75878491,9.88433329 L5.67885163,12.1615783 C7.99551726,6.6766934 13.3983951,3 19.5,3 C27.7842712,3 34.5,9.71572875 34.5,18 C34.5,26.2842712 27.7842712,33 19.5,33 C15.4573596,33 11.6658607,31.3912946 8.87004692,28.5831991 C8.28554571,27.9961303 8.28762719,27.0463851 8.87469603,26.4618839 C9.46176488,25.8773827 10.4115101,25.8794641 10.9960113,26.466533 C13.2344327,28.7147875 16.263503,30 19.5,30 C26.127417,30 31.5,24.627417 31.5,18 C31.5,11.372583 26.127417,6 19.5,6 C14.4183772,6 9.94214483,9.18783811 8.22708362,13.8757234 Z"
            ></path>
          </svg>

          <xg-replay-txt class="xgplayer-replay-txt"
            >重播</xg-replay-txt
          > </xg-replay
        ><xg-error class="xgplayer-error"
          ><span class="xgplayer-error-text"
            >请<span class="xgplayer-error-refresh">刷新</span>试试</span
          ></xg-error
        >
      </div>
      <div class="start container"></div>
    </div>
  </div>
</template>

<script setup>
import Header from "@/components/Header.vue";
// Logic can be added here if needed
</script>

<style scoped>
.container {
  width: 80%;
  margin: auto;
}
/* Copied and adapted from public/index-3018ea7565.css */
.news {
  padding: 10px;
  border-bottom: 1px solid #f3f3f3;
}

.home {
  margin-top: -60px;
  padding-top: 100px;
  height: 400px;
  background: #10b98117;
  /* background-image: url(../img/bg2.png);  -- Assuming image might be missing or needs correct path */
  background-size: cover;
}
</style>
