import { Model } from "@/library/api/models";

export interface ImageModelMetaData {
  offsetX?: number;
  offsetY?: number;
  width?: number;
  height?: number;
}

export class ImageModel extends Model {
  private loaded: boolean;

  constructor(
    public readonly image: HTMLImageElement,
    public readonly metadata?: ImageModelMetaData,
  ) {
    super();

    this.loaded = false;

    if (image.complete) {
      this.onImageLoaded();
    } else {
      image.addEventListener("load", () => {
        this.onImageLoaded();
      });
    }
  }

  public get width(): number {
    return this.image.width;
  }

  public get height(): number {
    return this.image.height;
  }

  private _onload?: () => void;

  set onload(value: () => void) {
    this._onload = value;

    if (this.loaded) {
      value();
    }
  }

  public get isLoaded(): boolean {
    return this.loaded;
  }

  private onImageLoaded() {
    this.loaded = true;

    if (this._onload) {
      this._onload();
    }
  }
}
