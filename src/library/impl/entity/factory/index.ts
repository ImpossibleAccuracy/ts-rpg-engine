import type { Rect } from "@/library/api/model/rect";
import type { Nullable } from "@/library/api/model/common";
import type {
  Entity,
  EntityController,
  EntityFactory,
} from "@/library/api/model/entity";
import { DynamicEntity, StaticEntity } from "@/library/api/model/entity";
import { Model } from "@/library/api/visualizer/model";

export class DefaultEntityFactory<R extends Rect> implements EntityFactory<R> {
  buildEntity(
    type: string,
    model: Array<Model> | Model,
    isMaterial: boolean,
    order: number,
    rect: R,
    collision: Nullable<R> = null,
    controller: Nullable<EntityController<R>> = null,
  ): Entity<R> {
    const modelArray = model instanceof Array ? model : [model];

    if (controller) {
      return new DynamicEntity(
        type,
        controller,
        modelArray,
        isMaterial,
        order,
        rect,
        collision,
      );
    } else {
      return new StaticEntity(
        type,
        modelArray,
        isMaterial,
        order,
        rect,
        collision,
      );
    }
  }
}
