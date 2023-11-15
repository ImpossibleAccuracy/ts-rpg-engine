import { Level } from "@/library/api/level";
import { Rect2D } from "@/library/api/data/rect";
import { AbstractVisualizer, LevelVisualizer } from "@/library/api/visualizer";
import { CanvasRenderer } from "@/library/impl/visualizer/renderer";

export abstract class CanvasVisualizer extends AbstractVisualizer<CanvasRenderer> {
  protected constructor(renderer: CanvasRenderer) {
    super(renderer);
  }
}

export class FullMapVisualizer extends LevelVisualizer<CanvasRenderer, Rect2D> {
  public isDebugMode: boolean;

  constructor(renderer: CanvasRenderer, isDebugMode: boolean = false) {
    super(renderer);
    this.isDebugMode = isDebugMode;
  }

  public display(level: Level<Rect2D>): void {
    this.renderer.clear();

    const objects = level.entities.sort((el1, el2) => el2.order - el1.order);

    const mx = this.renderer.canvas.width / level.dimensions.sizeX;
    const my = this.renderer.canvas.height / level.dimensions.sizeY;

    for (const entity of objects) {
      for (const model of entity.models) {
        this.renderer.drawModel(model, entity.rect, level.dimensions, mx, my);
      }

      if (this.isDebugMode) {
        const collisionRect = entity.getCollisionRect();

        this.renderer.context.fillStyle = "rgba(255, 255, 0, 0.3)";
        this.renderer.context.fillRect(
          collisionRect.posX * mx,
          collisionRect.posY * my,
          collisionRect.sizeX * mx,
          collisionRect.sizeY * my,
        );

        this.renderer.context.strokeStyle = "rgb(0, 0, 0)";
        this.renderer.context.strokeRect(
          collisionRect.posX * mx,
          collisionRect.posY * my,
          collisionRect.sizeX * mx,
          collisionRect.sizeY * my,
        );

        this.renderer.context.fillStyle = "rgba(255, 0, 0, 0.3)";
        this.renderer.context.fillRect(
          entity.rect.posX * mx,
          entity.rect.posY * my,
          entity.rect.sizeX * mx,
          entity.rect.sizeY * my,
        );

        this.renderer.context.strokeStyle = "rgb(255, 255, 255)";
        this.renderer.context.strokeRect(
          entity.rect.posX * mx,
          entity.rect.posY * my,
          entity.rect.sizeX * mx,
          entity.rect.sizeY * my,
        );

        this.renderer.context.strokeStyle = "none";
      }
    }

    this.renderer.save();
  }
}

export class RPGCanvasVisualizer extends LevelVisualizer<
  CanvasRenderer,
  Rect2D
> {
  public isDebugMode: boolean;

  constructor(
    renderer: CanvasRenderer,
    isDebugMode: boolean = false,
    private readonly blockSizePx: number = 64,
  ) {
    super(renderer);
    this.isDebugMode = isDebugMode;
  }

  public display(level: Level<Rect2D>) {
    this.renderer.clear();

    const cameraRect: Rect2D = this.calculateCameraRect(level);

    const objects = level.entities
      .filter((obj) => obj.rect.isOverlaps(cameraRect))
      .sort((el1, el2) => el2.order - el1.order);

    for (const entity of objects) {
      for (const model of entity.models) {
        this.renderer.drawModel(
          model,
          entity.rect,
          cameraRect,
          this.blockSizePx,
          this.blockSizePx,
        );
      }

      if (this.isDebugMode) {
        const collisionRect = entity.getCollisionRect();

        this.renderer.context.fillStyle = "rgba(255, 255, 0, 0.3)";
        this.renderer.context.fillRect(
          (collisionRect.posX - cameraRect.posX) * this.blockSizePx,
          (collisionRect.posY - cameraRect.posY) * this.blockSizePx,
          collisionRect.sizeX * this.blockSizePx,
          collisionRect.sizeY * this.blockSizePx,
        );

        this.renderer.context.strokeStyle = "rgb(0, 0, 0)";
        this.renderer.context.strokeRect(
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

        this.renderer.context.strokeStyle = "rgb(255, 255, 255)";
        this.renderer.context.strokeRect(
          (entity.rect.posX - cameraRect.posX) * this.blockSizePx,
          (entity.rect.posY - cameraRect.posY) * this.blockSizePx,
          entity.rect.sizeX * this.blockSizePx,
          entity.rect.sizeY * this.blockSizePx,
        );

        this.renderer.context.strokeStyle = "none";
      }
    }

    this.renderer.save();
  }

  private calculateCameraRect(level: Level<Rect2D>): Rect2D {
    const canvas = this.renderer.canvas;

    const player = level.findEntityByType("player");

    const playerRect = player?.rect ?? new Rect2D(0, 0, 0, 0);

    const viewport = {
      w: canvas.width / this.blockSizePx,
      h: canvas.height / this.blockSizePx,
    };

    return new Rect2D(
      viewport.w,
      viewport.h,
      Math.max(
        Math.min(
          playerRect.posX + playerRect.sizeX / 2 - viewport.w / 2,
          level.dimensions.sizeX - viewport.w,
        ),
        0,
      ),
      Math.max(
        Math.min(
          playerRect.posY + playerRect.sizeY / 2 - viewport.h / 2,
          level.dimensions.sizeY - viewport.h,
        ),
        0,
      ),
    );
  }
}
