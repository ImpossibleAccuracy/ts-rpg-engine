import { AbstractRenderer } from "@/library/api/visualizer";
import { AbstractController } from "@/library/api/controller";
import { Looper } from "@/library/api/looper";
import type { AbstractActivity } from "@/library/api/activity";
import type { Nullable } from "@/library/api/data/common";

export enum GameState {
  RUNNING,
  PAUSED,
  EXIT,
}

export class GameEngine<D extends AbstractRenderer> {
  public readonly controller: AbstractController;
  private readonly looper: Looper;
  private activities: Array<AbstractActivity<D>>;

  constructor(
    controller: AbstractController,
    looper: Looper,
    startActivity: AbstractActivity<D>,
    state: GameState = GameState.PAUSED,
  ) {
    this.controller = controller;
    this.looper = looper;
    this.activities = [];
    this._state = state;

    this.attachActivity(startActivity);

    if (state === GameState.RUNNING) {
      this.start();
    }
  }

  private _state: GameState;

  get state(): GameState {
    return this._state;
  }

  set state(value: GameState) {
    if (value != this._state) {
      this._state = value;

      if (value == GameState.RUNNING) {
        this.start();
      }
    }
  }

  public findActivity<T extends AbstractActivity<D>>(
    predicate: (el: AbstractActivity<D>) => boolean,
  ): Nullable<T> {
    const activity = this.activities.find(predicate) ?? null;

    return activity as Nullable<T>;
  }

  public attachActivity(activity: AbstractActivity<D>) {
    activity.onAttach(this);

    this.activities.push(activity);
  }

  public detachActivity(activity: AbstractActivity<D>) {
    activity.onDetach();
    this.activities = this.activities.filter((el) => el !== activity);
  }

  public start() {
    this._state = GameState.RUNNING;

    this.looper.startUiLooper(() => {
      for (const activity of this.activities) {
        activity.draw();
      }

      return this.isRunning();
    });

    this.looper.startLogicLooper(() => {
      for (const activity of this.activities) {
        activity.update();
      }

      for (const activity of this.activities) {
        if (activity.isFinished) {
          this.detachActivity(activity);
        }
      }

      if (this.activities.length === 0) {
        this.state = GameState.EXIT;
      }

      return this.isRunning();
    });
  }

  public isRunning() {
    return this._state == GameState.RUNNING;
  }
}
