import { CanvasRenderer } from "@/library/impl/visualizer/renderer";
import { CanvasVisualizer } from "@/library/impl/visualizer/world";
import type { DialogData } from "@/library/impl/data/dialog";

export class DialogVisualizer extends CanvasVisualizer {
  private readonly maxWidth: number = 300;

  constructor(renderer: CanvasRenderer) {
    super(renderer);
  }

  onDraw(dialogData: DialogData, activeButtonIndex: number) {
    const context = this.renderer.context;
    const canvas = this.renderer.canvas;

    const margin = 12;
    const padding = 12;
    const fontSize = 24;
    const gravity = dialogData.gravity ?? "bottom";

    const height = 100;
    const width = Math.min(this.maxWidth, canvas.width - margin * 2);

    const offsetX = (canvas.width - margin * 2) / 2 - width / 2;
    let offsetY;

    if (gravity == "bottom") {
      offsetY = (canvas.height - margin * 2) / 2 - height / 2 + 200;
    } else if (gravity == "top") {
      offsetY = margin;
    } else {
      offsetY = 0;
    }

    context.fillStyle = "brown";
    context.fillRect(offsetX, offsetY, width, height);

    context.fillStyle = "white";
    context.font = `${fontSize}px Roboto`;
    context.fillText(
      dialogData.title,
      offsetX + padding,
      offsetY + padding + fontSize,
      width - padding * 2,
    );
  }
}
