import { Model } from "@/library/api/models";
import type { TilesetItem } from "@/library/impl/models/tilesetModel";
import { SpriteArrayModel } from "@/library/impl/models/spriteArrayModel";
import {
  DefaultSpriteMetaData,
  type SpriteMetaData,
} from "@/library/api/models/spriteModel";
import { mergeDeep } from "@/library/api/utils/object";

export abstract class ModelLoader {
  public readonly fallbackModelLoader?: ModelLoader;

  protected constructor(fallbackModelLoader?: ModelLoader) {
    this.fallbackModelLoader = fallbackModelLoader;
  }

  abstract load(path: string): Promise<Model>;

  abstract loadSprite(path: string, props?: SpriteMetaData): Promise<Model>;

  abstract loadTileset(
    path: string,
    parts: Array<TilesetItem>,
    props?: unknown,
  ): Promise<Model>;

  public async loadSpriteFromArray(
    items: Array<string>,
    props?: SpriteMetaData,
  ): Promise<Model> {
    const promises = items.map((el) => this.load(el));
    const models = await Promise.all(promises);

    const propsData = mergeDeep({}, new DefaultSpriteMetaData(), props);

    return new SpriteArrayModel<Model>(models, propsData);
  }
}
