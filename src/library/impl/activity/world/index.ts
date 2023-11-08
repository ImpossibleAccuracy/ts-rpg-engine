import { CanvasRenderer } from "@/library/impl/visualizer/renderer";
import { Rect } from "@/library/api/model/rect";
import { ModelLoader } from "@/library/api/visualizer/model";
import { LevelVisualizer } from "@/library/api/visualizer";
import { AbstractActivity } from "@/library/api/activity";
import type { EntityFactory, Level, LevelBuilder } from "@/library/api/level";
import { DynamicEntity, Entity } from "@/library/api/model/entity";
import type { Nullable } from "@/library/api/model/common";
import type { GameEngine } from "@/library/api/engine";

export abstract class GameWorldActivity<
  D extends CanvasRenderer,
  R extends Rect = Rect,
  V extends LevelVisualizer<D, R> = LevelVisualizer<D, R>,
> extends AbstractActivity<D, V> {
  public readonly modelLoader: ModelLoader;
  private readonly levelBuilder: LevelBuilder<R>;
  private readonly entityFactory: EntityFactory<R>;
  private level: Nullable<Level<R>>;

  protected constructor(
    visualizer: V,
    levelBuilder: LevelBuilder<R>,
    entityFactory: EntityFactory<R>,
    modelLoader: ModelLoader,
  ) {
    super(visualizer);
    this.levelBuilder = levelBuilder;
    this.entityFactory = entityFactory;
    this.modelLoader = modelLoader;
    this.level = null;
  }

  async load() {
    this.level = await this.levelBuilder.build(
      this.entityFactory,
      this.modelLoader,
    );

    await this.onLevelLoaded(this.level);
  }

  public async onLevelLoaded(level: Level<R>) {
    const bounds = await this.generateWorldBounds(level);
    const payload = await this.generateWorldContent(level);
    level.attachAllEntities(bounds);
    level.attachAllEntities(payload);

    console.info("World info:");
    console.info(this.level);

    level.entities.forEach((entity) => {
      if (entity instanceof DynamicEntity) {
        entity.controller.attachToActivity(this);
      }
    });
  }

  abstract generateWorldContent(level: Level<R>): Promise<Array<Entity<R>>>;

  abstract generateWorldBounds(level: Level<R>): Promise<Array<Entity<R>>>;

  public onAttach(gameEngine: GameEngine<D>) {
    super.onAttach(gameEngine);
  }

  public draw(): void {
    if (!this.level) return;

    this.visualizer.display(this.level);
  }

  public update(): void {
    if (!this.level) return;

    const game = this.requireGameEngine();

    const entities = this.level.entities.sort(
      (el, el2) => el.order - el2.order,
    );

    for (const entity of entities) {
      if (entity instanceof DynamicEntity) {
        entity.controller.onUpdate(entity, this.level, game.controller);
      }
    }
  }
}
