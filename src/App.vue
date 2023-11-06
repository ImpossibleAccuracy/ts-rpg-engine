<template>
  <main>
    <canvas ref="canvas" height="500" width="500"></canvas>
  </main>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";
import { TestGameEngine } from "@/testgame";

const canvas = ref<HTMLCanvasElement>();

onMounted(() => {
  const gameEngine = new TestGameEngine(canvas.value!);
  gameEngine.start();
});
</script>

<style lang="scss" scoped>
main {
  width: 100vw;
  height: 100vh;

  display: flex;
  align-items: center;
  justify-content: center;
}
</style>