import { DynamicEntity, EntityController } from "@/library/api/model/entity";
import { Rect2D } from "@/library/api/model/rect";
import { Level } from "@/library/api/level";
import { AbstractController } from "@/library/api/controller";
import type { CarWorldActivity } from "@/examples/cargame/world";

export class ObstacleController extends EntityController<Rect2D> {
  private speed: number = 0;
  private _lastUpdate: number = Date.now();
  private direction: string;

  constructor(direction: string) {
    super();
    this.direction = direction;
  }

  attachToActivity(activity: CarWorldActivity) {
    super.attachToActivity(activity);

    this.speed =
      (activity.activeAcceleration / activity.acceleration / 999) * 1000;

    if (this.direction === "top") {
      this.speed /= 2;
    }
  }

  public getSpeed(): number {
    const currentTimeMillis = Date.now();

    const diff = currentTimeMillis - this._lastUpdate;

    return (this.speed * diff) / 1000;
  }

  public onUpdate(
    entity: DynamicEntity<Rect2D>,
    level: Level<Rect2D>,
    controller: AbstractController,
  ): void {
    if (this.direction == "top") {
      entity.rect.posY -= this.getSpeed();
    } else if (this.direction == "bottom") {
      entity.rect.posY += this.getSpeed();
    }

    this._lastUpdate = Date.now();
  }
}
