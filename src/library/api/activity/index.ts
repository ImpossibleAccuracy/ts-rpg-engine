import { AbstractRenderer, AbstractVisualizer } from "@/library/api/visualizer";
import type { GameEngine } from "@/library/api/engine";

export abstract class AbstractActivity<
  D extends AbstractRenderer,
  V extends AbstractVisualizer<D> = AbstractVisualizer<D>,
> {
  public visualizer: V;
  private finished: boolean = false;
  private gameEngine?: GameEngine<D>;

  protected constructor(visualizer: V) {
    this.visualizer = visualizer;
  }

  public get isFinished(): boolean {
    return this.finished;
  }

  public createActivity<T extends AbstractActivity<D>>(
    Activity: new (renderer: D, ...params: Array<any>) => T,
    ...params: Array<unknown>
  ): T {
    return new Activity(this.visualizer.renderer, ...params);
  }

  public startActivity(activity: AbstractActivity<D>) {
    this.requireGameEngine().attachActivity(activity);
  }

  public onAttach(gameEngine: GameEngine<D>) {
    this.gameEngine = gameEngine;
  }

  public onDetach() {
    this.gameEngine = undefined;
  }

  public abstract draw(): void;

  public abstract update(): void;

  public finish() {
    this.finished = true;
  }

  protected requireGameEngine() {
    const engine = this.gameEngine;

    if (!engine) {
      throw new Error("Activity not attached to GameEngine");
    }

    return engine;
  }
}
