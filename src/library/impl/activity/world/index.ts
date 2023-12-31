import { CanvasRenderer } from "@/library/impl/visualizer/renderer";
import { Rect } from "@/library/api/data/rect";
import { LevelVisualizer } from "@/library/api/visualizer";
import { AbstractActivity } from "@/library/api/activity";
import type { Level, LevelBuilder } from "@/library/api/level";
import {
  DynamicEntity,
  Entity,
  type EntityFactory,
  RequireError,
} from "@/library/api/data/entity";
import type { Nullable } from "@/library/api/data/common";

import { ModelLoader } from "@/library/impl/models/loaders";
import type { Hint } from "@/library/impl/activity/world/model";
import type { Model } from "@/library/api/models";

export abstract class GameWorldActivity<
  D extends CanvasRenderer,
  R extends Rect = Rect,
  V extends LevelVisualizer<D, R> = LevelVisualizer<D, R>,
> extends AbstractActivity<D, V> {
  public readonly modelLoader: ModelLoader;
  public readonly levelBuilder: LevelBuilder<R>;
  public readonly entityFactory: EntityFactory<R>;

  public hints: Array<Hint<R>> = new Array<Hint<R>>();

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

  public get level(): Level<R> {
    return this._level!;
  }

  public get isLevelLoaded(): boolean {
    return this._level !== null;
  }

  public createHint(position: R, content: Model, timeToLive: number) {
    this.hints.push({
      position: position,
      content: content,
      timeToLive: timeToLive,
      createdAt: Date.now(),
    });
  }

  async loadLevel(name: string) {
    if (this._level) {
      this.detachAllEntities();
    }

    this._level = null;

    this._level = await this.levelBuilder.build(
      name,
      this.entityFactory,
      this.modelLoader,
    );

    await this.onLevelLoaded(name, this._level);
  }

  public async onLevelLoaded(name: string, level: Level<R>) {
    const bounds = await this.generateWorldBounds(level);
    const content = await this.generateWorldContent(level);
    level.attachAllEntities(bounds);
    level.attachAllEntities(content);

    console.info(`Level (${name}) info:`);
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

  public draw(): void {
    if (this._level) {
      this.visualizer.display(this._level, this.hints);
    } else {
      this.visualizer.displayLevelLoading();
    }
  }

  public update(): void {
    if (!this._level) return;

    const level = this._level;

    const game = this.requireGameEngine();

    const entities = this._level.entities;

    for (const entity of entities) {
      if (entity instanceof DynamicEntity) {
        if (!entity.controller.isAttached) {
          entity.controller.onAttachToActivity(this);
        }

        if (this._level === level) {
          try {
            entity.controller.update(entity, this._level, game.controller);
          } catch (e) {
            // FIXME
            if (e instanceof RequireError && !entity.controller.isAttached) {
              console.warn("Missing frame");
            } else {
              console.error(e);
            }
          }
        } else {
          break;
        }
      }
    }

    for (const hint of this.hints) {
      if (hint.createdAt + hint.timeToLive <= Date.now()) {
        this.hints = this.hints.filter((el) => el !== hint);
      }
    }
  }

  public finish() {
    if (this._level) {
      this.detachAllEntities();
    }

    super.finish();
  }

  protected detachAllEntities() {
    const level = this._level;
    const entities = level!.entities;

    for (const entity of entities) {
      if (entity instanceof DynamicEntity) {
        if (entity.controller.isAttached) {
          entity.controller.onDetachFromActivity();
        }
      }
    }
  }
}
