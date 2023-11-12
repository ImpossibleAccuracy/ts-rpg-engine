import { ImageModel } from "@/library/impl/models/imageModel";
import type { Rect2D } from "@/library/api/data/rect";

export interface TilesetItem {
  sourceRect: Rect2D;
  destinationRect: Rect2D;
}

export class TilesetModel extends ImageModel {
  constructor(
    image: HTMLImageElement,
    public readonly parts: Array<TilesetItem>,
  ) {
    super(image);
  }
}
