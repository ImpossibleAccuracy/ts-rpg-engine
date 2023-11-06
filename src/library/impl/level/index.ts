import { Rect2D } from "@/library/api/model/rect";
import { Model, ModelLoader } from "@/library/api/visualizer/model";
import { AssetsLevelBuilder } from "@/library/api/level";
import type {
  ControllerJson,
  ControllerType,
  EntityJson,
  LevelJson,
  ModelType,
} from "@/library/impl/level/data";
import {
  instanceOfEntity,
  instanceOfEntityCollection,
  instanceOfModel,
  instanceOfSpriteModel,
} from "@/library/impl/level/data";
import {
  DynamicEntity,
  Entity,
  EntityController,
  type EntityControllerFactory,
  StaticEntity,
} from "@/library/api/model/entity";
import type { Nullable } from "@/library/api/model/common";

export class AssetsLevelBuilder2D<C extends Model> extends AssetsLevelBuilder<
  Rect2D,
  C,
  LevelJson
> {
  constructor(
    path: string,
    controllers: Map<string, EntityControllerFactory<Rect2D>>,
  ) {
    super(path, controllers);
  }

  calculateLevelDimensions(objects: Array<Entity<Rect2D>>): Rect2D {
    let minLeft = 0;
    let minTop = 0;
    let maxLeft = 0;
    let maxTop = 0;

    for (const object of objects) {
      const dimensions = object.getModelRect();

      if (dimensions.posX < minLeft) {
        minLeft = dimensions.posX;
      }

      if (dimensions.posY < minTop) {
        minTop = dimensions.posY;
      }

      if (dimensions.posX + dimensions.sizeX > maxLeft) {
        maxLeft = dimensions.posX + dimensions.sizeX;
      }

      if (dimensions.posY + dimensions.sizeY > maxTop) {
        maxTop = dimensions.posX + dimensions.sizeY;
      }
    }

    return new Rect2D(maxLeft - minLeft, maxTop - minTop);
  }

  parseObjects(
    json: LevelJson,
    modelLoader: ModelLoader<C>,
  ): Array<Entity<Rect2D>> {
    const result = new Array<Entity<Rect2D>>();

    for (const obj of Object.entries(json.objects)) {
      const key = obj[0];
      const value = obj[1];

      if (instanceOfEntity(value)) {
        if (!value.model) {
          throw new Error("Entity model is not specified");
        }

        const item = this.parseEntity(
          value,
          value.model,
          modelLoader,
          key,
          value.order,
        );

        result.push(item);
      } else if (instanceOfEntityCollection(value)) {
        for (const valueElement of value.items) {
          const item = this.parseEntity(
            valueElement,
            value.model,
            modelLoader,
            key,
            value.order,
          );

          result.push(item);
        }
      }
    }

    return result;
  }

  private parseEntity(
    entityJson: EntityJson,
    modelJson: ModelType,
    modelLoader: ModelLoader<C>,
    type: string,
    fallbackOrder: number,
  ): Entity<Rect2D> {
    const rect = new Rect2D(
      entityJson.size.w,
      entityJson.size.h,
      entityJson.position.x,
      entityJson.position.y,
    );

    const model = this.loadModel(entityJson.model ?? modelJson, modelLoader);

    const modelRect = this.parseModelRect(modelJson);

    if (entityJson.controller) {
      const controller = this.parseController(entityJson.controller);

      return new DynamicEntity(
        type,
        model,
        entityJson.is_material ?? true,
        entityJson.order ?? fallbackOrder,
        rect,
        modelRect,
        controller,
      );
    } else {
      return new StaticEntity(
        type,
        model,
        entityJson.is_material ?? true,
        entityJson.order ?? fallbackOrder,
        rect,
        modelRect,
      );
    }
  }

  private parseModelRect(modelJson: ModelType): Nullable<Rect2D> {
    return modelJson.model_dimensions
      ? new Rect2D(modelJson.model_dimensions.w, modelJson.model_dimensions.h)
      : null;
  }

  private loadModel(modelJson: ModelType, modelLoader: ModelLoader<C>) {
    if (instanceOfModel(modelJson)) {
      return modelLoader.load(modelJson.name!);
    } else if (instanceOfSpriteModel(modelJson)) {
      return modelLoader.loadSprite(modelJson.items!, modelJson.update_rate);
    } else {
      throw new Error("Invalid model value");
    }
  }

  private parseController(
    controller: ControllerType,
  ): EntityController<Rect2D> {
    if (controller instanceof String) {
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
