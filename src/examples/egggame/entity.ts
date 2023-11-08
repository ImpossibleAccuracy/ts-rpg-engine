import { PlayerController2D } from "@/library/impl/entity/controller/player";
import { DynamicEntity, Entity } from "@/library/api/model/entity";
import { Rect2D } from "@/library/api/model/rect";
import type { Level } from "@/library/api/level";
import type { AbstractController } from "@/library/api/controller";
import type { Nullable } from "@/library/api/model/common";
import { MouseKeyboardController } from "@/library/impl/controller";
import { SpriteImageModel } from "@/library/impl/models";
import { DialogActivity } from "@/library/impl/activity/dialog";

export class EggPlayerController extends PlayerController2D {
  private _lastUpdate: number = Date.now();

  constructor() {
    super(5, 10);
  }

  public onUpdate(
    entity: DynamicEntity<Rect2D>,
    level: Level<Rect2D>,
    controller: AbstractController,
  ) {
    super.onUpdate(entity, level, controller);

    this._lastUpdate = Date.now();
  }

  public getSpeed(isRunning: boolean): number {
    const currentTimeMillis = Date.now();

    const diff = currentTimeMillis - this._lastUpdate;

    if (isRunning) {
      return (this.runPlayerSpeed * diff) / 1000;
    } else {
      return (this.playerSpeed * diff) / 1000;
    }
  }

  public moveEntity(controller: AbstractController): Nullable<Rect2D> {
    if (!(controller instanceof MouseKeyboardController)) {
      throw new Error("Player can use only MouseKeyboard Controller");
    }

    const isRunning = controller.isKeyPressed("shift");
    const speed = this.getSpeed(isRunning);

    const displacement = new Rect2D(0, 0);

    const isLeft = controller.left;
    const isRight = controller.right;
    const isTop = controller.top;
    const isDown = controller.down;

    if (!(isLeft || isRight || isTop || isDown)) {
      return null;
    }

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
    if (other.type === "egg" && other.isTouch(other)) {
      this.canMove = false;

      const eggsCount = level.findAllEntitiesByType("egg").length;

      const activity = this.requireActivity();

      let dialog;
      if (eggsCount > 1) {
        dialog = activity.createActivity(
          DialogActivity,
          {
            title: `Осталось яиц: ${eggsCount - 1}`,
            closable: true,
          },
          {
            onClose: () => {
              level.removeEntity(other);
              this.canMove = true;
            },
          },
        );
      } else {
        dialog = activity.createActivity(
          DialogActivity,
          {
            title: "Вы собрали все яйца",
          },
          {
            onClose: () => {
              level.removeEntity(other);
              this.canMove = true;
            },
          },
        );
      }

      activity.startActivity(dialog);
    }
  }

  public onEntityPositionUpdate(
    _level: Level<Rect2D>,
    entity: DynamicEntity<Rect2D>,
    oldPosition: Rect2D,
    newPosition: Rect2D,
  ): void {
    if (newPosition.posX > oldPosition.posX) {
      this.updateModelDirection(entity, "right");
    } else if (newPosition.posX < oldPosition.posX) {
      this.updateModelDirection(entity, "left");
    } else if (newPosition.posY > oldPosition.posY) {
      this.updateModelDirection(entity, "down");
    } else if (newPosition.posY < oldPosition.posY) {
      this.updateModelDirection(entity, "top");
    } else {
      this.updateModelDirection(entity, "nope");
    }
  }

  private updateModelDirection(
    entity: DynamicEntity<Rect2D>,
    direction: string,
  ) {
    const model = entity.model;

    if (!(model instanceof SpriteImageModel)) return;

    const directionsRows = new Map(
      Object.entries({
        top: 8,
        left: 9,
        down: 10,
        right: 11,
      }),
    );

    const row = directionsRows.get(direction);

    if (!row) return;

    model.activeRow = row;
    model.tryMoveInRow(9);
  }
}
