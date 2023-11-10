import {
  Model,
  ModelLoader,
  SpriteModel,
} from "@/library/api/visualizer/model";
import {
  DefaultSpriteImageMetaData,
  type SpriteImageMetaData,
  SpriteImageModel,
} from "@/library/impl/models/spriteImageModel";

export interface ImageModelMetadata {
  fill: boolean;
}

export class ImageModel extends Model {
  public readonly image: HTMLImageElement;
  public readonly imageMetadata?: ImageModelMetadata;
  private loaded: boolean;

  constructor(image: HTMLImageElement, metadata?: ImageModelMetadata) {
    super();
    this.image = image;
    this.imageMetadata = metadata;

    this.loaded = false;

    image.addEventListener("load", () => {
      this.loaded = true;
    });
  }

  public get isLoaded(): boolean {
    return this.loaded;
  }
}

export class ImageModelLoader extends ModelLoader {
  private static readonly loadedResources: Map<string, HTMLImageElement> =
    new Map();
  private readonly baseUrl: string;

  constructor(baseUrl: string, fallbackModelLoader?: ModelLoader) {
    super(fallbackModelLoader);
    this.baseUrl = baseUrl;
  }

  async load(path: string, metadata?: ImageModelMetadata): Promise<Model> {
    try {
      const image = await this.loadImage(path);

      return new ImageModel(image, metadata);
    } catch (e) {
      if (this.fallbackModelLoader) {
        return await this.fallbackModelLoader.load(path, metadata);
      } else {
        throw e;
      }
    }
  }

  async loadSprite(
    path: string,
    spriteMetadata: SpriteImageMetaData = new DefaultSpriteImageMetaData(),
  ): Promise<SpriteModel> {
    try {
      const image = await this.loadImage(path);

      const metadata = Object.assign(
        {},
        new DefaultSpriteImageMetaData(),
        spriteMetadata,
      );

      return new SpriteImageModel(image, metadata);
    } catch (e) {
      if (this.fallbackModelLoader) {
        return await this.fallbackModelLoader.loadSprite(path, spriteMetadata);
      } else {
        throw e;
      }
    }
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

    if (ImageModelLoader.loadedResources.has(path)) {
      return ImageModelLoader.loadedResources.get(path)!;
    }

    const image = new Image();
    image.src = this.baseUrl + path;

    ImageModelLoader.loadedResources.set(path, image);

    return image;
  }
}
