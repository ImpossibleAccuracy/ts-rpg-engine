import { MovableEntityController } from "@/library/impl/entity/controller/base";
import { Rect2D } from "@/library/api/data/rect";
import { DynamicEntity } from "@/library/api/data/entity";
import type { Nullable } from "@/library/api/data/common";
import {
  type AnimationStateItem,
  StateEntityAnimator,
} from "@/library/impl/entity/animator";
import { Level } from "@/library/api/level";
import { AbstractController } from "@/library/api/controller";

abstract class NpcAnimator extends StateEntityAnimator {
  protected constructor(
    states: Map<string, AnimationStateItem>,
    initialState: string,
  ) {
    super(states, initialState);
  }
}

class QuestGiverAnimator extends StateEntityAnimator {
  constructor() {
    super(
      new Map(
        Object.entries({
          hold: {
            animatorRow: 1,
            minItemIndex: 2,
            maxItemIndex: 4,
            animationSpeedMultiplier: 0.3,
          },
        }),
      ),
      "hold",
    );
  }
}

export abstract class NpcController extends MovableEntityController<Rect2D> {
  private readonly animator: NpcAnimator;

  protected constructor(baseEntitySpeed: number = 3, animator: NpcAnimator) {
    super(baseEntitySpeed);
    this.animator = animator;
  }

  public onUpdate(
    entity: DynamicEntity<Rect2D>,
    level: Level<Rect2D>,
    controller: AbstractController,
  ) {
    super.onUpdate(entity, level, controller);

    this.animator.animate(entity.primaryModel);
  }

  public moveEntity(): Nullable<Rect2D> {
    return null;
  }
}

export class QuestGiverNpcController extends NpcController {
  constructor() {
    super(3, new QuestGiverAnimator());
  }
}
