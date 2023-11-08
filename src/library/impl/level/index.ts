import { CompositeRect2D, Rect2D } from "@/library/api/model/rect";
import { Model, ModelLoader } from "@/library/api/visualizer/model";
import { AssetsLevelBuilder, type EntityFactory } from "@/library/api/level";
import type {
  CollisionType,
  ControllerJson,
  ControllerType,
  CoordinatesJson,
  DimensionsJson,
  LevelJson,
  ModelType,
  RectJson,
} from "@/library/impl/level/data";
import {
  instanceOfArraySpriteModel,
  instanceOfEntity,
  instanceOfEntityCollection,
  instanceOfModel,
  instanceOfSpriteModel,
} from "@/library/impl/level/data";
import {
  Entity,
  EntityController,
  type EntityControllerFactory,
} from "@/library/api/model/entity";
import type { Nullable } from "@/library/api/model/common";

export class AssetsLevelBuilder2D extends AssetsLevelBuilder<
  Rect2D,
  LevelJson
> {
  constructor(
    path: string,
    controllers: Map<string, EntityControllerFactory<Rect2D>>,
  ) {
    super(path, controllers);
  }

  calculateLevelDimensions(json: LevelJson): Rect2D {
    return new Rect2D(json.size.w, json.size.h);
  }

  public async parseObjects(
    json: LevelJson,
    entityFactory: EntityFactory<Rect2D>,
    modelLoader: ModelLoader,
  ): Promise<Array<Entity<Rect2D>>> {
    const result = new Array<Entity<Rect2D>>();

    for (const obj of Object.entries(json.objects)) {
      const key = obj[0];
      const value = obj[1];

      if (instanceOfEntity(value)) {
        if (!value.model) {
          throw new Error("Entity model must be specified");
        }

        const item = await this.buildEntity(
          key,
          value.controller ?? null,
          value.order,
          value.size,
          value.position,
          value.model,
          value.is_material ?? true,
          value.collision ?? null,
          entityFactory,
          modelLoader,
        );

        result.push(item);
      } else if (instanceOfEntityCollection(value)) {
        for (const valueElement of value.items) {
          const data = Object.assign({}, valueElement, value);

          const item = await this.buildEntity(
            key,
            data.controller ?? null,
            data.order,
            data.size,
            data.position,
            data.model,
            data.is_material ?? true,
            data.collision ?? null,
            entityFactory,
            modelLoader,
          );

          result.push(item);
        }
      }
    }

    return result;
  }

  private async buildEntity(
    type: string,
    controllerInfo: Nullable<ControllerType>,
    order: number,
    size: DimensionsJson,
    position: CoordinatesJson,
    modelInfo: ModelType,
    isMaterial: boolean,
    collisionInfo: Nullable<CollisionType>,
    entityFactory: EntityFactory<Rect2D>,
    modelLoader: ModelLoader,
  ): Promise<Entity<Rect2D>> {
    const rect = new Rect2D(size.w, size.h, position.x, position.y);

    const model = await this.loadModel(modelInfo, modelLoader);

    const modelRect = modelInfo.model_dimensions
      ? this.parseRect(modelInfo.model_dimensions)
      : null;

    const collision = collisionInfo ? this.parseCollision(collisionInfo) : null;

    const controller = controllerInfo
      ? this.parseController(controllerInfo)
      : null;

    return entityFactory.buildEntity(
      type,
      controller,
      model,
      isMaterial,
      order,
      rect,
      modelRect,
      collision,
    );
  }

  private parseRect(rectJson: RectJson): Rect2D {
    return new Rect2D(rectJson.w, rectJson.h, rectJson.x, rectJson.y);
  }

  private parseCollision(collision: CollisionType): Rect2D {
    if (collision instanceof Array) {
      const items = new Array<Rect2D>();

      for (const item of collision) {
        const collisionItem = this.parseCollision(item);
        items.push(collisionItem);
      }

      return new CompositeRect2D(items);
    } else {
      return this.parseRect(collision as RectJson);
    }
  }

  private loadModel(
    modelJson: ModelType,
    modelLoader: ModelLoader,
  ): Promise<Model> {
    if (instanceOfModel(modelJson)) {
      return modelLoader.load(modelJson.name, modelJson.metadata);
    } else if (instanceOfSpriteModel(modelJson)) {
      return modelLoader.loadSprite(
        modelJson.name,
        modelJson.props,
        modelJson.metadata,
      );
    } else if (instanceOfArraySpriteModel(modelJson)) {
      return modelLoader.loadSpriteFromArray(
        modelJson.items,
        modelJson.props,
        modelJson.metadata,
      );
    } else {
      throw new Error("Invalid data value");
    }
  }

  private parseController(
    controller: ControllerType,
  ): EntityController<Rect2D> {
    if (typeof controller === "string") {
      return this.createController(controller as string);
    } else {
      const data = controller as ControllerJson;

      return this.createController(data.name, data.meta);
    }
  }

  private createController(
    controllerName: string,
    controllerParams?: unknown,
  ): EntityController<Rect2D> {
    const controllerCreator = this.controllers.get(controllerName);

    if (!controllerCreator) {
      throw new Error(`Entity controller "${controllerName}" not found`);
    }

    return controllerCreator(controllerParams);
  }
}
