import { Level } from "@/library/api/level";
import { AbstractController } from "@/library/api/controller";
import { Rect } from "@/library/api/data/rect";
import { Model } from "@/library/api/models";
import { AbstractActivity } from "@/library/api/activity";
import type { CanvasRenderer } from "@/library/impl/visualizer/renderer";
import type { Nullable } from "@/library/api/data/common";

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
  ...data: Array<any>
) => EntityController<R>;

export abstract class Entity<R extends Rect> {
  protected constructor(
    public readonly type: string,
    public models: Array<Model>,
    public isMaterial: boolean,
    public order: number,
    public rect: R,
    public collision: Nullable<R>,
  ) {}

  public get primaryModel(): Model {
    return this.models[0];
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
    models: Array<Model>,
    isMaterial: boolean,
    order: number,
    rect: R,
    collision: Nullable<R>,
  ) {
    super(type, models, isMaterial, order, rect, collision);
  }
}

export class DynamicEntity<R extends Rect> extends Entity<R> {
  constructor(
    type: string,
    public controller: EntityController<R>,
    models: Array<Model>,
    isMaterial: boolean,
    order: number,
    rect: R,
    collision: Nullable<R>,
  ) {
    super(type, models, isMaterial, order, rect, collision);
  }
}

export interface EntityFactory<R extends Rect> {
  buildEntity(
    type: string,
    model: Array<Model> | Model,
    isMaterial: boolean,
    order: number,
    rect: R,
    collision: Nullable<R>,
    controller: Nullable<EntityController<R>>,
  ): Entity<R>;
}
