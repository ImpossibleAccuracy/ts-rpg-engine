<template>
  <canvas ref="canvas"></canvas>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";
import { createEggWorld } from "@/testgame";

const canvas = ref<HTMLCanvasElement>();

function updateCanvasSize() {
  canvas.value!.width = canvas.value!.offsetWidth;
  canvas.value!.height = canvas.value!.offsetHeight;
}

onMounted(() => {
  createEggWorld(canvas.value!, "/assets/");

  updateCanvasSize();
  window.addEventListener("resize", updateCanvasSize);
});
</script>

<style lang="scss" scoped>
canvas {
  width: 100% !important;
  height: 100% !important;
}
</style>