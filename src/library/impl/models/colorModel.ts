import { Model } from "@/library/api/models";

export class ColorModel extends Model {
  public readonly color: string;

  constructor(color: string) {
    super();
    this.color = color;
  }
}

