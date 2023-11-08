<template>
  <canvas ref="canvas"></canvas>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";
import { createEggWorld } from "@/examples/egggame";

const canvas = ref<HTMLCanvasElement>();

function updateCanvasSize() {
  canvas.value!.width = canvas.value!.offsetWidth;
  canvas.value!.height = canvas.value!.offsetHeight;
}

onMounted(() => {
  const isDev = process.env.NODE_ENV == "development";

  const assetsPath = isDev ? "/src/assets/" : "/assets/";

  createEggWorld(canvas.value!, assetsPath);

  updateCanvasSize();
  window.addEventListener("resize", updateCanvasSize);
});
</script>