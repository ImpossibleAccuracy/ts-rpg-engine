import {
  type AnimationStateItem,
  StateEntityAnimator,
} from "@/library/impl/entity/animator/index";
import type { Nullable } from "@/library/api/data/common";
import { Rect2D } from "@/library/api/data/rect";
import type { Model } from "@/library/api/models";
import { SpriteImageModel } from "@/library/impl/models/spriteImageModel";

export interface MovableAnimationStates {
  top: AnimationStateItem;
  left: AnimationStateItem;
  right: AnimationStateItem;
  bottom: AnimationStateItem;
  hold?: AnimationStateItem;
  topHold?: AnimationStateItem;
  leftHold?: AnimationStateItem;
  rightHold?: AnimationStateItem;
  bottomHold?: AnimationStateItem;
}

const moveAnimationStatesNames = ["left", "right", "top", "bottom"];

export class MovableEntityAnimator<
  D extends MovableAnimationStates = MovableAnimationStates,
> extends StateEntityAnimator {
  public static readonly HoldStatePostfix = "Hold";

  public prevDirection: Nullable<string> = null;
  public currentDirection: Nullable<string> = null;

  private readonly defaultState: string;
  private readonly hasDirectedHoldState: boolean;

  constructor(
    hasDirectedHoldState: boolean,
    states: D,
    defaultState: string = "bottom",
  ) {
    super(new Map(Object.entries(states)), defaultState);
    this.hasDirectedHoldState = hasDirectedHoldState;
    this.defaultState = defaultState;
  }

  public updateByOffset(oldPosition: Rect2D, newPosition: Rect2D) {
    if (oldPosition == newPosition) {
      this.currentDirection = null;
      return;
    }

    if (newPosition.posX > oldPosition.posX) {
      this.currentDirection = "right";
    } else if (newPosition.posX < oldPosition.posX) {
      this.currentDirection = "left";
    } else if (newPosition.posY > oldPosition.posY) {
      this.currentDirection = "bottom";
    } else if (newPosition.posY < oldPosition.posY) {
      this.currentDirection = "top";
    }
  }

  public updateState() {
    const state = this.getActualState(this.currentDirection);

    this.setActiveState(state);

    if (this.currentDirection) {
      this.prevDirection = this.currentDirection;
    }

    this.currentDirection = null;
  }

  public getActualState(currentDirection: Nullable<string>): string {
    if (currentDirection) {
      return currentDirection;
    } else if (this.hasDirectedHoldState) {
      const state = this.getPrevDirection();

      if (moveAnimationStatesNames.includes(state)) {
        return state + MovableEntityAnimator.HoldStatePostfix;
      }

      return state;
    } else {
      return "hold";
    }
  }

  public getPrevDirection(): string {
    return this.prevDirection ?? this.defaultState;
  }
}
