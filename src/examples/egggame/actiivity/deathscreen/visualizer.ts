import { AbstractVisualizer } from "@/library/api/visualizer";
import type { CanvasRenderer } from "@/library/impl/visualizer/renderer";

export class DeathscreenVisualizer extends AbstractVisualizer<CanvasRenderer> {
  constructor(renderer: CanvasRenderer) {
    super(renderer);
  }

  public draw(timeUntilRestart: number) {
    const canvas = this.renderer.canvas;
    const context = this.renderer.context;

    const width = 400;
    const height = 100;

    const startX = (canvas.width - width) / 2;
    const startY = (canvas.height - height) / 2 + 50;

    context.fillStyle = "yellowgreen";
    context.fillRect(startX, startY, width, height);

    const text = `Возрождение через ${timeUntilRestart}`;

    context.fillStyle = "black";
    context.font = "24px bold Courier New";
    context.fillText(text, startX + 10, startY + 24);
  }
}
