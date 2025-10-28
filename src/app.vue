<script>

import ToolbarContent from "./public/components/toolbar-content.component.vue";
import ControlPanelPage
  from "./public/pages/control-panel-page.component.vue";

export default {
  name: "app",
  components: {ControlPanelPage, ToolbarContent},
  computed: {
    showToolbar() {
      const noToolbarRoutes = ['sign-in', 'sign-up'];
      return !noToolbarRoutes.includes(this.$route.name);
    }
  }
}
</script>

<template>
  <div class="app-container">
    <toolbar-content v-if="showToolbar"></toolbar-content>
    <div class="content-container" :class="{ 'no-toolbar': !showToolbar }">
      <router-view></router-view>
    </div>
    <pv-toast />
  </div>

</template>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f8f9fa;
}

.content-container {
  margin-top: 64px;
  flex: 1;
  padding: 20px;
}

.content-container.no-toolbar {
  margin-top: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}

@media (max-width: 768px) {
  .content-container {
    margin-top: 250px;
    width: 100%;
    padding: 20px;
  }
  
  .content-container.no-toolbar {
    margin-top: 0;
    padding: 20px;
  }
}
</style>