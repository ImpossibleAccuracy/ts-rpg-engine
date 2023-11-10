import type {
  DynamicEntity,
  Entity,
  EntityControllerFactory, EntityFactory
} from "@/library/api/model/entity";
import { Rect } from "@/library/api/model/rect";
import type { Nullable } from "@/library/api/model/common";
import type { ModelLoader } from "@/library/api/visualizer/model";

export class Level<R extends Rect> {
  public readonly dimensions: R;

  constructor(entities: Array<Entity<R>>, dimensions: R) {
    this._entities = entities;
    this.dimensions = dimensions;
  }

  private _entities: Array<Entity<R>>;

  public get entities(): Array<Entity<R>> {
    return [...this._entities];
  }

  public attachEntity(entity: Entity<R>) {
    this._entities.push(entity);
  }

  public attachAllEntities(entities: Array<Entity<R>>) {
    this._entities.push(...entities);
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

export abstract class LevelBuilder<R extends Rect> {
  abstract build(
    entityFactory: EntityFactory<R>,
    modelLoader: ModelLoader,
  ): Promise<Level<R>>;
}

export abstract class AssetsLevelBuilder<
  R extends Rect,
  LevelJson,
> extends LevelBuilder<R> {
  public readonly mapUrl: string;
  public readonly controllers: Map<string, EntityControllerFactory<R>>;

  protected constructor(
    path: string,
    controllers: Map<string, EntityControllerFactory<R>>,
  ) {
    super();
    this.mapUrl = path;
    this.controllers = controllers;
  }

  async build(
    entityFactory: EntityFactory<R>,
    modelLoader: ModelLoader,
  ): Promise<Level<R>> {
    const response = await fetch(this.mapUrl);

    if (!response.ok) {
      throw new Error("Cannot load level from path: " + this.mapUrl);
    }

    const json = (await response.json()) as LevelJson;

    const entities = await this.parseObjects(json, entityFactory, modelLoader);

    const mapSize = this.calculateLevelDimensions(json, entities);

    return new Level(entities, mapSize);
  }

  public abstract parseObjects(
    json: LevelJson,
    entityFactory: EntityFactory<R>,
    modelLoader: ModelLoader,
  ): Promise<Array<Entity<R>>>;

  public abstract calculateLevelDimensions(
    json: LevelJson,
    objects: Array<Entity<R>>,
  ): R;
}
