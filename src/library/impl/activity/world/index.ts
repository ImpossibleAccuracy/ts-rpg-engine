import { CanvasRenderer } from "@/library/impl/visualizer/renderer";
import { Rect } from "@/library/api/model/rect";
import { Model, ModelLoader } from "@/library/api/visualizer/model";
import { LevelVisualizer } from "@/library/api/visualizer";
import { AbstractActivity } from "@/library/api/activity";
import { Level, LevelBuilder } from "@/library/api/level";
import { DynamicEntity } from "@/library/api/model/entity";
import type { Nullable } from "@/library/api/model/common";

export class GameWorldActivity<
  D extends CanvasRenderer,
  R extends Rect = Rect,
  C extends Model = Model,
  V extends LevelVisualizer<D, R> = LevelVisualizer<D, R>,
> extends AbstractActivity<D, V> {
  public level: Nullable<Level<R>>;
  private readonly levelBuilder: LevelBuilder<R, C>;
  private readonly modelLoader: ModelLoader<C>;

  constructor(
    visualizer: V,
    modelLoader: ModelLoader<C>,
    levelBuilder: LevelBuilder<R, C>,
  ) {
    super(visualizer);

    this.level = null;
    this.modelLoader = modelLoader;
    this.levelBuilder = levelBuilder;
  }

  async load() {
    this.level = await this.levelBuilder.build(this.modelLoader);

    this.level.entities.forEach((entity) => {
      if (entity instanceof DynamicEntity) {
        entity.controller.attachToActivity(this);
      }
    });
  }

  draw(): void {
    if (!this.level) return;

    this.visualizer.display(this.level);
  }

  update(): void {
    if (!this.level) return;

    const game = this.requireGameEngine();

    for (const entity of this.level.entities) {
      if (entity instanceof DynamicEntity) {
        entity.controller.onUpdate(entity, this.level, game.controller);
      }
    }
  }
}
