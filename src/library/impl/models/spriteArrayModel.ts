import { Model } from "@/library/api/models";
import {
  type SpriteMetaData,
  SpriteModel,
} from "@/library/api/models/spriteModel";

export class SpriteArrayModel<M extends Model> extends SpriteModel {
  constructor(
    private readonly items: Array<M>,
    spriteMetadata: SpriteMetaData,
    activeItemIndex: number = 0,
  ) {
    super(spriteMetadata, activeItemIndex);
    this.items = items;
  }

  public get activeSprite(): M {
    return this.items[this.activeItem];
  }

  getMaxItem(): number {
    return this.items.length;
  }
}
