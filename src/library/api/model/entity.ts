import { Level } from "@/library/api/level";
import { AbstractController } from "@/library/api/controller";
import { Rect } from "@/library/api/model/rect";
import { Model } from "@/library/api/visualizer/model";
import { AbstractActivity } from "@/library/api/activity";
import type { CanvasRenderer } from "@/library/impl/visualizer/renderer";
import type { Nullable } from "@/library/api/model/common";

export abstract class EntityController<R extends Rect> {
  private owner: Nullable<AbstractActivity<CanvasRenderer>>;

  protected constructor() {
    this.owner = null;
  }

  public get isAttached(): boolean {
    return this.owner !== null;
  }

  public attachToActivity(activity: AbstractActivity<CanvasRenderer>) {
    if (this.owner) {
      throw new Error("Entity controller already attached to activity");
    }

    this.owner = activity;
  }

  public startActivity(activity: AbstractActivity<never>) {
    this.requireActivity().startActivity(activity);
  }

  abstract onUpdate(
    entity: DynamicEntity<R>,
    level: Level<R>,
    controller: AbstractController,
  ): void;

  protected requireActivity() {
    const owner = this.owner;

    if (!owner) {
      throw new Error("Entity controller not attached to any activity");
    }

    return owner;
  }
}

export type EntityControllerFactory<R extends Rect> = (
  data?: unknown,
) => EntityController<R>;

export abstract class Entity<R extends Rect> {
  public readonly type: string;
  public model: Model;
  public isMaterial: boolean;
  public order: number;

  public rect: R;
  public modelRect: Nullable<R>;
  public collision: Nullable<R>;

  protected constructor(
    type: string,
    model: Model,
    isMaterial: boolean,
    order: number,
    rect: R,
    modelRect: Nullable<R> = null,
    collision: Nullable<R> = null,
  ) {
    this.type = type;
    this.model = model;
    this.isMaterial = isMaterial;
    this.order = order;
    this.rect = rect;
    this.modelRect = modelRect;
    this.collision = collision;
  }

  public isTouch(entity: Entity<R>): boolean {
    const collision1 = this.getCollisionRect();
    const collision2 = entity.getCollisionRect();

    return collision1.isTouch(collision2);
  }

  public isTouchRect(rect: R): boolean {
    const collision1 = this.getCollisionRect();

    return collision1.isTouch(rect);
  }

  public isOverlaps(entity: Entity<R>): boolean {
    const collision1 = this.getCollisionRect();
    const collision2 = entity.getCollisionRect();

    return collision1.isOverlaps(collision2);
  }

  public isOverlapsRect(rect: R): boolean {
    const collision1 = this.getCollisionRect();

    return collision1.isOverlaps(rect);
  }

  public getModelRect(): R {
    if (this.modelRect) {
      return this.modelRect.plusRectCoordinates(this.rect) as R;
    }

    return this.rect;
  }

  public getCollisionRect(): R {
    if (this.collision) {
      return this.collision.plusRectCoordinates(this.rect) as R;
    }

    return this.rect;
  }
}

export class StaticEntity<R extends Rect> extends Entity<R> {
  constructor(
    type: string,
    model: Model,
    isMaterial: boolean,
    order: number,
    rect: R,
    modelRect: Nullable<R>,
    collision: Nullable<R> = null,
  ) {
    super(type, model, isMaterial, order, rect, modelRect, collision);
  }
}

export class DynamicEntity<R extends Rect> extends Entity<R> {
  public controller: EntityController<R>;

  constructor(
    type: string,
    controller: EntityController<R>,
    model: Model,
    isMaterial: boolean,
    order: number,
    rect: R,
    modelRect: Nullable<R>,
    collision: Nullable<R> = null,
  ) {
    super(type, model, isMaterial, order, rect, modelRect, collision);
    this.controller = controller;
  }
}
