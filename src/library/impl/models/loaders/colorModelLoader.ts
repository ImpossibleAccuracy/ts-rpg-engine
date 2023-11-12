import { ColorModel } from "@/library/impl/models/colorModel";
import { ModelLoader } from "@/library/impl/models/loaders/index";
import type { SpriteMetaData } from "@/library/api/models/spriteModel";
import type { Model } from "@/library/api/models";
import type { TilesetItem } from "@/library/impl/models/tilesetModel";

export class ColorModelLoader extends ModelLoader {
  constructor(fallbackModelLoader?: ModelLoader) {
    super(fallbackModelLoader);
  }

  async load(color: string): Promise<ColorModel> {
    return new ColorModel(color);
  }

  loadSprite(path: string, props?: SpriteMetaData): Promise<Model> {
    throw new Error("Not supported");
  }

  loadTileset(
    path: string,
    parts: Array<TilesetItem>,
    props?: unknown,
  ): Promise<Model> {
    throw new Error("Not supported");
  }
}
