import {
  DynamicEntity,
  Entity,
  EntityController,
} from "@/library/api/model/entity";
import type { Level } from "@/library/api/level";
import type { MouseKeyboardController } from "@/library/impl/controller";
import type { Rect2D } from "@/library/api/model/rect";
import { DialogActivity } from "@/library/impl/activity/dialog";
import type { Nullable } from "@/library/api/model/common";

export class PlayerController extends EntityController<Rect2D> {
  public canMove: boolean = true;

  private readonly playerSpeed = 10;
  private lastDraw: number = Date.now();

  onUpdate(
    entity: DynamicEntity<Rect2D>,
    level: Level<Rect2D>,
    controller: MouseKeyboardController,
  ): void {
    if (this.canMove) {
      const speed = this.getSpeed();

      const newPosition = entity.rect.copy();

      if (!(controller.top && controller.down)) {
        if (controller.top) {
          newPosition.posY -= speed;
        } else if (controller.down) {
          newPosition.posY += speed;
        }
      }

      if (!(controller.left && controller.right)) {
        if (controller.left) {
          newPosition.posX -= speed;
        } else if (controller.right) {
          newPosition.posX += speed;
        }
      }

      this.updatePosition(newPosition, entity, level);
    }

    const touchedCarrot = this.getTouchedCarrot(level, entity);
    if (touchedCarrot) {
      if (this.canMove) {
        const owner = this.requireActivity();
        const dialog = owner.createActivity(DialogActivity, () => {
          this.canMove = true;
          level.removeEntity(touchedCarrot);
        });

        owner.startActivity(dialog);

        this.canMove = false;
      }
    }

    this.lastDraw = Date.now();
  }

  public updatePosition(
    newPosition: Rect2D,
    entity: DynamicEntity<Rect2D>,
    level: Level<Rect2D>,
  ) {
    if (!entity.isMaterial) {
      entity.rect = newPosition;
      return;
    }

    const entities = level.entities.filter((el) => el !== entity);

    const obstacles = entities.filter((e) => e.isOverlapsRect(newPosition));

    if (obstacles.length == 0) {
      entity.rect = newPosition;
    } else {
      for (const obstacle of obstacles) {
        const obstacleRect = obstacle.rect;

        const diffX = newPosition.posX - entity.rect.posX;
        const diffY = newPosition.posY - entity.rect.posY;

        if (entity.rect.posX2 <= obstacleRect.posX && diffX >= 0) {
          newPosition.posX = obstacleRect.posX - entity.rect.sizeX;
        }

        if (entity.rect.posX >= obstacleRect.posX2 && diffX <= 0) {
          newPosition.posX = obstacleRect.posX2;
        }

        if (entity.rect.posY2 <= obstacleRect.posY && diffY >= 0) {
          newPosition.posY = obstacleRect.posY - entity.rect.sizeY;
        }

        if (entity.rect.posY >= obstacleRect.posY2 && diffY <= 0) {
          newPosition.posY = obstacleRect.posY2;
        }
      }

      entity.rect = newPosition;
    }
  }

  private getTouchedCarrot(
    level: Level<Rect2D>,
    entity: DynamicEntity<Rect2D>,
  ): Nullable<Entity<Rect2D>> {
    return (
      level.findAllEntitiesByType("carrot").find((el) => el.isTouch(entity)) ??
      null
    );
  }

  private getSpeed(): number {
    const currentTimeMillis = Date.now();

    const diff = currentTimeMillis - this.lastDraw;

    return (this.playerSpeed * diff) / 1000;
  }
}
