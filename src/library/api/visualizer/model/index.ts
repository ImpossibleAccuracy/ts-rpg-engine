export abstract class Model {}

export interface SpriteMetaData {
  lastDraw: number;
}

export class SpriteModel<M extends Model> extends Model {
  public readonly metadata: SpriteMetaData;
  public readonly updateRate: number;

  private readonly items: Array<M>;
  private activeItemIndex: number;

  constructor(items: Array<M>, updateRate: number, activeSprite: number = 0) {
    super();
    this.items = items;
    this.activeItemIndex = activeSprite;
    this.updateRate = updateRate;

    this.metadata = {
      lastDraw: -1,
    };
  }

  public get activeSprite(): Model {
    return this.items[this.activeItemIndex];
  }

  public nextSprite() {
    this.activeItemIndex = (this.activeItemIndex + 1) % this.items.length;
  }
}

export abstract class ModelLoader<M extends Model> {
  abstract load(path: string): M;

  public loadSprite(
    items: Array<string>,
    updateRate: number = 0,
  ): SpriteModel<M> {
    const models = items.map((el) => this.load(el));

    return new SpriteModel(models, updateRate, 0);
  }
}
