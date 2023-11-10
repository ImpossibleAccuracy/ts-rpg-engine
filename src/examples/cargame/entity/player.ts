import { AbstractController } from "@/library/api/controller";
import type { Nullable } from "@/library/api/model/common";
import { Rect2D } from "@/library/api/model/rect";
import { MouseKeyboardController } from "@/library/impl/controller";
import { DynamicEntity, Entity } from "@/library/api/model/entity";
import { Level } from "@/library/api/level";
import type { GameWorldActivity } from "@/library/impl/activity/world";
import type { CanvasRenderer } from "@/library/impl/visualizer/renderer";
import { SuperPuperMegaTripleXXXVisualizer } from "@/examples/cargame/visualizer";
import { CarWorldActivity } from "@/examples/cargame/world";
import { CarLevel } from "@/examples/cargame/level";
import { MovableEntityController } from "@/library/impl/entity/controller/base";

export class CarController extends MovableEntityController<Rect2D> {
  constructor() {
    super(5);
  }

  public onUpdate(
    entity: DynamicEntity<Rect2D>,
    level: Level<Rect2D>,
    controller: AbstractController,
  ) {
    this.pinEntityToCenter(entity);

    super.onUpdate(entity, level, controller);
  }

  public moveEntity(controller: AbstractController): Nullable<Rect2D> {
    if (!(controller instanceof MouseKeyboardController)) {
      throw new Error("Illegal controller");
    }

    const isLeft = controller.left;
    const isRight = controller.right;

    if (!(isLeft || isRight)) {
      return null;
    }

    const displacement = new Rect2D(0, 0);

    const isRunning = controller.isKeyPressed("shift");
    const speed = this.getSpeed(isRunning ? 2 : 1);

    if (isLeft) {
      displacement.posX = -speed;
    } else if (isRight) {
      displacement.posX = speed;
    }

    return displacement;
  }

  public onEntityCollisionFound(
    level: Level<Rect2D>,
    entity: DynamicEntity<Rect2D>,
    other: Entity<Rect2D>,
  ) {
    if (other.type === "obstacle") {
      const activity = this.requireActivity() as CarWorldActivity;

      activity.die();
    }
  }

  private pinEntityToCenter(entity: Entity<Rect2D>) {
    if (!this.isAttached) return;

    const activity =
      this.requireActivity() as GameWorldActivity<CanvasRenderer>;
    const canvas = activity.visualizer.renderer.canvas;
    const height =
      canvas.height / SuperPuperMegaTripleXXXVisualizer.blockSizePx;

    entity.rect.posY = height / 2 - CarLevel.carSizeY / 2;
  }
}
