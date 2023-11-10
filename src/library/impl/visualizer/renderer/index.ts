import { AbstractRenderer } from "@/library/api/visualizer";
import type { Model } from "@/library/api/visualizer/model";
import { SpriteArrayModel, SpriteModel } from "@/library/api/visualizer/model";
import {
  ImageModel,

} from "@/library/impl/models/imageModel";
import { ColorModel } from "@/library/impl/models/colorModel";
import { SpriteImageModel } from "@/library/impl/models/spriteImageModel";

export class CanvasRenderer extends AbstractRenderer {
  public readonly canvas: HTMLCanvasElement;
  public readonly context: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement) {
    super();
    this.canvas = canvas;
    this.context = canvas.getContext("2d")!;
  }

  public clear() {
    this.context.fillStyle = "black";
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  public save() {
    this.context.save();
  }

  public drawModel(model: Model, x: number, y: number, w: number, h: number) {
    if (model instanceof SpriteModel) {
      if (model.spriteMetadata.isAutomatic) {
        model.tryNextSprite();
      }

      if (model instanceof SpriteImageModel) {
        const chunkSizeX = model.spriteMetadata.chunkSizeX;
        const chunkSizeY = model.spriteMetadata.chunkSizeY;

        const activeCol = model.activeCol;
        const activeRow = model.activeRow;

        const sx = model.spriteMetadata.spriteOffsetX
          ? model.spriteMetadata.spriteOffsetX + chunkSizeX * activeCol
          : chunkSizeX * activeCol;

        const sy = model.spriteMetadata.spriteOffsetY
          ? model.spriteMetadata.spriteOffsetY + chunkSizeY * activeRow
          : chunkSizeY * activeRow;

        const sw = model.spriteMetadata.spriteWidth
          ? model.spriteMetadata.spriteWidth
          : chunkSizeX;

        const sh = model.spriteMetadata.spriteHeight
          ? model.spriteMetadata.spriteHeight
          : chunkSizeY;

        this.context.drawImage(model.image, sx, sy, sw, sh, x, y, w, h);
      } else if (model instanceof SpriteArrayModel) {
        this.drawModel(model.activeSprite, x, y, w, h);
      }
    } else if (model instanceof ImageModel) {
      this.context.drawImage(model.image, x, y, w, h);
    } else if (model instanceof ColorModel) {
      this.context.fillStyle = model.color;

      this.context.fillRect(x, y, w, h);
    } else {
      throw new Error("Invalid data type: " + model);
    }
  }
}
