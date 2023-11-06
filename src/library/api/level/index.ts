import type {
  DynamicEntity,
  Entity,
  EntityControllerFactory,
} from "@/library/api/model/entity";
import { Rect } from "@/library/api/model/rect";
import type { Nullable } from "@/library/api/model/common";
import type { ModelLoader } from "@/library/api/visualizer/model";
import { Model } from "@/library/api/visualizer/model";

export class Level<R extends Rect> {
  public readonly dimensions: R;
  private _entities: Array<Entity<R>>;

  constructor(entities: Array<Entity<R>>, dimensions: R) {
    this._entities = entities;
    this.dimensions = dimensions;
  }

  public get entities(): Array<Entity<R>> {
    return [...this._entities];
  }

  public attachEntity(entity: Entity<R>) {
    this._entities.push(entity);
  }

  public removeEntity(entity: Entity<R>) {
    this._entities = this._entities.filter((el) => el !== entity);
  }

  public findAllEntitiesByType(type: string): Array<Entity<R>> {
    return this._entities.filter((el) => el.type == type);
  }

  public findEntityByType(type: string): Nullable<Entity<R>> {
    for (const entity of this._entities) {
      if (entity.type == type) {
        return entity;
      }
    }

    return null;
  }

  public findPlayer(): DynamicEntity<R> {
    return this.findEntityByType("player")! as DynamicEntity<R>;
  }
}

export abstract class LevelBuilder<R extends Rect, C extends Model> {
  abstract build(modelLoader: ModelLoader<C>): Promise<Level<R>>;
}

export abstract class AssetsLevelBuilder<
  R extends Rect,
  M extends Model,
  LevelJson,
> extends LevelBuilder<R, M> {
  public readonly path: string;
  public readonly controllers: Map<string, EntityControllerFactory<R>>;

  protected constructor(
    path: string,
    controllers: Map<string, EntityControllerFactory<R>>,
  ) {
    super();
    this.path = path;
    this.controllers = controllers;
  }

  async build(modelLoader: ModelLoader<M>): Promise<Level<R>> {
    const response = await fetch(this.path);

    if (!response.ok) {
      throw new Error("Cannot load level from path: " + this.path);
    }

    const json = (await response.json()) as LevelJson;

    const entities = this.parseObjects(json, modelLoader);

    const mapSize = this.calculateLevelDimensions(entities);

    return new Level(entities, mapSize);
  }

  public abstract parseObjects(
    json: LevelJson,
    modelLoader: ModelLoader<M>,
  ): Array<Entity<R>>;

  public abstract calculateLevelDimensions(objects: Array<Entity<R>>): R;
}
