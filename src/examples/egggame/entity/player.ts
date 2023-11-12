import { DynamicEntity, Entity } from "@/library/api/data/entity";
import { Rect2D } from "@/library/api/data/rect";
import { Level } from "@/library/api/level";
import { AbstractController } from "@/library/api/controller";
import type { Nullable } from "@/library/api/data/common";
import { MouseKeyboardController } from "@/library/impl/controller";
import { DialogActivity } from "@/library/impl/activity/dialog";
import { MovableEntityAnimator } from "@/library/impl/entity/animator/moveable";
import { EggWorldActivity } from "@/examples/egggame/world";
import { MovableEntityController } from "@/library/impl/entity/controller/base";
import { EnemyController } from "@/examples/egggame/entity/enemy";

class PlayerAnimatorImpl extends MovableEntityAnimator {
  constructor(holdAnimationSpeed: number) {
    super(true, {
      top: {
        animatorRow: 1,
        maxItemIndex: 4,
      },
      left: {
        animatorRow: 2,
        maxItemIndex: 4,
      },
      right: {
        animatorRow: 3,
        maxItemIndex: 4,
      },
      bottom: {
        animatorRow: 0,
        maxItemIndex: 4,
      },
      hold: {
        animatorRow: 0,
        maxItemIndex: 2,
        animationSpeedMultiplier: holdAnimationSpeed,
      },
      topHold: {
        animatorRow: 1,
        maxItemIndex: 2,
        animationSpeedMultiplier: holdAnimationSpeed,
      },
      leftHold: {
        animatorRow: 2,
        maxItemIndex: 2,
        animationSpeedMultiplier: holdAnimationSpeed,
      },
      rightHold: {
        animatorRow: 3,
        maxItemIndex: 2,
        animationSpeedMultiplier: holdAnimationSpeed,
      },
      bottomHold: {
        animatorRow: 0,
        maxItemIndex: 2,
        animationSpeedMultiplier: holdAnimationSpeed,
      },
    });
  }
}

export class EggPlayerController extends MovableEntityController<Rect2D> {
  private static readonly RunSpeedMultiplier = 2;
  private static readonly DefaultPlayerSpeed = 5;

  private isInDialog: boolean = false;
  private readonly animator = new PlayerAnimatorImpl(0.2);

  constructor(playerSpeed?: number) {
    super(playerSpeed ?? EggPlayerController.DefaultPlayerSpeed);
  }

  public onUpdate(
    entity: DynamicEntity<Rect2D>,
    level: Level<Rect2D>,
    controller: AbstractController,
  ) {
    super.onUpdate(entity, level, controller);

    if (!this.isInDialog) {
      this.animator.updateState();
    }

    const speedMultiplier = this.calculateSpeedMultiplier();
    this.animator.animate(entity.primaryModel, speedMultiplier);
  }

  public moveEntity(): Nullable<Rect2D> {
    const controller = this.requireActivity().controller;

    if (!(controller instanceof MouseKeyboardController)) {
      throw new Error("Player can use only MouseKeyboard Controller");
    }

    const isLeft = controller.left;
    const isRight = controller.right;
    const isTop = controller.top;
    const isDown = controller.down;

    if (!(isLeft || isRight || isTop || isDown)) {
      return null;
    }

    const speedMultiplier = this.calculateSpeedMultiplier();
    const speed = this.getSpeed(speedMultiplier);

    const displacement = new Rect2D(0, 0);

    if (!(isTop && isDown)) {
      if (isTop) {
        displacement.posY = -speed;
      } else if (isDown) {
        displacement.posY = speed;
      }
    }

    if (!(isLeft && isRight)) {
      if (isLeft) {
        displacement.posX = -speed;
      } else if (isRight) {
        displacement.posX = speed;
      }
    }

    return displacement;
  }

  public onEntityCollisionFound(
    level: Level<Rect2D>,
    _entity: DynamicEntity<Rect2D>,
    other: Entity<Rect2D>,
  ): void {
    if (other.type === "egg") {
      this.lockPosition();

      const eggsCount = level.findAllEntitiesByType("egg").length;

      const activity = this.requireActivity();

      let dialogData;
      if (eggsCount > 1) {
        dialogData = {
          title: `Осталось яиц: ${eggsCount - 1}`,
          closable: true,
        };
      } else {
        dialogData = {
          title: "Вы собрали все яйца",
          closable: false,
        };
      }

      const dialog = activity.createActivity(DialogActivity, dialogData, {
        onClose: () => {
          level.removeEntity(other);
          this.unlockPosition();
        },
      });

      activity.startActivity(dialog);
    }
  }

  public onEntityMove(
    _level: Level<Rect2D>,
    _entity: DynamicEntity<Rect2D>,
    oldPosition: Rect2D,
    newPosition: Rect2D,
  ): void {
    this.animator.updateByOffset(oldPosition, newPosition);
  }

  protected canTouch(entity: Entity<Rect2D>): boolean {
    return (
      super.canTouch(entity) &&
      !(
        entity instanceof DynamicEntity &&
        entity.controller instanceof EnemyController
      )
    );
  }

  private calculateSpeedMultiplier(): number {
    const owner = this.requireActivity();

    if (!(owner instanceof EggWorldActivity)) return 1;

    const controller = owner.controller;

    if (!(controller instanceof MouseKeyboardController)) return 1;

    return controller.isKeyPressed("shift")
      ? EggPlayerController.RunSpeedMultiplier
      : 1;
  }
}
