import { Model } from "@/library/api/models";

export class ImageModel extends Model {
  private loaded: boolean;

  constructor(public readonly image: HTMLImageElement) {
    super();

    this.loaded = false;

    image.addEventListener("load", () => {
      this.loaded = true;

      if (this._onload) {
        this._onload();
      }
    });
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
}
