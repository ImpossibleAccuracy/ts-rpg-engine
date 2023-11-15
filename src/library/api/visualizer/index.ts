import { Level } from "@/library/api/level";
import { Rect } from "@/library/api/data/rect";

export abstract class AbstractRenderer {}

export abstract class AbstractVisualizer<D extends AbstractRenderer> {
  public readonly renderer: D;

  protected constructor(renderer: D) {
    this.renderer = renderer;
  }
}

export abstract class LevelVisualizer<
  D extends AbstractRenderer,
  R extends Rect,
> extends AbstractVisualizer<D> {
  protected constructor(renderer: D) {
    super(renderer);
  }

  public abstract display(level: Level<R>, ...other: Array<unknown>): void;

  public abstract displayLevelLoading(): void;
}
