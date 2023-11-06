import { Level } from "@/library/api/level";
import { Rect, Rect2D } from "@/library/api/model/rect";
import type { Entity } from "@/library/api/model/entity";
import {
  Model,
  ModelLoader,
  SpriteModel,
} from "@/library/api/visualizer/model";
import { ColorModel, ColorModelLoader } from "@/library/impl/visualizer/model";
import { AbstractVisualizer, LevelVisualizer } from "@/library/api/visualizer";
import type { CanvasRenderer } from "@/library/impl/visualizer/renderer";

export abstract class CanvasVisualizer extends AbstractVisualizer<CanvasRenderer> {
  protected constructor(renderer: CanvasRenderer) {
    super(renderer);
  }
}

export class FullMapCanvasVisualizer extends LevelVisualizer<
  CanvasRenderer,
  Rect
> {
  constructor(renderer: CanvasRenderer) {
    super(renderer);
  }

  display(level: Level<Rect2D>): void {
    const ctx = this.renderer.context;
    const canvas = this.renderer.canvas;

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const mapDimensions = level.dimensions;

    const wMultiplier = mapDimensions.sizeX / canvas.width;
    const hMultiplier = mapDimensions.sizeY / canvas.height;

    const objects = level.entities;

    for (const entity of objects) {
      const model = entity.model;
      const modelRect = entity.getModelRect();

      if (!(model instanceof ColorModel)) {
        throw new Error("Invalid model type");
      }

      ctx.fillStyle = model.color;

      ctx.fillRect(
        modelRect.posX / wMultiplier,
        modelRect.posY / hMultiplier,
        modelRect.sizeX / wMultiplier,
        modelRect.sizeY / hMultiplier,
      );
    }
  }
}

export class RPGCanvasVisualizer extends LevelVisualizer<
  CanvasRenderer,
  Rect2D
> {
  private readonly cameraSize: number = 10;

  constructor(renderer: CanvasRenderer) {
    super(renderer);
  }

  getModelLoader(): ModelLoader<ColorModel> {
    return new ColorModelLoader();
  }

  display(level: Level<Rect2D>) {
    this.renderer.clearCanvas();

    const context = this.renderer.context;
    const canvas = this.renderer.canvas;

    const player = level.findPlayer();

    const cameraRect: Rect2D = new Rect2D(
      this.cameraSize,
      this.cameraSize,
      player.rect.posX + player.rect.sizeX / 2 - this.cameraSize / 2,
      player.rect.posY + player.rect.sizeY / 2 - this.cameraSize / 2,
    );

    const objects = level.entities
      .filter((obj) => obj.rect.isOverlaps(cameraRect))
      .sort((el1, el2) => el2.order - el1.order);

    const blockSizeX = canvas.width / this.cameraSize;
    const blockSizeY = canvas.height / this.cameraSize;

    for (const entity of objects) {
      const model = this.getEntityModel(entity);
      const modelRect = entity.getModelRect();

      if (!(model instanceof ColorModel)) {
        throw new Error("Invalid model type");
      }

      context.fillStyle = model.color;

      context.fillRect(
        (modelRect.posX - cameraRect.posX) * blockSizeX,
        (modelRect.posY - cameraRect.posY) * blockSizeY,
        modelRect.sizeX * blockSizeX,
        modelRect.sizeY * blockSizeY,
      );
    }
  }

  private getEntityModel(entity: Entity<Rect2D>): Model {
    if (entity.model instanceof SpriteModel) {
      const sprite = entity.model;

      const currentTimeMillis = Date.now();

      if (sprite.metadata.lastDraw == -1) {
        sprite.metadata.lastDraw = currentTimeMillis;
      } else if (
        currentTimeMillis - sprite.metadata.lastDraw >=
        sprite.updateRate
      ) {
        sprite.nextSprite();
        sprite.metadata.lastDraw = currentTimeMillis;
      }

      return sprite.activeSprite;
    } else {
      return entity.model;
    }
  }
}
