export abstract class Model {}

export interface SpriteMetaData {
  isAutomatic: boolean;
  lastDraw?: number;
  updateRate?: number;
}

export class DefaultSpriteMetaData implements SpriteMetaData {
  public lastDraw: number;
  public isAutomatic: boolean;

  constructor() {
    this.lastDraw = -1;
    this.isAutomatic = false;
  }
}

export abstract class SpriteModel<
  META extends SpriteMetaData = SpriteMetaData,
> extends Model {
  public readonly spriteMetadata: META;
  protected activeItem: number;

  protected constructor(spriteMetadata: META, activeItemIndex: number) {
    super();
    this.spriteMetadata = spriteMetadata;
    this.activeItem = activeItemIndex;
  }

  public setActiveItem(item: number) {
    this.activeItem = item % this.getMaxItem();
  }

  public tryNextSprite() {
    if (this.tryDrawNextSprite()) {
      this.setActiveItem(this.activeItem + 1);
    }
  }

  abstract getMaxItem(): number;

  protected tryDrawNextSprite(): boolean {
    const data = this.spriteMetadata;
    const currentTimeMillis = Date.now();

    if (data.updateRate && data.updateRate > 0) {
      if (!data.lastDraw || data.lastDraw < 0) {
        data.lastDraw = currentTimeMillis;
      } else if (currentTimeMillis - data.lastDraw >= data.updateRate) {
        data.lastDraw += data.updateRate;
        return true;
      }
    }

    return false;
  }
}

export class SpriteArrayModel<M extends Model> extends SpriteModel {
  private readonly items: Array<M>;

  constructor(
    items: Array<M>,
    spriteMetadata: SpriteMetaData,
    activeItemIndex: number = 0,
  ) {
    super(spriteMetadata, activeItemIndex);
    this.items = items;
  }

  public get activeSprite(): Model {
    return this.items[this.activeItem];
  }

  getMaxItem(): number {
    return this.items.length;
  }
}

export abstract class ModelLoader {
  public readonly fallbackModelLoader?: ModelLoader;

  protected constructor(fallbackModelLoader?: ModelLoader) {
    this.fallbackModelLoader = fallbackModelLoader;
  }

  abstract load(path: string, meta?: unknown): Promise<Model>;

  public loadSprite(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    name: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    spriteMetadata?: unknown,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    meta?: unknown,
  ): Promise<SpriteModel> {
    throw new Error("Not yet implemented");
  }

  public async loadSpriteFromArray(
    items: Array<string>,
    spriteMetadata: SpriteMetaData = new DefaultSpriteMetaData(),
    meta?: unknown,
  ): Promise<SpriteModel> {
    try {
      const promises = items.map((el) => this.load(el, meta));

      const models = await Promise.all(promises);

      return new SpriteArrayModel(models, spriteMetadata, 0);
    } catch (e) {
      if (this.fallbackModelLoader) {
        return await this.fallbackModelLoader.loadSpriteFromArray(
          items,
          spriteMetadata,
          meta,
        );
      } else {
        throw e;
      }
    }
  }
}
