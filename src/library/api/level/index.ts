import type {
  DynamicEntity,
  Entity,
  EntityControllerFactory,
  EntityFactory,
} from "@/library/api/data/entity";
import { Rect } from "@/library/api/data/rect";
import type { Nullable } from "@/library/api/data/common";

import { ModelLoader } from "@/library/impl/models/loaders";

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
    level: string,
    entityFactory: EntityFactory<R>,
    modelLoader: ModelLoader,
  ): Promise<Level<R>>;
}

export abstract class AssetsLevelBuilder<
  R extends Rect,
  LevelJson,
> extends LevelBuilder<R> {
  protected constructor(
    public readonly baseLevelPath: string,
    public readonly controllers: Map<string, EntityControllerFactory<R>>,
  ) {
    super();
  }

  async build(
    mapName: string,
    entityFactory: EntityFactory<R>,
    modelLoader: ModelLoader,
  ): Promise<Level<R>> {
    const mapUrl = this.baseLevelPath + mapName;

    const response = await fetch(mapUrl);

    if (!response.ok) {
      throw new Error("Cannot load level from path: " + mapUrl);
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
