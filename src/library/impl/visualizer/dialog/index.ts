import { CanvasRenderer } from "@/library/impl/visualizer/renderer";
import { CanvasVisualizer } from "@/library/impl/visualizer/world";
import type { DialogData } from "@/library/impl/model/dialog";

export class DialogVisualizer extends CanvasVisualizer {
  constructor(renderer: CanvasRenderer) {
    super(renderer);
  }

  onDraw(dialogData: DialogData, activeButtonIndex: number) {
    const context = this.renderer.context;
    const canvas = this.renderer.canvas;

    const margin = 12;
    const padding = 12;
    const height = 100;

    const offsetX = margin;
    const offsetY = canvas.height - height - margin;

    context.fillStyle = "brown";
    context.fillRect(offsetX, offsetY, canvas.width - margin * 2, height);

    context.fillStyle = "white";
    context.fillText(
      activeButtonIndex.toString(),
      offsetX + padding,
      offsetY + padding,
    );
  }
}
