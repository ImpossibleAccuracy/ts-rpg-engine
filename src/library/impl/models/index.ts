import {
  DefaultSpriteMetaData,
  Model,
  ModelLoader,
  type SpriteMetaData,
  SpriteModel,
} from "@/library/api/visualizer/model";

export class ColorModel extends Model {
  public readonly color: string;

  constructor(color: string) {
    super();
    this.color = color;
  }
}

export class ColorModelLoader extends ModelLoader {
  private readonly loadedResources: Map<string, ColorModel> = new Map();

  constructor(fallbackModelLoader?: ModelLoader) {
    super(fallbackModelLoader);
  }

  async load(color: string): Promise<ColorModel> {
    if (this.loadedResources.has(color)) {
      return this.loadedResources.get(color)!;
    }

    const model = new ColorModel(color);

    this.loadedResources.set(color, model);

    return model;
  }
}

export interface ImageModelMetadata {
  fill: boolean;
}

export interface SpriteImageMetaData extends SpriteMetaData {
  chunkSizeX: number;
  chunkSizeY: number;
  spriteOffsetX?: number;
  spriteOffsetY?: number;
  spriteWidth?: number;
  spriteHeight?: number;
}

class DefaultSpriteImageMetaData extends DefaultSpriteMetaData {
  public chunkSizeX: number;
  public chunkSizeY: number;

  constructor() {
    super();

    this.chunkSizeX = 1;
    this.chunkSizeY = 1;
  }
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

export class SpriteImageModel extends SpriteModel<SpriteImageMetaData> {
  public readonly image: HTMLImageElement;
  public cols: number;
  public rows: number;

  constructor(image: HTMLImageElement, spriteMetadata: SpriteImageMetaData) {
    super(spriteMetadata, 0);
    this.image = image;

    this.cols = 0;
    this.rows = 0;

    image.addEventListener("load", () => {
      const sizeX = this.spriteMetadata.spriteOffsetX
        ? this.spriteMetadata.spriteOffsetX + this.spriteMetadata.chunkSizeX
        : this.spriteMetadata.chunkSizeX;

      const sizeY = this.spriteMetadata.spriteOffsetY
        ? this.spriteMetadata.spriteOffsetY + this.spriteMetadata.chunkSizeY
        : this.spriteMetadata.chunkSizeY;

      this.cols = Math.floor(this.image.width / sizeX);
      this.rows = Math.floor(this.image.height / sizeY);
    });
  }

  private _activeRow: number = 0;

  get activeRow(): number {
    return this._activeRow;
  }

  set activeRow(value: number) {
    this._activeRow = value;
    this.activeItem = this.calculateActiveItem();
  }

  private _activeCol: number = 0;

  get activeCol(): number {
    return this._activeCol;
  }

  set activeCol(value: number) {
    this._activeCol = value;
    this.activeItem = this.calculateActiveItem();
  }

  tryNextSprite() {
    super.tryNextSprite();

    this._activeRow = Math.floor(this.activeItem / this.cols);
    this._activeCol = this.activeItem % this.cols;
  }

  public tryMoveInRow(maxPosition: number = this.cols) {
    if (this.tryDrawNextSprite()) {
      this.activeCol = (this.activeCol + 1) % maxPosition;
    }
  }

  public tryMoveInColumn(maxPosition: number = this.rows) {
    if (this.tryDrawNextSprite()) {
      this.activeRow = (this.activeRow + 1) % maxPosition;
    }
  }

  public getMaxItem(): number {
    return this.cols * this.rows;
  }

  private calculateActiveItem(): number {
    return this._activeRow * this.cols + this._activeCol;
  }
}

export class ImageModelLoader extends ModelLoader {
  private readonly loadedResources: Map<string, HTMLImageElement> = new Map();
  private readonly baseUrl: string;

  constructor(baseUrl: string, fallbackModelLoader?: ModelLoader) {
    super(fallbackModelLoader);
    this.baseUrl = baseUrl;
  }

  async load(path: string, metadata?: ImageModelMetadata): Promise<Model> {
    try {
      const image = await this.loadImage(path);

      const model = new ImageModel(image, metadata);

      this.loadedResources.set(path, image);

      return model;
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

    if (this.loadedResources.has(path)) {
      return this.loadedResources.get(path)!;
    }

    const image = new Image();
    image.src = this.baseUrl + path;

    return image;
  }
}
