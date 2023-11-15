import {
  DefaultSpriteMetaData,
  type SpriteMetaData,
  SpriteModel,
} from "@/library/api/models/spriteModel";

export interface SpriteImageMetaData extends SpriteMetaData {
  chunkSizeX: number;
  chunkSizeY: number;
  spriteOffsetX?: number;
  spriteOffsetY?: number;
  spriteWidth?: number;
  spriteHeight?: number;
  defaultActiveCol?: number;
  defaultActiveRow?: number;
  maxCols?: number;
  maxRows?: number;
  onlyCol?: number;
  onlyRow?: number;
}

export class DefaultSpriteImageMetaData extends DefaultSpriteMetaData {
  public chunkSizeX: number;
  public chunkSizeY: number;

  constructor() {
    super();

    this.chunkSizeX = 1;
    this.chunkSizeY = 1;
  }
}

export class SpriteImageModel extends SpriteModel<SpriteImageMetaData> {
  public cols: number;
  public rows: number;
  private loaded: boolean;

  constructor(
    public readonly image: HTMLImageElement,
    spriteMetadata: SpriteImageMetaData,
  ) {
    super(spriteMetadata, 0);
    this.image = image;
    this.loaded = false;

    this.cols = spriteMetadata.maxCols ?? 0;
    this.rows = spriteMetadata.maxRows ?? 0;

    this._activeRow =
      spriteMetadata.onlyRow ?? spriteMetadata.defaultActiveRow ?? 0;
    this._activeCol =
      spriteMetadata.onlyCol ?? spriteMetadata.defaultActiveCol ?? 0;

    if (image.complete) {
      this.onImageLoaded();
    } else {
      image.addEventListener("load", () => {
        this.onImageLoaded();
      });
    }
  }

  public get isLoaded(): boolean {
    return this.loaded;
  }

  private _activeRow: number = 0;

  get activeRow(): number {
    return this._activeRow;
  }

  set activeRow(value: number) {
    if (this.spriteMetadata.onlyRow == undefined) {
      this._activeRow = value;
      this.activeItem = this.calculateActiveItem();
    }
  }

  private _activeCol: number = 0;

  get activeCol(): number {
    return this._activeCol;
  }

  set activeCol(value: number) {
    if (this.spriteMetadata.onlyCol == undefined) {
      this._activeCol = value;
      this.activeItem = this.calculateActiveItem();
    }
  }

  public tryNextSprite() {
    super.tryNextSprite();

    this.updateActiveItemCoords();
  }

  public tryNextCol(
    minPosition: number = 0,
    maxPosition: number = this.cols,
    speedMultiplier?: number,
  ) {
    if (this.canDrawNextSprite(speedMultiplier)) {
      this.activeCol = Math.max(
        minPosition,
        (this.activeCol + 1) % maxPosition,
      );
    }
  }

  public tryNextRow(
    minPosition: number = 0,
    maxPosition: number = this.rows,
    speedMultiplier?: number,
  ) {
    if (this.canDrawNextSprite(speedMultiplier)) {
      this.activeRow = Math.max(
        minPosition,
        (this.activeRow + 1) % maxPosition,
      );
    }
  }

  public getMaxItem(): number {
    return this.cols * this.rows;
  }

  private onImageLoaded() {
    const sizeX = this.spriteMetadata.chunkSizeX;
    const sizeY = this.spriteMetadata.chunkSizeY;

    this.cols = this.spriteMetadata.maxCols
      ? this.spriteMetadata.maxCols
      : Math.floor(this.image.width / sizeX);
    this.rows = this.spriteMetadata.maxRows
      ? this.spriteMetadata.maxRows
      : Math.floor(this.image.height / sizeY);

    this.loaded = true;
  }

  private updateActiveItemCoords() {
    this.activeRow = Math.floor(this.activeItem / this.cols);
    this.activeCol = this.activeItem % this.cols;
  }

  private calculateActiveItem(): number {
    return this._activeRow * this.cols + this._activeCol;
  }
}
