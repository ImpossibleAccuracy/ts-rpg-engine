import { AbstractRenderer } from "@/library/api/visualizer";

export class CanvasRenderer extends AbstractRenderer {
  public readonly canvas: HTMLCanvasElement;
  public readonly context: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement) {
    super();
    this.canvas = canvas;
    this.context = canvas.getContext("2d")!;
  }

  public clearCanvas() {
    this.context.fillStyle = "black";
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }
}
