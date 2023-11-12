import type { Rect } from "@/library/api/data/rect";
import { Rect2D, Rect3D } from "@/library/api/data/rect";
import {
  DynamicEntity,
  Entity,
  EntityController,
} from "@/library/api/data/entity";
import type { Level } from "@/library/api/level";
import type { AbstractController } from "@/library/api/controller";
import type { Nullable } from "@/library/api/data/common";
import { roundNumber } from "@/library/api/utils/number";

export abstract class MovableEntityController<
  R extends Rect,
> extends EntityController<R> {
  private readonly baseEntitySpeed: number;

  private _lastUpdate: number = -1;
  private _canMove: boolean = true;

  protected constructor(baseEntitySpeed: number) {
    super();
    this.baseEntitySpeed = baseEntitySpeed;
  }

  public abstract moveEntity(
    entity: Entity<R>,
    level: Level<R>,
    controller: AbstractController,
  ): Nullable<R>;

  public lockPosition() {
    this._canMove = false;
  }

  public unlockPosition() {
    this._canMove = true;
  }

  public getSpeed(multiplier: number = 1): number {
    const currentTimeMillis = Date.now();

    const diff = currentTimeMillis - this._lastUpdate;

    const speed = (this.baseEntitySpeed * multiplier * diff) / 1000;

    return roundNumber(speed, 3);
  }

  public onUpdate(
    entity: DynamicEntity<R>,
    level: Level<R>,
    controller: AbstractController,
  ) {
    if (this._lastUpdate == -1) {
      this._lastUpdate = Date.now();
    }

    if (this._canMove) {
      const displacement = this.moveEntity(entity, level, controller);

      if (displacement) {
        const playerPosition = entity.rect;

        if (entity.isMaterial) {
          const playerCollision = entity.getCollisionRect().fixRect() as R;
          const newCollision = playerCollision.plusRectCoordinates(
            displacement,
          ) as R;

          const obstacles = this.findOverlappingEntities(
            level,
            entity,
            newCollision,
            true,
          );

          for (const obstacle of obstacles) {
            this.updateDisplacementWithObstacle(
              playerCollision,
              displacement,
              obstacle,
            );
          }
        }

        const newPlayerPosition = playerPosition.plusRectCoordinates(
          displacement,
        ) as R;

        entity.rect = newPlayerPosition.fixRect() as R;

        this.onEntityMove(level, entity, playerPosition, newPlayerPosition);
      }
    }

    this.checkOverlappingEntities(level, entity);

    this._lastUpdate = Date.now();
  }

  public updateDisplacementWithObstacle(
    playerCollision: R,
    displacement: R,
    obstacle: Entity<R>,
  ) {
    const obstacleCollision = obstacle.getCollisionRect().fixRect();

    if (playerCollision.posX >= obstacleCollision.posX2) {
      displacement.posX = obstacleCollision.posX2 - playerCollision.posX;
    } else if (playerCollision.posX2 <= obstacleCollision.posX) {
      displacement.posX = obstacleCollision.posX - playerCollision.posX2;
    }

    if (
      playerCollision instanceof Rect2D &&
      displacement instanceof Rect2D &&
      obstacleCollision instanceof Rect2D
    ) {
      if (playerCollision.posY >= obstacleCollision.posY2) {
        displacement.posY = obstacleCollision.posY2 - playerCollision.posY;
      } else if (playerCollision.posY2 <= obstacleCollision.posY) {
        displacement.posY = obstacleCollision.posY - playerCollision.posY2;
      }
    }

    if (
      playerCollision instanceof Rect3D &&
      displacement instanceof Rect3D &&
      obstacleCollision instanceof Rect3D
    ) {
      if (playerCollision.posZ >= obstacleCollision.posZ2) {
        displacement.posZ = obstacleCollision.posZ2 - playerCollision.posZ;
      } else if (playerCollision.posZ2 <= obstacleCollision.posZ) {
        displacement.posZ = obstacleCollision.posZ - playerCollision.posZ2;
      }
    }
  }

  public onEntityMove(
    level: Level<R>,
    entity: DynamicEntity<R>,
    oldPosition: R,
    newPosition: R,
  ): void {}

  public onEntityCollisionFound(
    level: Level<R>,
    entity: Entity<R>,
    other: Entity<R>,
  ): void {}

  public onEntitiesCollisionFound(
    level: Level<R>,
    entity: Entity<R>,
    collisions: Array<Entity<R>>,
  ): void {}

  protected findOverlappingEntities(
    level: Level<R>,
    entity: Entity<R>,
    collision: R,
    requireMaterial: boolean,
  ): Array<Entity<R>> {
    return level.entities.filter(
      (el) =>
        el !== entity &&
        (!requireMaterial || this.canTouch(el)) &&
        el.isOverlapsRect(collision),
    );
  }

  protected canTouch(entity: Entity<R>): boolean {
    return entity.isMaterial;
  }

  private checkOverlappingEntities(level: Level<R>, entity: Entity<R>) {
    const entities = this.findOverlappingEntities(
      level,
      entity,
      entity.getCollisionRect(),
      false,
    );

    this.onEntitiesCollisionFound(level, entity, entities);

    entities.forEach((el) => {
      this.onEntityCollisionFound(level, entity, el);
    });
  }
}
