import { Level } from "@/library/api/level";
import { AbstractController } from "@/library/api/controller";
import { Rect } from "@/library/api/model/rect";
import { Model } from "@/library/api/visualizer/model";
import { AbstractActivity } from "@/library/api/activity";
import type { CanvasRenderer } from "@/library/impl/visualizer/renderer";
import type { Nullable } from "@/library/api/model/common";

export abstract class EntityController<R extends Rect> {
  private owner: Nullable<AbstractActivity<CanvasRenderer>>;

  constructor() {
    this.owner = null;
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

  protected constructor(
    type: string,
    model: Model,
    isMaterial: boolean,
    order: number,
    rect: R,
    modelRect: Nullable<R>,
  ) {
    this.type = type;
    this.model = model;
    this.isMaterial = isMaterial;
    this.order = order;
    this.rect = rect;
    this.modelRect = modelRect;
  }

  public isTouch(entity: Entity<R>): boolean {
    return this.rect.isOverlaps(entity.rect);
  }

  public isTouchRect(rect: R): boolean {
    return this.rect.isOverlaps(rect);
  }

  public isOverlaps(entity: Entity<R>): boolean {
    if (this.isMaterial && entity.isMaterial) {
      return this.isTouch(entity);
    }

    return false;
  }

  public isOverlapsRect(rect: R): boolean {
    if (this.isMaterial) {
      return this.isTouchRect(rect);
    }

    return false;
  }

  public getModelRect(): R {
    if (this.modelRect) {
      return this.modelRect;
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
  ) {
    super(type, model, isMaterial, order, rect, modelRect);
  }
}

export class DynamicEntity<R extends Rect> extends Entity<R> {
  public controller: EntityController<R>;

  constructor(
    type: string,
    model: Model,
    isMaterial: boolean,
    order: number,
    rect: R,
    modelRect: Nullable<R>,
    controller: EntityController<R>,
  ) {
    super(type, model, isMaterial, order, rect, modelRect);
    this.controller = controller;
  }
}
