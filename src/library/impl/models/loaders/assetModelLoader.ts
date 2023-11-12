import { Model } from "@/library/api/models";
import { ImageModel } from "@/library/impl/models/imageModel";
import { ModelLoader } from "@/library/impl/models/loaders/index";
import type { SpriteMetaData } from "@/library/api/models/spriteModel";
import type { TilesetItem } from "@/library/impl/models/tilesetModel";
import { TilesetModel } from "@/library/impl/models/tilesetModel";
import {
  DefaultSpriteImageMetaData,
  SpriteImageModel,
} from "@/library/impl/models/spriteImageModel";
import { mergeDeep } from "@/library/api/utils/object";

export class AssetModelLoader extends ModelLoader {
  private static loadedResources: Map<string, HTMLImageElement> = new Map();
  private readonly baseUrl: string;

  constructor(baseUrl: string, fallbackModelLoader?: ModelLoader) {
    super(fallbackModelLoader);
    this.baseUrl = baseUrl;
  }

  public async load(path: string): Promise<Model> {
    try {
      const image = await this.loadImage(path);

      return new ImageModel(image);
    } catch (e) {
      if (this.fallbackModelLoader) {
        return await this.fallbackModelLoader.load(path);
      } else {
        throw e;
      }
    }
  }

  public async loadSprite(
    path: string,
    props?: SpriteMetaData,
  ): Promise<Model> {
    const image = await this.loadImage(path);

    const propsData = mergeDeep({}, new DefaultSpriteImageMetaData(), props);

    return new SpriteImageModel(image, propsData);
  }

  public async loadTileset(
    path: string,
    parts: Array<TilesetItem>,
  ): Promise<Model> {
    const image = await this.loadImage(path);

    return new TilesetModel(image, parts);
  }

  private async isImageExists(path: string): Promise<boolean> {
    const response = await fetch(this.baseUrl + path);

    const text = await response.text();

    return response.ok && text.search("<!DOCTYPE ") == -1;
  }

  private async loadImage(path: string): Promise<HTMLImageElement> {
    const isImageExists = await this.isImageExists(path);
    if (!isImageExists) {
      throw new Error();
    }

    if (AssetModelLoader.loadedResources.has(path)) {
      return AssetModelLoader.loadedResources.get(path)!;
    }

    const image = new Image();
    image.src = this.baseUrl + path;

    AssetModelLoader.loadedResources.set(path, image);

    return image;
  }
}
