import { Level } from "@/library/api/level";
import { MovableEntityController } from "@/library/impl/entity/controller/base";
import { Rect2D } from "@/library/api/data/rect";
import { AbstractController } from "@/library/api/controller";
import type { Nullable } from "@/library/api/data/common";
import { DynamicEntity, Entity } from "@/library/api/data/entity";
import type { AnimationStateItem } from "@/library/impl/entity/animator";
import {
  type MovableAnimationStates,
  MovableEntityAnimator,
} from "@/library/impl/entity/animator/moveable";
import { calculateHypotenuse } from "@/library/api/utils/math";

interface EnemyAnimationDirections extends MovableAnimationStates {
  attack?: AnimationStateItem;
  leftAttack?: AnimationStateItem;
  rightAttack?: AnimationStateItem;
  topAttack?: AnimationStateItem;
  bottomAttack?: AnimationStateItem;
}

abstract class EnemyAnimator extends MovableEntityAnimator<EnemyAnimationDirections> {
  private static readonly AttackPostfix = "Attack";

  public isAttacking: boolean = false;
  private readonly hasAttackDirections: boolean;

  protected constructor(
    hasDirectedHoldState: boolean,
    hasAttackDirections: boolean,
    states: EnemyAnimationDirections,
  ) {
    super(hasDirectedHoldState, states, "bottom");
    this.hasAttackDirections = hasAttackDirections;
  }

  public getActualState(currentDirection: Nullable<string>): string {
    if (this.isAttacking) {
      if (this.hasAttackDirections) {
        const state = currentDirection ?? this.getPrevDirection();

        return state + EnemyAnimator.AttackPostfix;
      } else {
        return "attack";
      }
    }

    return super.getActualState(currentDirection);
  }
}

class SlimeAnimator extends EnemyAnimator {
  constructor() {
    super(false, false, {
      top: {
        animatorRow: 3,
        maxItemIndex: 4,
      },
      left: {
        animatorRow: 1,
        maxItemIndex: 4,
      },
      bottom: {
        animatorRow: 4,
        maxItemIndex: 4,
      },
      right: {
        animatorRow: 2,
        maxItemIndex: 4,
      },
      hold: {
        animatorRow: 0,
        maxItemIndex: 2,
        animationSpeedMultiplier: 0.3,
      },
      attack: {
        animatorRow: 5,
        maxItemIndex: 4,
        animationSpeedMultiplier: 0.6,
      },
    });
  }
}

class GoblinAnimator extends EnemyAnimator {
  constructor() {
    super(true, true, {
      top: {
        animatorRow: 7,
        maxItemIndex: 4,
      },
      left: {
        animatorRow: 5,
        maxItemIndex: 4,
      },
      right: {
        animatorRow: 4,
        maxItemIndex: 4,
      },
      bottom: {
        animatorRow: 6,
        maxItemIndex: 4,
      },
      topHold: {
        animatorRow: 3,
        maxItemIndex: 4,
      },
      leftHold: {
        animatorRow: 1,
        maxItemIndex: 4,
      },
      rightHold: {
        animatorRow: 0,
        maxItemIndex: 4,
      },
      bottomHold: {
        animatorRow: 2,
        maxItemIndex: 4,
      },
      topAttack: {
        animatorRow: 11,
        maxItemIndex: 4,
        animationSpeedMultiplier: 0.5,
      },
      leftAttack: {
        animatorRow: 9,
        maxItemIndex: 4,
        animationSpeedMultiplier: 0.5,
      },
      rightAttack: {
        animatorRow: 8,
        maxItemIndex: 4,
        animationSpeedMultiplier: 0.5,
      },
      bottomAttack: {
        animatorRow: 10,
        maxItemIndex: 4,
        animationSpeedMultiplier: 0.5,
      },
    });
  }
}

class WraithAnimator extends EnemyAnimator {
  constructor() {
    super(true, true, {
      top: {
        animatorRow: 7,
        maxItemIndex: 4,
      },
      left: {
        animatorRow: 5,
        maxItemIndex: 4,
      },
      right: {
        animatorRow: 4,
        maxItemIndex: 4,
      },
      bottom: {
        animatorRow: 6,
        maxItemIndex: 4,
      },
      topHold: {
        animatorRow: 3,
        maxItemIndex: 4,
      },
      leftHold: {
        animatorRow: 1,
        maxItemIndex: 4,
      },
      rightHold: {
        animatorRow: 0,
        maxItemIndex: 4,
      },
      bottomHold: {
        animatorRow: 2,
        maxItemIndex: 4,
      },
      topAttack: {
        animatorRow: 11,
        maxItemIndex: 4,
        animationSpeedMultiplier: 0.5,
      },
      leftAttack: {
        animatorRow: 9,
        maxItemIndex: 4,
        animationSpeedMultiplier: 0.5,
      },
      rightAttack: {
        animatorRow: 8,
        maxItemIndex: 4,
        animationSpeedMultiplier: 0.5,
      },
      bottomAttack: {
        animatorRow: 10,
        maxItemIndex: 4,
        animationSpeedMultiplier: 0.5,
      },
    });
  }
}

export class EnemyController extends MovableEntityController<Rect2D> {
  private readonly animator: EnemyAnimator;
  private readonly attackRange: number;
  private readonly fieldOfView: number;

  constructor(
    baseEntitySpeed: number,
    animator: EnemyAnimator,
    attackRang: number,
    fieldOfView: number,
  ) {
    super(baseEntitySpeed);
    this.animator = animator;
    this.attackRange = attackRang;
    this.fieldOfView = fieldOfView;
  }

  onUpdate(
    entity: DynamicEntity<Rect2D>,
    level: Level<Rect2D>,
    controller: AbstractController,
  ) {
    super.onUpdate(entity, level, controller);

    this.animator.updateState();
    this.animator.animate(entity.primaryModel);
  }

  moveEntity(entity: Entity<Rect2D>, level: Level<Rect2D>): Nullable<Rect2D> {
    const player = level.findPlayer();

    const entityCollision = entity.getCollisionRect();
    const playerCollision = player.getCollisionRect();

    if (entityCollision.isOverlaps(playerCollision)) {
      return null;
    }

    const distanceToPlayer = playerCollision
      .calculateDistance(entityCollision)
      .fixRect();

    const speed = this.getSpeed();
    const distance = this.calculateHypotenuse(distanceToPlayer);

    if (distance < this.fieldOfView) {
      const sinX = distance / distanceToPlayer.posX;
      const sinY = distance / distanceToPlayer.posY;

      const newDistance = distance - speed;

      const displacement = new Rect2D(0, 0);

      displacement.posX = distanceToPlayer.posX - newDistance / sinX;
      displacement.posY = distanceToPlayer.posY - newDistance / sinY;

      return displacement;
    } else {
      return null;
    }
  }

  public onEntityMove(
    level: Level<Rect2D>,
    entity: DynamicEntity<Rect2D>,
    oldPosition: Rect2D,
    newPosition: Rect2D,
  ) {
    super.onEntityMove(level, entity, oldPosition, newPosition);

    this.animator.updateByOffset(oldPosition, newPosition);

    const player = level.findPlayer();
    const distanceToPlayer = entity
      .getCollisionRect()
      .calculateDistance(player.getCollisionRect());

    const distance = calculateHypotenuse(
      distanceToPlayer.posX,
      distanceToPlayer.posY,
    );

    this.animator.isAttacking =
      distance <= this.attackRange && distance <= this.attackRange;
  }

  protected canTouch(entity: Entity<Rect2D>): boolean {
    return (
      super.canTouch(entity) &&
      !(
        entity instanceof DynamicEntity &&
        entity.controller instanceof MovableEntityController
      )
    );
  }
}

export class SlimeController extends EnemyController {
  constructor(speed?: number, attackDistance?: number, fieldOfView?: number) {
    super(
      speed ?? 2,
      new SlimeAnimator(),
      attackDistance ?? 1,
      fieldOfView ?? 10,
    );
  }
}

export class GoblinController extends EnemyController {
  constructor(speed?: number, attackDistance?: number, fieldOfView?: number) {
    super(
      speed ?? 4,
      new GoblinAnimator(),
      attackDistance ?? 1.5,
      fieldOfView ?? 10,
    );
  }
}

export class WraithController extends EnemyController {
  constructor(speed?: number, attackDistance?: number, fieldOfView?: number) {
    super(
      speed ?? 4,
      new WraithAnimator(),
      attackDistance ?? 0.5,
      fieldOfView ?? 10,
    );
  }
}
