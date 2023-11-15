<template>
  <canvas class="disable-anti-aliasing" ref="canvas"></canvas>
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
  createEggWorld(canvas.value!);

  updateCanvasSize();
  window.addEventListener("resize", updateCanvasSize);
});
</script>