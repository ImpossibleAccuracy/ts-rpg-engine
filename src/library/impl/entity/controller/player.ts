import {
  DynamicEntity,
  Entity,
  EntityController,
} from "@/library/api/model/entity";
import type { Level } from "@/library/api/level";
import { Rect, Rect2D } from "@/library/api/model/rect";
import type { AbstractController } from "@/library/api/controller";
import type { Nullable } from "@/library/api/model/common";

export abstract class PlayerController<
  R extends Rect,
> extends EntityController<R> {
  public readonly playerSpeed: number;
  public readonly runPlayerSpeed: number;
  protected canMove: boolean = true;

  protected constructor(
    playerSpeed: number,
    runPlayerSpeed: number = playerSpeed,
  ) {
    super();
    this.playerSpeed = playerSpeed;
    this.runPlayerSpeed = runPlayerSpeed;
  }

  public abstract moveEntity(controller: AbstractController): Nullable<R>;

  public onEntityCollisionFound(
    level: Level<R>,
    entity: DynamicEntity<R>,
    other: Entity<R>,
  ): void {}

  public onEntityPositionUpdate(
    level: Level<R>,
    entity: DynamicEntity<R>,
    oldPosition: R,
    newPosition: R,
  ): void {}

  public abstract updateDisplacementWithObstacle(
    playerCollision: R,
    displacement: R,
    obstacle: Entity<R>,
  ): void;

  public onUpdate(
    entity: DynamicEntity<R>,
    level: Level<R>,
    controller: AbstractController,
  ): void {
    if (this.canMove) {
      const displacement = this.moveEntity(controller);

      if (displacement) {
        const playerPosition = entity.rect;

        if (entity.isMaterial) {
          const playerCollision = entity.getCollisionRect();
          const newCollision = entity
            .getCollisionRect()
            .plusRectCoordinates(displacement) as R;

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

        entity.rect = newPlayerPosition;

        this.onEntityPositionUpdate(
          level,
          entity,
          playerPosition,
          newPlayerPosition,
        );
      }
    }

    this.findOverlappingEntities(
      level,
      entity,
      entity.getCollisionRect(),
      false,
    ).forEach((el) => {
      this.onEntityCollisionFound(level, entity, el);
    });
  }

  private findOverlappingEntities(
    level: Level<R>,
    entity: Entity<R>,
    collision: R,
    requireMaterial: boolean,
  ): Array<Entity<R>> {
    return level.entities.filter(
      (el) =>
        el !== entity &&
        (!requireMaterial || el.isMaterial) &&
        el.isTouchRect(collision),
    );
  }
}

export abstract class PlayerController2D extends PlayerController<Rect2D> {
  private static readonly RoundDeep = 5;

  protected constructor(
    playerSpeed: number,
    runPlayerSpeed: number = playerSpeed,
  ) {
    super(playerSpeed, runPlayerSpeed);
  }

  public updateDisplacementWithObstacle(
    playerCollision: Rect2D,
    displacement: Rect2D,
    obstacle: Entity<Rect2D>,
  ) {
    const obstacleCollision = obstacle.getCollisionRect();

    // FIXME
    if (playerCollision.posX >= obstacleCollision.posX2) {
      displacement.posX = obstacleCollision.posX2 - playerCollision.posX;
    } else if (playerCollision.posX2 <= obstacleCollision.posX) {
      displacement.posX = obstacleCollision.posX - playerCollision.posX2;
    } else if (playerCollision.posY >= obstacleCollision.posY2) {
      displacement.posY = obstacleCollision.posY2 - playerCollision.posY;
    } else if (playerCollision.posY2 <= obstacleCollision.posY) {
      displacement.posY = obstacleCollision.posY - playerCollision.posY2;
    }
  }

  private roundNumber(number: number, n: number) {
    return Math.round((number * 10 ** n) / 10 ** n);
  }
}
