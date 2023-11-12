import { MovableEntityController } from "@/library/impl/entity/controller/base";
import { Rect2D } from "@/library/api/data/rect";
import { DynamicEntity, Entity } from "@/library/api/data/entity";
import { Level } from "@/library/api/level";
import { AbstractController } from "@/library/api/controller";
import type { Nullable } from "@/library/api/data/common";
import {
  AbstractEntityAnimator,
  StateEntityAnimator,
} from "@/library/impl/entity/animator";

class NpcAnimator extends StateEntityAnimator {
  constructor() {
    super(
      new Map(
        Object.entries({
          hold: {
            animatorRow: 0,
            maxItemIndex: 1,
          },
        }),
      ),
      "hold",
    );
  }
}

export class SimpleNpcController extends MovableEntityController<Rect2D> {
  private readonly animator: AbstractEntityAnimator = new NpcAnimator();

  constructor(baseEntitySpeed: number = 3) {
    super(baseEntitySpeed);
  }

  onUpdate(
    entity: DynamicEntity<Rect2D>,
    level: Level<Rect2D>,
    controller: AbstractController,
  ) {
    super.onUpdate(entity, level, controller);

    this.animator.animate(entity.primaryModel);
  }

  moveEntity(
    entity: Entity<Rect2D>,
    level: Level<Rect2D>,
    controller: AbstractController,
  ): Nullable<Rect2D> {
    return null;
  }
}
