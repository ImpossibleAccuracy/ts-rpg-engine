import { Model } from "@/library/api/models/index";

export interface SpriteMetaData {
  isAutomatic: boolean;
  lastDraw?: number;
  updateRate?: number;
  repeat?: boolean;
}

export class DefaultSpriteMetaData implements SpriteMetaData {
  public lastDraw: number;
  public isAutomatic: boolean;

  constructor() {
    this.lastDraw = -1;
    this.isAutomatic = false;
  }
}

export abstract class SpriteModel<
  META extends SpriteMetaData = SpriteMetaData,
> extends Model {
  public readonly spriteMetadata: META;
  protected activeItem: number;

  protected constructor(spriteMetadata: META, activeItemIndex: number) {
    super();
    this.spriteMetadata = spriteMetadata;
    this.activeItem = activeItemIndex;
  }

  public setActiveItem(item: number) {
    this.activeItem = item % this.getMaxItem();
  }

  public tryNextSprite() {
    if (this.canDrawNextSprite()) {
      this.setActiveItem(this.activeItem + 1);
    }
  }

  abstract getMaxItem(): number;

  protected canDrawNextSprite(speedMultiplier?: number): boolean {
    const data = this.spriteMetadata;
    const currentTimeMillis = Date.now();

    speedMultiplier = speedMultiplier ?? 1;

    if (data.updateRate && data.updateRate > 0) {
      if (!data.lastDraw || data.lastDraw < 0) {
        data.lastDraw = currentTimeMillis;
      } else if (
        currentTimeMillis - data.lastDraw >=
        data.updateRate / speedMultiplier
      ) {
        data.lastDraw += data.updateRate / speedMultiplier;
        return true;
      }
    }

    return false;
  }
}
