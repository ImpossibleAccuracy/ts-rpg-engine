<template>
  <canvas ref="canvas" class="disable-anti-aliasing"></canvas>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";
import { createCarGame } from "@/examples/cargame";

const canvas = ref<HTMLCanvasElement>();

function updateCanvasSize() {
  canvas.value!.width = canvas.value!.offsetWidth;
  canvas.value!.height = canvas.value!.offsetHeight;
}

onMounted(() => {
  const isDev = process.env.NODE_ENV == "development";

  const assetsPath = isDev ? "/src/assets/car/" : "/assets/car/";

  createCarGame(canvas.value!, assetsPath);

  updateCanvasSize();
  window.addEventListener("resize", updateCanvasSize);
});
</script>