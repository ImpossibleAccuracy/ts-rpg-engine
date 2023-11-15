<template>
  <main>
<!--    <button-->
<!--      @click="-->
<!--        $route.path === '/egg' ? $router.push('/car') : $router.push('/egg')-->
<!--      "-->
<!--    >-->
<!--      toggle-->
<!--    </button>-->

    <router-view class="content" />
  </main>
</template>

<style lang="scss" scoped>
main {
  width: 100vw;
  height: 100vh;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  //padding: 24px;

  .content {
    width: 100% !important;
    height: 100% !important;
  }
}
</style>
