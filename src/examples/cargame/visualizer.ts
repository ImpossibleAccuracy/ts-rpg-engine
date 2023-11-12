import { LevelVisualizer } from "@/library/api/visualizer";
import { CanvasRenderer } from "@/library/impl/visualizer/renderer";
import { Rect2D } from "@/library/api/data/rect";
import type { Level } from "@/library/api/level";

export class SuperPuperMegaTripleXXXVisualizer extends LevelVisualizer<
  CanvasRenderer,
  Rect2D
> {
  public static readonly blockSizePx: number = 48;

  constructor(renderer: CanvasRenderer) {
    super(renderer);
  }

  display(level: Level<Rect2D>): void {
    const canvas = this.renderer.canvas;
    const blockSizePx = SuperPuperMegaTripleXXXVisualizer.blockSizePx;

    this.renderer.clear();

    const mapDimensions = level.dimensions;

    const windowOffsetX =
      canvas.width / 2 - (mapDimensions.sizeX * blockSizePx) / 2;

    const objects = level.entities;

    for (const entity of objects) {
      const model = entity.model;
      const modelRect = entity.getModelRect();

      const x =
        modelRect.posX >= 0 ? windowOffsetX + modelRect.posX * blockSizePx : 0;
      let y = modelRect.posY * blockSizePx;
      const w =
        modelRect.sizeX > 0 ? modelRect.sizeX * blockSizePx : canvas.width;
      const h =
        modelRect.sizeY > 0 ? modelRect.sizeY * blockSizePx : canvas.height;

      // if (entity.type == "car") {
      //   y = canvas.height - blockSizePx * 2;
      // }

      this.renderer.drawModel(model, x, y, w, h);
    }

    this.renderer.save();
  }
}
