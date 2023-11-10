import {
  DefaultSpriteMetaData,
  type SpriteMetaData,
  SpriteModel,
} from "@/library/api/visualizer/model";

export interface SpriteImageMetaData extends SpriteMetaData {
  chunkSizeX: number;
  chunkSizeY: number;
  spriteOffsetX?: number;
  spriteOffsetY?: number;
  spriteWidth?: number;
  spriteHeight?: number;
  defaultActiveCol?: number;
  defaultActiveRow?: number;
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
  public readonly image: HTMLImageElement;
  public cols: number;
  public rows: number;

  constructor(image: HTMLImageElement, spriteMetadata: SpriteImageMetaData) {
    super(spriteMetadata, 0);
    this.image = image;

    this.cols = 0;
    this.rows = 0;

    this._activeRow = spriteMetadata.defaultActiveRow ?? 0;
    this._activeCol = spriteMetadata.defaultActiveCol ?? 0;

    image.addEventListener("load", () => {
      const sizeX = this.spriteMetadata.chunkSizeX;
      const sizeY = this.spriteMetadata.chunkSizeY;

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

  public tryNextSprite() {
    super.tryNextSprite();

    this.updateActiveItemCoords();
  }

  public tryNextCol(maxPosition: number = this.cols, speedMultiplier?: number) {
    if (this.canDrawNextSprite(speedMultiplier)) {
      this.activeCol = (this.activeCol + 1) % maxPosition;
    }
  }

  public tryNextRow(maxPosition: number = this.rows, speedMultiplier?: number) {
    if (this.canDrawNextSprite(speedMultiplier)) {
      this.activeRow = (this.activeRow + 1) % maxPosition;
    }
  }

  public getMaxItem(): number {
    return this.cols * this.rows;
  }

  private updateActiveItemCoords() {
    this._activeRow = Math.floor(this.activeItem / this.cols);
    this._activeCol = this.activeItem % this.cols;
  }

  private calculateActiveItem(): number {
    return this._activeRow * this.cols + this._activeCol;
  }
}
