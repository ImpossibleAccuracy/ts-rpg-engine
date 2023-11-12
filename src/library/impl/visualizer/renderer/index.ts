import { AbstractRenderer } from "@/library/api/visualizer";
import type { Model } from "@/library/api/models";
import { ImageModel } from "@/library/impl/models/imageModel";
import { ColorModel } from "@/library/impl/models/colorModel";
import { SpriteImageModel } from "@/library/impl/models/spriteImageModel";
import { SpriteArrayModel } from "@/library/impl/models/spriteArrayModel";
import { SpriteModel } from "@/library/api/models/spriteModel";
import { TilesetModel } from "@/library/impl/models/tilesetModel";
import { Rect2D } from "@/library/api/data/rect";

export class CanvasRenderer extends AbstractRenderer {
  public readonly canvas: HTMLCanvasElement;
  public readonly context: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement) {
    super();
    this.canvas = canvas;
    this.context = canvas.getContext("2d")!;
    this.context.imageSmoothingEnabled = false;
  }

  public clear() {
    this.context.fillStyle = "black";
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  public save() {
    this.context.save();
  }

  public drawModel(
    model: Model,
    modelRect: Rect2D,
    viewport: Rect2D,
    blockSizeX: number,
    blockSizeY: number,
  ) {
    const startX = (modelRect.posX - viewport.posX) * blockSizeX;
    const startY = (modelRect.posY - viewport.posY) * blockSizeY;
    const modelSizeX = modelRect.sizeX * blockSizeX;
    const modelSizeY = modelRect.sizeY * blockSizeY;

    if (model instanceof SpriteModel) {
      if (model.spriteMetadata.isAutomatic) {
        model.tryNextSprite();
      }

      if (model instanceof SpriteImageModel) {
        this.drawSpriteImageModel(
          model,
          startX,
          startY,
          modelSizeX,
          modelSizeY,
        );
      } else if (model instanceof SpriteArrayModel) {
        this.drawSpriteArrayModel(
          model,
          startX,
          startY,
          modelSizeX,
          modelSizeY,
        );
      }
    } else if (model instanceof TilesetModel) {
      this.drawTilesetModel(
        model,
        viewport,
        modelRect.posX,
        modelRect.posY,
        blockSizeX,
        blockSizeY,
      );
    } else if (model instanceof ImageModel) {
      this.drawImageModel(model, startX, startY, modelSizeX, modelSizeY);
    } else if (model instanceof ColorModel) {
      this.drawColoModel(model, startX, startY, modelSizeX, modelSizeY);
    } else {
      throw new Error("Invalid data type: " + model);
    }
  }

  public drawTilesetModel(
    model: TilesetModel,
    viewport: Rect2D,
    x: number,
    y: number,
    blockSizeX: number,
    blockSizeY: number,
  ) {
    const startX = blockSizeX * (x - viewport.posX);
    const startY = blockSizeY * (y - viewport.posY);

    let f = false;
    for (const part of model.parts) {
      const partCanvasRect = part.destinationRect.copy();
      partCanvasRect.posX += x;
      partCanvasRect.posY += y;

      if (!f) {
        f = true;
      }

      if (!viewport.isOverlaps(partCanvasRect)) continue;

      const partPosX = startX + part.destinationRect.posX * blockSizeX;
      const partPosY = startY + part.destinationRect.posY * blockSizeY;
      const partSizeX = part.destinationRect.sizeX * blockSizeX;
      const partSizeY = part.destinationRect.sizeY * blockSizeY;

      this.context.drawImage(
        model.image,
        Math.floor(part.sourceRect.posX),
        Math.floor(part.sourceRect.posY),
        Math.floor(part.sourceRect.sizeX),
        Math.floor(part.sourceRect.sizeY),
        Math.floor(partPosX),
        Math.floor(partPosY),
        Math.floor(partSizeX),
        Math.floor(partSizeY),
      );
    }
  }

  private drawImageModel(
    model: ImageModel,
    x: number,
    y: number,
    w: number,
    h: number,
  ) {
    this.context.drawImage(model.image, x, y, w, h);
  }

  private drawColoModel(
    model: ColorModel,
    x: number,
    y: number,
    w: number,
    h: number,
  ) {
    this.context.fillStyle = model.color;

    this.context.fillRect(x, y, w, h);
  }

  private drawSpriteImageModel(
    model: SpriteImageModel,
    x: number,
    y: number,
    w: number,
    h: number,
  ) {
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
  }

  private drawSpriteArrayModel(
    model: SpriteArrayModel<ImageModel>,
    x: number,
    y: number,
    w: number,
    h: number,
  ) {
    this.drawImageModel(model.activeSprite, x, y, w, h);
  }
}
