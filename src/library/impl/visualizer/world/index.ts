import { Level } from "@/library/api/level";
import { Rect, Rect2D } from "@/library/api/model/rect";
import { ColorModel } from "@/library/impl/models";
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
    const canvas = this.renderer.canvas;

    this.renderer.clear();

    const mapDimensions = level.dimensions;

    const wMultiplier = mapDimensions.sizeX / canvas.width;
    const hMultiplier = mapDimensions.sizeY / canvas.height;

    const objects = level.entities;

    for (const entity of objects) {
      const model = entity.model;
      const modelRect = entity.getModelRect();

      this.renderer.drawModel(
        model,
        modelRect.posX / wMultiplier,
        modelRect.posY / hMultiplier,
        modelRect.sizeX / wMultiplier,
        modelRect.sizeY / hMultiplier,
      );
    }

    this.renderer.save();
  }
}

export class RPGCanvasVisualizer extends LevelVisualizer<
  CanvasRenderer,
  Rect2D
> {
  private readonly blockSizePx: number = 48;
  private readonly isDebugMode: boolean;

  constructor(renderer: CanvasRenderer, isDebugMode: boolean = false) {
    super(renderer);
    this.isDebugMode = isDebugMode;
  }

  display(level: Level<Rect2D>) {
    this.renderer.clear();

    const cameraRect: Rect2D = this.calculateCameraRect(level);

    const objects = level.entities
      .filter((obj) => obj.rect.isOverlaps(cameraRect))
      .sort((el1, el2) => el2.order - el1.order);

    for (const entity of objects) {
      const model = entity.model;
      const modelRect = entity.getModelRect();

      this.renderer.drawModel(
        model,
        (modelRect.posX - cameraRect.posX) * this.blockSizePx,
        (modelRect.posY - cameraRect.posY) * this.blockSizePx,
        modelRect.sizeX * this.blockSizePx,
        modelRect.sizeY * this.blockSizePx,
      );

      if (this.isDebugMode) {
        const collisionRect = entity.getCollisionRect();

        this.renderer.context.fillStyle = "rgba(255, 255, 0, 0.3)";
        this.renderer.context.fillRect(
          (collisionRect.posX - cameraRect.posX) * this.blockSizePx,
          (collisionRect.posY - cameraRect.posY) * this.blockSizePx,
          collisionRect.sizeX * this.blockSizePx,
          collisionRect.sizeY * this.blockSizePx,
        );

        this.renderer.context.fillStyle = "rgba(255, 0, 0, 0.3)";
        this.renderer.context.fillRect(
          (entity.rect.posX - cameraRect.posX) * this.blockSizePx,
          (entity.rect.posY - cameraRect.posY) * this.blockSizePx,
          entity.rect.sizeX * this.blockSizePx,
          entity.rect.sizeY * this.blockSizePx,
        );
      }
    }

    this.renderer.save();
  }

  private calculateCameraRect(level: Level<Rect2D>): Rect2D {
    const canvas = this.renderer.canvas;

    const player = level.findPlayer();

    const viewport = {
      w: canvas.width / this.blockSizePx,
      h: canvas.height / this.blockSizePx,
    };

    return new Rect2D(
      viewport.w,
      viewport.h,
      Math.max(
        Math.min(
          player.rect.posX + player.rect.sizeX / 2 - viewport.w / 2,
          level.dimensions.sizeX - viewport.w,
        ),
        0,
      ),
      Math.max(
        Math.min(
          player.rect.posY + player.rect.sizeY / 2 - viewport.h / 2,
          level.dimensions.sizeY - viewport.h,
        ),
        0,
      ),
    );
  }
}
