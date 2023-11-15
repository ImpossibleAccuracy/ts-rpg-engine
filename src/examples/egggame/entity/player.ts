import { DynamicEntity, Entity } from "@/library/api/data/entity";
import { Rect2D } from "@/library/api/data/rect";
import { Level } from "@/library/api/level";
import { AbstractController } from "@/library/api/controller";
import type { Nullable } from "@/library/api/data/common";
import { MouseKeyboardController } from "@/library/impl/controller";
import {
  type MovableAnimationStates,
  MovableEntityAnimator,
} from "@/library/impl/entity/animator/moveable";
import { MovableEntityController } from "@/library/impl/entity/controller/base";
import { EnemyController } from "@/examples/egggame/entity/enemy";
import { calculateHypotenuse } from "@/library/api/utils/math";
import { GameWorldActivity } from "@/library/impl/activity/world";
import { NpcDialog } from "@/examples/egggame/actiivity/dialog";
import type {
  Dialog,
  DialogCallbacks,
} from "@/examples/egggame/actiivity/dialog/model/dialog";
import {
  buildDialog,
  PlayerMonologues,
  QuestQiverDialogs,
} from "@/examples/egggame/store";
import { TextModel } from "@/library/impl/models/textModel";
import { PlayerOverlayActivity } from "@/examples/egggame/actiivity/overlay/playerOverlay";
import type { EggWorldActivity } from "@/examples/egggame/actiivity/world";
import type { AnimationStateItem } from "@/library/impl/entity/animator";

interface PlayerAnimationStates extends MovableAnimationStates {
  death: AnimationStateItem;
}

class PlayerAnimatorImpl extends MovableEntityAnimator<PlayerAnimationStates> {
  constructor(holdAnimationSpeed: number) {
    super(true, {
      death: {
        animatorRow: 0,
        maxItemIndex: 1,
      },
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

class EggPlayerController extends MovableEntityController<Rect2D> {
  public static readonly InteractionDistance = 0.5;
  private static readonly RunSpeedMultiplier = 2;
  private static readonly DefaultPlayerSpeed = 5;

  public readonly animator = new PlayerAnimatorImpl(0.2);
  protected canInteract: boolean = true;

  constructor(baseEntitySpeed?: number) {
    super(baseEntitySpeed ?? EggPlayerController.DefaultPlayerSpeed);
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

    this.updateAnimation(entity);
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

export class StartLocationPlayerController extends EggPlayerController {
  private isStartQuestGiverNpcDialogFinished: boolean = false;
  private isStartMonologueFinished: boolean = false;
  private isNpcInteractionLabelDisplayed: boolean = false;
  private isBoatInteractionLabelDisplayed: boolean = false;

  constructor(playerSpeed?: number) {
    super(playerSpeed);
  }

  public onUpdate(
    entity: DynamicEntity<Rect2D>,
    level: Level<Rect2D>,
    controller: AbstractController,
  ) {
    super.onUpdate(entity, level, controller);

    if (this.canInteract && !this.isStartMonologueFinished) {
      this.displayStartMonologue();
    }

    this.findNpcInteractions(level, entity);
  }

  public onEntityCollisionFound(
    level: Level<Rect2D>,
    entity: Entity<Rect2D>,
    other: Entity<Rect2D>,
  ) {
    if (other.type === "boat") {
      this.onBoatTouch(entity);
    }
  }

  private async displayStartMonologue() {
    this.canInteract = false;

    const owner = this.requireActivity() as GameWorldActivity<any, any>;
    const modelLoader = owner.modelLoader;

    const dialogData = await buildDialog(
      PlayerMonologues.whereIsTheMan,
      modelLoader,
    );

    const dialogCallbacks: DialogCallbacks = {
      onFinish: () => {
        this.isStartMonologueFinished = true;

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
        this.onNpcInteraction(npc);
      }
    }
  }

  private onBoatTouch(entity: Entity<Rect2D>) {
    if (!this.canInteract) return;

    if (
      this.isStartQuestGiverNpcDialogFinished &&
      !this.isBoatInteractionLabelDisplayed
    ) {
      const owner = this.requireActivity() as GameWorldActivity<any, Rect2D>;

      const labelPosition = new Rect2D(
        0,
        0,
        entity.rect.posX - 0.2,
        entity.rect.posY + entity.rect.sizeY,
      );

      const labelModel = new TextModel("Нажмите E", {
        fontSize: 20,
        isFontBold: true,
      });

      owner.createHint(labelPosition, labelModel, 1000);

      this.isBoatInteractionLabelDisplayed = true;
    }

    if (this.isStartQuestGiverNpcDialogFinished) {
      const controller = this.requireKeyboardController();

      if (controller.isKeyPressed("e")) {
        this.loadNextLevel();

        this.canInteract = false;
      }
    }
  }

  private loadNextLevel() {
    const world = this.requireActivity() as GameWorldActivity<any>;

    world.loadLevel("level1_world");
  }

  private onNpcInteraction(npc: Entity<Rect2D>) {
    const controller = this.requireKeyboardController();

    if (this.canInteract) {
      if (controller.isKeyPressed("e")) {
        this.startNpcDialog();
      } else if (!this.isNpcInteractionLabelDisplayed) {
        const owner = this.requireActivity() as GameWorldActivity<any, Rect2D>;

        const labelPosition = new Rect2D(
          0,
          0,
          npc.rect.posX - 0.4,
          npc.rect.posY + npc.rect.sizeY,
        );

        const labelModel = new TextModel("E для разговора", {
          fontSize: 20,
          isFontBold: true,
        });

        owner.createHint(labelPosition, labelModel, 2000);

        this.isNpcInteractionLabelDisplayed = true;
      }
    }
  }

  private async startNpcDialog() {
    this.canInteract = false;

    const owner = this.requireActivity() as GameWorldActivity<any, any>;
    const modelLoader = owner.modelLoader;

    let dialogData: Dialog;
    if (this.isStartQuestGiverNpcDialogFinished) {
      dialogData = await buildDialog(QuestQiverDialogs.getAway, modelLoader);
    } else {
      dialogData = await buildDialog(QuestQiverDialogs.giveMeEggs, modelLoader);
    }

    const dialogCallbacks: DialogCallbacks = {
      onFinish: () => {
        this.isStartQuestGiverNpcDialogFinished = true;

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
}

export class WorldPlayerController extends EggPlayerController {
  private isStartMonologueFinished: boolean = false;
  private isBoatInteractionLabelDisplayed: boolean = false;
  private canLeaveFromIsland: boolean = false;

  private overlay?: PlayerOverlayActivity;

  constructor(playerSpeed?: number) {
    super(playerSpeed);
  }

  public onDetachFromActivity() {
    super.onDetachFromActivity();

    this.overlay?.finish();
  }

  public onUpdate(
    entity: DynamicEntity<Rect2D>,
    level: Level<Rect2D>,
    controller: AbstractController,
  ) {
    super.onUpdate(entity, level, controller);

    if (this.canInteract && !this.isStartMonologueFinished) {
      this.displayStartMonologue();
    }

    if (this.canInteract) {
      const eggs = level.findAllEntitiesByType("egg");
      this.canLeaveFromIsland = eggs.length === 0;
    }
  }

  public onEntityCollisionFound(
    level: Level<Rect2D>,
    entity: Entity<Rect2D>,
    other: Entity<Rect2D>,
  ) {
    if (!this.canInteract) return;

    if (other.type === "egg") {
      level.removeEntity(other);
    } else if (other.type === "boat") {
      this.onBoatTouch(entity);
    } else if (other.type === "enemy") {
      this.onEnemyTouch();
    }
  }

  private startOverlay() {
    const worldActivity = this.requireActivity() as GameWorldActivity<any>;

    this.overlay = worldActivity.createActivity(
      PlayerOverlayActivity,
      worldActivity.modelLoader,
    );

    this.startActivity(this.overlay);
  }

  private async displayStartMonologue() {
    this.canInteract = false;

    const owner = this.requireActivity() as GameWorldActivity<any, any>;
    const modelLoader = owner.modelLoader;

    const dialogData = await buildDialog(PlayerMonologues.iAmHere, modelLoader);

    const dialogCallbacks: DialogCallbacks = {
      onFinish: () => {
        this.startOverlay();
        this.isStartMonologueFinished = true;

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

  private onEnemyTouch() {
    const activity = this.requireActivity() as EggWorldActivity;
    activity.onPlayerDeath();

    this.lockPosition();
    this.canInteract = false;
    this.animator.setActiveState("death");
  }

  private onBoatTouch(entity: Entity<Rect2D>) {
    if (!this.canInteract) return;

    if (this.canLeaveFromIsland && !this.isBoatInteractionLabelDisplayed) {
      const owner = this.requireActivity() as GameWorldActivity<any, Rect2D>;

      const labelPosition = new Rect2D(
        0,
        0,
        entity.rect.posX + 0.2,
        entity.rect.posY + entity.rect.sizeY,
      );

      const labelModel = new TextModel("Нажмите E", {
        fontSize: 20,
        isFontBold: true,
      });

      owner.createHint(labelPosition, labelModel, 2000);

      this.isBoatInteractionLabelDisplayed = true;
    }

    if (this.canLeaveFromIsland) {
      const controller = this.requireKeyboardController();

      if (controller.isKeyPressed("e")) {
        this.canInteract = false;

        this.loadNextLevel();
      }
    }
  }

  private loadNextLevel() {
    const world = this.requireActivity() as GameWorldActivity<any>;

    world.loadLevel("final");
  }
}

export class FinalLocationPlayerController extends EggPlayerController {
  private isFinalQuestGiverNpcDialogFinished: boolean = false;
  private isStartMonologueFinished: boolean = false;

  constructor(playerSpeed?: number) {
    super(playerSpeed);
  }

  public onUpdate(
    entity: DynamicEntity<Rect2D>,
    level: Level<Rect2D>,
    controller: AbstractController,
  ) {
    super.onUpdate(entity, level, controller);

    if (this.canInteract && !this.isStartMonologueFinished) {
      this.displayStartMonologue();
    }

    this.findNpcInteractions(level, entity);
  }

  private async displayStartMonologue() {
    this.canInteract = false;

    const owner = this.requireActivity() as GameWorldActivity<any, any>;
    const modelLoader = owner.modelLoader;

    const dialogData = await buildDialog(
      PlayerMonologues.noChance,
      modelLoader,
    );

    const dialogCallbacks: DialogCallbacks = {
      onFinish: () => {
        this.isStartMonologueFinished = true;

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
        this.onNpcInteraction(npc);
      }
    }
  }

  private onNpcInteraction(npc: Entity<Rect2D>) {
    const controller = this.requireKeyboardController();

    if (this.canInteract && !this.isFinalQuestGiverNpcDialogFinished) {
      if (controller.isKeyPressed("e")) {
        this.startNpcDialog();
      }
    }
  }

  private async startNpcDialog() {
    this.canInteract = false;

    const owner = this.requireActivity() as GameWorldActivity<any, any>;
    const modelLoader = owner.modelLoader;

    const dialogData = await buildDialog(QuestQiverDialogs.ZombieTime, modelLoader);

    const dialogCallbacks: DialogCallbacks = {
      onFinish: () => {
        alert("Вы прошли игру. Вы можете собой гордиться!");
        this.isFinalQuestGiverNpcDialogFinished = true;

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
}
