<template>
  <router-view></router-view>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
.main {
  height: 100%;
  width: 100%;
  overflow: hidden;
}
/* Keep global styles that were in App.vue if they are not scoped or specific to Editor */
/* Actually, the previous App.vue had <style> without scoped, so they were global. */
/* But Editor.vue now has them. If they are global, they might affect other pages. */
/* The previous styles were: .main, .flex, .hidden, .slider-header, etc. */
/* I should probably keep them in Editor.vue if they are specific to the Editor layout, */
/* OR move them to a global css file. */
/* Since Projects.vue uses an iframe, it won't be affected by global styles (except the iframe container). */
/* So it's safe to leave them in Editor.vue for now, but I added .main here just in case App needs it. */
</style>
