import { GameWorldActivity } from "@/library/impl/activity/world";
import type { CanvasRenderer } from "@/library/impl/visualizer/renderer";
import type { Level } from "@/library/api/level";
import { Rect2D } from "@/library/api/model/rect";
import { DefaultEntityFactory } from "@/library/impl/entity/factory";
import { AssetsLevelBuilder2D } from "@/library/impl/level";
import { ColorModelLoader, ImageModelLoader } from "@/library/impl/models";
import { RPGCanvasVisualizer } from "@/library/impl/visualizer/world";
import { EggPlayerController } from "@/testgame/entity";
import type { Entity } from "@/library/api/model/entity";
import { StaticEntity } from "@/library/api/model/entity";
import { randomInteger } from "@/library/api/utils/random";

export class EggWorldActivity extends GameWorldActivity<CanvasRenderer> {
  private readonly wallWeight: number = 1;

  constructor(assetsUrl: string, renderer: CanvasRenderer) {
    const entityFactory = new DefaultEntityFactory();

    const levelBuilder = new AssetsLevelBuilder2D(
      assetsUrl + "levels/level1.json",
      new Map(
        Object.entries({
          player: () => new EggPlayerController(),
        }),
      ),
    );

    const fallbackModelLoader = new ColorModelLoader();
    const modelLoader = new ImageModelLoader(
      assetsUrl + "image/",
      fallbackModelLoader,
    );

    const visualizer = new RPGCanvasVisualizer(renderer, false);

    super(visualizer, levelBuilder, entityFactory, modelLoader);
  }

  public async onLevelLoaded(level: Level<Rect2D>) {
    await super.onLevelLoaded(level);

    const content = await this.generateWorldContent(level);
    level.attachAllEntities(content);
  }

  public async generateWorldBounds(
    level: Level<Rect2D>,
  ): Promise<Array<Entity<Rect2D>>> {
    const mapSizeX = level.dimensions.sizeX;
    const mapSizeY = level.dimensions.sizeY;

    const wallModel = await this.modelLoader.load("black");
    const groundModel = await this.modelLoader.load("yellowgreen");

    const top = new StaticEntity(
      "map_bounds_wall",
      wallModel,
      true,
      50,
      new Rect2D(mapSizeX, this.wallWeight, 0, 0),
      null,
    );

    const bottom = new StaticEntity(
      "map_bounds_wall",
      wallModel,
      true,
      50,
      new Rect2D(mapSizeX, this.wallWeight, 0, mapSizeX - this.wallWeight),
      null,
    );

    const left = new StaticEntity(
      "map_bounds_wall",
      wallModel,
      true,
      50,
      new Rect2D(this.wallWeight, mapSizeY, 0, 0),
      null,
    );

    const right = new StaticEntity(
      "map_bounds_wall",
      wallModel,
      true,
      50,
      new Rect2D(this.wallWeight, mapSizeY, mapSizeX - this.wallWeight, 0),
      null,
    );

    const ground = new StaticEntity(
      "map_ground",
      groundModel,
      false,
      10000,
      new Rect2D(
        mapSizeX - this.wallWeight * 2,
        mapSizeY - this.wallWeight * 2,
        this.wallWeight,
        this.wallWeight,
      ),
      null,
    );

    return [top, bottom, left, right, ground];
  }

  public async generateWorldContent(
    level: Level<Rect2D>,
  ): Promise<Array<Entity<Rect2D>>> {
    const result = new Array<Entity<Rect2D>>();

    const eggModel = await this.modelLoader.load("egg.png");
    const houseModel = await this.modelLoader.load("chicken_house.png");

    const defaultEggRect = new Rect2D(0.5, 0.5);
    const defaultHouseRect = new Rect2D(3, 3);

    const housesCount = randomInteger(2, 5);
    for (let i = 0; i < 1; i++) {
      const startPosition = new Rect2D(
        0,
        0,
        randomInteger(
          this.wallWeight,
          level.dimensions.sizeX - 10 - this.wallWeight,
        ),
        randomInteger(
          this.wallWeight,
          level.dimensions.sizeY - 10 - this.wallWeight,
        ),
      );

      const house = new StaticEntity(
        "chicken_house",
        houseModel,
        true,
        600,
        defaultHouseRect.plusRectCoordinates(startPosition),
        null,
      );

      result.push(house);

      const eggsCount = randomInteger(1, 3);

      for (let j = 0; j < eggsCount; j++) {
        const eggPosition = startPosition.copy();
        eggPosition.posX += randomInteger(5, 8);
        eggPosition.posY += randomInteger(5, 8);

        const egg = new StaticEntity(
          "egg",
          eggModel,
          true,
          600,
          defaultEggRect.plusRectCoordinates(eggPosition),
          null,
        );

        result.push(egg);
      }
    }

    return result;
  }
}
