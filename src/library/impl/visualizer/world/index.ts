import { Level } from "@/library/api/level";
import { Rect2D } from "@/library/api/data/rect";
import { AbstractVisualizer, LevelVisualizer } from "@/library/api/visualizer";
import { CanvasRenderer } from "@/library/impl/visualizer/renderer";
import type { Hint } from "@/library/impl/activity/world/model";
import {
  accelerateInterpolator,
  decelerateInterpolator,
  loaderData,
} from "@/library/impl/visualizer/world/loader";
import { SpriteImageModel } from "@/library/impl/models/spriteImageModel";

export abstract class CanvasVisualizer extends AbstractVisualizer<CanvasRenderer> {
  protected constructor(renderer: CanvasRenderer) {
    super(renderer);
  }
}

abstract class LevelLevelVisualizerWithSimpleLoader extends LevelVisualizer<
  CanvasRenderer,
  Rect2D
> {
  private loadingProgress: number = 0;

  public displayLevelLoading(): void {
    this.renderer.clear();

    const canvas = this.renderer.canvas;
    const context = this.renderer.context;

    context.fillStyle = "#181818";
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Draw circle
    this.loadingProgress = (this.loadingProgress + 0.01) % 1;

    context.beginPath();

    const startX = canvas.width / 2;
    const startY = canvas.height / 2;

    const start =
      accelerateInterpolator(this.loadingProgress) * loaderData.speed;
    const end = decelerateInterpolator(this.loadingProgress) * loaderData.speed;

    context.arc(
      startX,
      startY,
      loaderData.radius,
      (start - 0.5) * Math.PI,
      (end - 0.5) * Math.PI,
    );

    context.lineWidth = 3;
    context.strokeStyle = "white";
    context.fill();
    context.stroke();
  }
}

export class FullMapVisualizer extends LevelLevelVisualizerWithSimpleLoader {
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

export class RPGCanvasVisualizer extends LevelLevelVisualizerWithSimpleLoader {
  public isDebugMode: boolean;

  constructor(
    renderer: CanvasRenderer,
    isDebugMode: boolean = false,
    private readonly blockSizePx: number = 64,
  ) {
    super(renderer);
    this.isDebugMode = isDebugMode;
  }

  public display(level: Level<Rect2D>, hints: Array<Hint<Rect2D>>) {
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

    for (const hint of hints) {
      if (!hint.position.isOverlaps(cameraRect)) continue;

      this.renderer.drawModelManually(
        hint.content,
        (hint.position.posX - cameraRect.posX) * this.blockSizePx,
        (hint.position.posY - cameraRect.posY) * this.blockSizePx,
        hint.position.sizeX * this.blockSizePx,
        hint.position.sizeY * this.blockSizePx,
      );
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
