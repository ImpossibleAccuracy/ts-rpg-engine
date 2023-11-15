import { DynamicEntity, Entity, StaticEntity } from "@/library/api/data/entity";
import { Rect2D } from "@/library/api/data/rect";
import { Level } from "@/library/api/level";
import { AbstractController } from "@/library/api/controller";
import type { Nullable } from "@/library/api/data/common";
import { MouseKeyboardController } from "@/library/impl/controller";
import { MovableEntityAnimator } from "@/library/impl/entity/animator/moveable";
import { MovableEntityController } from "@/library/impl/entity/controller/base";
import { EnemyController } from "@/examples/egggame/entity/enemy";
import { calculateHypotenuse } from "@/library/api/utils/math";
import { GameWorldActivity } from "@/library/impl/activity/world";
import { NpcDialog } from "@/examples/egggame/actiivity/dialog";
import type {
  Dialog,
  DialogCallbacks,
} from "@/examples/egggame/actiivity/dialog/model/dialog";
import { buildDialog, QuestQiverDialogs } from "@/examples/egggame/store";
import { Timer } from "@/library/impl/utils/timer";
import { ColorModel } from "@/library/impl/models/colorModel";

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
  private static readonly InteractionDistance = 0.5;

  private canInteract: boolean = true;
  private isStartDialogFinished: boolean = false;

  private readonly loggerTimer = new Timer(500);
  private readonly blockSpawnTimer = new Timer(500);

  private readonly animator = new PlayerAnimatorImpl(0.2);

  constructor(playerSpeed?: number) {
    super(playerSpeed ?? EggPlayerController.DefaultPlayerSpeed);
  }

  public canMove(): boolean {
    return super.canMove() && this.canInteract;
  }

  public requireKeyboardController(): MouseKeyboardController {
    const owner = this.requireActivity();

    if (!(owner instanceof GameWorldActivity)) {
      throw new Error("Unknown activity");
    }

    const controller = owner.controller;

    if (!(controller instanceof MouseKeyboardController)) {
      throw new Error("Unknown controller");
    }

    return controller;
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

  public onUpdate(
    entity: DynamicEntity<Rect2D>,
    level: Level<Rect2D>,
    controller: AbstractController,
  ) {
    super.onUpdate(entity, level, controller);

    this.findNpcInteractions(level, entity);

    this.updateAnimation(entity);
  }

  public onEntityMove(
    _level: Level<Rect2D>,
    _entity: DynamicEntity<Rect2D>,
    oldPosition: Rect2D,
    newPosition: Rect2D,
  ): void {
    // console.log(newPosition.posX, newPosition.posY);
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

  private findNpcInteractions(level: Level<Rect2D>, entity: Entity<Rect2D>) {
    if (!this.canInteract) return;

    const playerCollision = entity.getCollisionRect();
    const npcList = level.findAllEntitiesByType("npc");
    for (const npc of npcList) {
      const distanceToNpc = playerCollision.calculateDistance(
        npc.getCollisionRect(),
      );

      const distance = calculateHypotenuse(
        distanceToNpc.posX,
        distanceToNpc.posY,
      );

      if (distance < EggPlayerController.InteractionDistance) {
        this.onNpcInteraction(level, entity, npc);
      }
    }
  }

  private onNpcInteraction(
    level: Level<Rect2D>,
    entity: Entity<Rect2D>,
    npc: Entity<Rect2D>,
  ) {
    const controller = this.requireKeyboardController();

    if (controller.isKeyPressed("e") && this.canInteract) {
      this.startNpcDialog(level, entity, npc);
    }
  }

  private async startNpcDialog(
    level: Level<Rect2D>,
    entity: Entity<Rect2D>,
    npc: Entity<Rect2D>,
  ) {
    this.canInteract = false;

    const owner = this.requireActivity() as GameWorldActivity<any, any>;
    const modelLoader = owner.modelLoader;

    let dialogData: Dialog;
    if (this.isStartDialogFinished) {
      dialogData = await buildDialog(QuestQiverDialogs.getAway, modelLoader);
    } else {
      dialogData = await buildDialog(QuestQiverDialogs.giveMeEggs, modelLoader);
    }

    const dialogCallbacks: DialogCallbacks = {
      onFinish: () => {
        this.isStartDialogFinished = true;

        setTimeout(() => {
          this.canInteract = true;
        }, 500);
      },
    };

    const activity = owner.createActivity(
      NpcDialog,
      owner.modelLoader,
      dialogData,
      dialogCallbacks,
    );

    this.startActivity(activity);
  }

  private updateAnimation(entity: Entity<Rect2D>) {
    this.animator.updateState();

    const speedMultiplier = this.calculateSpeedMultiplier();
    this.animator.animate(entity.primaryModel, speedMultiplier);
  }

  private calculateSpeedMultiplier(): number {
    const controller = this.requireKeyboardController();

    return controller.isKeyPressed("shift")
      ? EggPlayerController.RunSpeedMultiplier
      : 1;
  }
}
