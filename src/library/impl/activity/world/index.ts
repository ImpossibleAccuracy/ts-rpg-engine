import { CanvasRenderer } from "@/library/impl/visualizer/renderer";
import { Rect } from "@/library/api/data/rect";
import { LevelVisualizer } from "@/library/api/visualizer";
import { AbstractActivity } from "@/library/api/activity";
import type { Level, LevelBuilder } from "@/library/api/level";
import {
  DynamicEntity,
  Entity,
  type EntityFactory,
} from "@/library/api/data/entity";
import type { Nullable } from "@/library/api/data/common";
import type { GameEngine } from "@/library/api/engine";

import { ModelLoader } from "@/library/impl/models/loaders";

export abstract class GameWorldActivity<
  D extends CanvasRenderer,
  R extends Rect = Rect,
  V extends LevelVisualizer<D, R> = LevelVisualizer<D, R>,
> extends AbstractActivity<D, V> {
  public readonly modelLoader: ModelLoader;
  public readonly levelBuilder: LevelBuilder<R>;
  public readonly entityFactory: EntityFactory<R>;

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
    this._level = null;
  }

  private _level: Nullable<Level<R>>;

  get level(): Level<R> {
    return this._level!;
  }

  async load() {
    this._level = await this.levelBuilder.build(
      this.entityFactory,
      this.modelLoader,
    );

    await this.onLevelLoaded(this._level);
  }

  public async onLevelLoaded(level: Level<R>) {
    const bounds = await this.generateWorldBounds(level);
    const content = await this.generateWorldContent(level);
    level.attachAllEntities(bounds);
    level.attachAllEntities(content);

    console.info("World info:");
    console.info(this._level);
  }

  public async generateWorldContent(
    level: Level<R>,
  ): Promise<Array<Entity<R>>> {
    return [];
  }

  public async generateWorldBounds(level: Level<R>): Promise<Array<Entity<R>>> {
    return [];
  }

  public onAttach(gameEngine: GameEngine<D>) {
    super.onAttach(gameEngine);
  }

  public draw(): void {
    if (!this._level) return;

    this.visualizer.display(this._level);
  }

  public update(): void {
    if (!this._level) return;

    const game = this.requireGameEngine();

    const entities = this._level.entities.sort(
      (el, el2) => el.order - el2.order,
    );

    for (const entity of entities) {
      if (entity instanceof DynamicEntity) {
        if (!entity.controller.isAttached) {
          entity.controller.attachToActivity(this);
        }

        entity.controller.onUpdate(entity, this._level, game.controller);
      }
    }
  }
}
