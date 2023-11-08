import { GameWorldActivity } from "@/library/impl/activity/world";
import { CanvasRenderer } from "@/library/impl/visualizer/renderer";
import { Rect2D } from "@/library/api/model/rect";
import { DefaultEntityFactory } from "@/library/impl/entity/factory";
import { ColorModelLoader, ImageModelLoader } from "@/library/impl/models";
import { CarLevel } from "@/examples/cargame/level";
import { SuperPuperMegaTripleXXXVisualizer } from "@/examples/cargame/visualizer";
import type { Entity } from "@/library/api/model/entity";
import { randomInteger } from "@/library/api/utils/random";
import { ObstacleController } from "@/examples/cargame/entity/obstacle";
import { DialogActivity } from "@/library/impl/activity/dialog";

export class CarWorldActivity extends GameWorldActivity<
  CanvasRenderer,
  Rect2D
> {
  public readonly spawnDelay: number = 1050;
  public activeAcceleration: number = 50;
  public readonly acceleration = 10;

  private lastSpawn: number = -1;
  private isPaused: boolean = false;

  constructor(assetsUrl: string, renderer: CanvasRenderer) {
    const entityFactory = new DefaultEntityFactory<Rect2D>();

    const levelBuilder = new CarLevel();

    const fallbackModelLoader = new ColorModelLoader();
    const modelLoader = new ImageModelLoader(
      assetsUrl + "image/",
      fallbackModelLoader,
    );

    const visualizer = new SuperPuperMegaTripleXXXVisualizer(renderer);

    super(visualizer, levelBuilder, entityFactory, modelLoader);
  }

  public die() {
    this.isPaused = true;

    const dialog = this.createActivity(DialogActivity, {
      title: "Вы проиграли",
      closable: false,
      gravity: "top",
    });

    this.startActivity(dialog);
  }

  public update() {
    if (this.isPaused) return;

    super.update();

    if (this.lastSpawn == -1) {
      this.lastSpawn = Date.now();
      return;
    }

    const currentTimeMillis = Date.now();
    if (
      this.lastSpawn + this.spawnDelay - this.activeAcceleration <=
      currentTimeMillis
    ) {
      this.createObstacle().then((obstacle) => {
        this.level.attachEntity(obstacle);
      });

      this.activeAcceleration += this.acceleration;
      this.lastSpawn = currentTimeMillis;
    }
  }

  private async createObstacle(): Promise<Entity<Rect2D>> {
    const isTop = randomInteger(0, 1);

    const model = isTop
      ? await this.modelLoader.load("obstacle2.png")
      : await this.modelLoader.load("obstacle.png");

    const baseWidth = CarLevel.roadSize - CarLevel.wallSize * 2 - 1;

    const startX = (isTop ? 1 : 0) + randomInteger(0, baseWidth / 2 - 1) * 2;

    const rect = new Rect2D(
      CarLevel.carSizeX,
      CarLevel.carSizeY,
      CarLevel.wallSize + startX,
      isTop ? this.getHeight() + CarLevel.carSizeY : -CarLevel.carSizeY,
    );

    return this.entityFactory.buildEntity(
      "obstacle",
      new ObstacleController(isTop ? "top" : "bottom"),
      model,
      false,
      500,
      rect,
      null,
      null,
    );
  }

  private getHeight(): number {
    return (
      this.visualizer.renderer.canvas.height /
      SuperPuperMegaTripleXXXVisualizer.blockSizePx
    );
  }
}
