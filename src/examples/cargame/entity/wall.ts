import { DynamicEntity, EntityController } from "@/library/api/model/entity";
import { Rect2D } from "@/library/api/model/rect";
import { Level } from "@/library/api/level";
import { AbstractController } from "@/library/api/controller";
import { SuperPuperMegaTripleXXXVisualizer } from "@/examples/cargame/visualizer";
import type { GameWorldActivity } from "@/library/impl/activity/world";
import type { CanvasRenderer } from "@/library/impl/visualizer/renderer";
import type { CarWorldActivity } from "@/examples/cargame/world";

export class WallController extends EntityController<Rect2D> {
  private _lastUpdate: number = Date.now();

  constructor() {
    super();
  }

  public getSpeed(): number {
    const activity = this.requireActivity() as CarWorldActivity;
    const speed =
      (activity.activeAcceleration / activity.acceleration / 999) * 1000;

    const currentTimeMillis = Date.now();

    const diff = currentTimeMillis - this._lastUpdate;

    return (speed * diff) / 1000;
  }

  public onUpdate(
    entity: DynamicEntity<Rect2D>,
    level: Level<Rect2D>,
    controller: AbstractController,
  ): void {
    if (this.isAttached) {
      if (entity.rect.posY > 0) {
        entity.rect.posY = -entity.rect.sizeY + this.getHeight();
      }

      entity.rect.posY += this.getSpeed();

      entity.rect.sizeY = this.getHeight() * 2;
    }

    this._lastUpdate = Date.now();
  }

  private getHeight(): number {
    const activity =
      this.requireActivity() as GameWorldActivity<CanvasRenderer>;

    return (
      activity.visualizer.renderer.canvas.height /
      SuperPuperMegaTripleXXXVisualizer.blockSizePx
    );
  }
}
