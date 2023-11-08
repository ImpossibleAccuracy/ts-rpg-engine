import type { Rect } from "@/library/api/model/rect";
import type { EntityFactory } from "@/library/api/level";
import type { Model } from "@/library/api/visualizer/model";
import type { Nullable } from "@/library/api/model/common";
import type { Entity, EntityController } from "@/library/api/model/entity";
import { DynamicEntity, StaticEntity } from "@/library/api/model/entity";

export class DefaultEntityFactory<R extends Rect> implements EntityFactory<R> {
  buildEntity(
    type: string,
    controller: Nullable<EntityController<R>>,
    model: Model,
    isMaterial: boolean,
    order: number,
    rect: R,
    modelRect: Nullable<R>,
    collision: Nullable<R>,
  ): Entity<R> {
    if (controller) {
      return new DynamicEntity(
        type,
        controller,
        model,
        isMaterial,
        order,
        rect,
        modelRect,
        collision,
      );
    } else {
      return new StaticEntity(
        type,
        model,
        isMaterial,
        order,
        rect,
        modelRect,
        collision,
      );
    }
  }
}
