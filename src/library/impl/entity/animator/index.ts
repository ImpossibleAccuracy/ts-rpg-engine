import type { Model } from "@/library/api/models";
import { SpriteImageModel } from "@/library/impl/models/spriteImageModel";

export abstract class AbstractEntityAnimator {
  abstract animate(model: Model, ...props: Array<unknown>): void;
}

export interface AnimationStateItem {
  animatorRow?: number;
  animatorCol?: number;
  maxItemIndex?: number;
  animationSpeedMultiplier?: number;
}

export class StateEntityAnimator extends AbstractEntityAnimator {
  private currentState: AnimationStateItem = {};
  private readonly states: Map<string, AnimationStateItem>;

  constructor(states: Map<string, AnimationStateItem>, initialState: string) {
    super();
    this.states = states;

    this.setActiveState(initialState);
  }

  public setActiveState(state: string) {
    const stateItem = this.states.get(state);

    if (!stateItem) {
      throw new Error("Unknown state");
    }

    this.currentState = stateItem;
  }

  public animate(model: Model, animationSpeed?: number): void {
    if (!(model instanceof SpriteImageModel)) {
      console.error("Invalid data type");
      return;
    }

    const state = this.currentState;

    const resultAnimationSpeed =
      (state.animationSpeedMultiplier ?? 1) * (animationSpeed ?? 1);

    if (state.animatorRow !== undefined) {
      model.activeRow = state.animatorRow;

      model.tryNextCol(state.maxItemIndex, resultAnimationSpeed);
    } else if (state.animatorCol !== undefined) {
      model.activeCol = state.animatorCol;

      model.tryNextRow(state.maxItemIndex, resultAnimationSpeed);
    }
  }
}
