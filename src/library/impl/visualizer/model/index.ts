import { Model, ModelLoader } from "@/library/api/visualizer/model";

export class ColorModel extends Model {
  public readonly color: string;

  constructor(color: string) {
    super();
    this.color = color;
  }
}

export class ColorModelLoader extends ModelLoader<ColorModel> {
  private readonly loadedResources: Map<string, ColorModel> = new Map();

  load(color: string): ColorModel {
    if (this.loadedResources.has(color)) {
      return this.loadedResources.get(color)!;
    }

    const model = new ColorModel(color);

    this.loadedResources.set(color, model);

    return model;
  }
}
