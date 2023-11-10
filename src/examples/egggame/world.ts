import { GameWorldActivity } from "@/library/impl/activity/world";
import { CanvasRenderer } from "@/library/impl/visualizer/renderer";
import type { Level, LevelBuilder } from "@/library/api/level";
import { Rect2D } from "@/library/api/model/rect";
import { DefaultEntityFactory } from "@/library/impl/entity/factory";
import { AssetsLevelBuilder2D } from "@/library/impl/level";
import { ImageModelLoader } from "@/library/impl/models/imageModel";
import { RPGCanvasVisualizer } from "@/library/impl/visualizer/world";
import { EggPlayerController } from "@/examples/egggame/entity/player";
import type { Entity, EntityFactory } from "@/library/api/model/entity";
import type { LevelVisualizer } from "@/library/api/visualizer";
import type { ModelLoader } from "@/library/api/visualizer/model";
import {
  GoblinController,
  SlimeController,
  WraithController,
} from "@/examples/egggame/entity/enemy";
import { SimpleNpcController } from "@/examples/egggame/entity/npc";

import { ColorModelLoader } from "@/library/impl/models/colorModel";

export class EggWorldActivity extends GameWorldActivity<
  CanvasRenderer,
  Rect2D
> {
  private readonly wallWeight: number = 1;

  constructor(
    visualizer: LevelVisualizer<CanvasRenderer, Rect2D>,
    levelBuilder: LevelBuilder<Rect2D>,
    entityFactory: EntityFactory<Rect2D>,
    modelLoader: ModelLoader,
  ) {
    super(visualizer, levelBuilder, entityFactory, modelLoader);
  }

  public static build(
    renderer: CanvasRenderer,
    assetsUrl: string,
    levelPath: string,
    isDeveloperMode: boolean = false,
  ) {
    const controllers = {
      player: (data?: any) => new EggPlayerController(data?.speed),
      npc: (data?: any) => new SimpleNpcController(data?.speed),
      slime: (data?: any) =>
        new SlimeController(data?.speed, data?.attackDistance),
      goblin: (data?: any) =>
        new GoblinController(data?.speed, data?.attackDistance),
      wraith: (data?: any) =>
        new WraithController(data?.speed, data?.attackDistance),
    };

    const entityFactory = new DefaultEntityFactory<Rect2D>();

    const levelBuilder = new AssetsLevelBuilder2D(
      assetsUrl + levelPath,
      new Map(Object.entries(controllers)),
    );

    const fallbackModelLoader = new ColorModelLoader();
    const modelLoader = new ImageModelLoader(
      assetsUrl + "image/",
      fallbackModelLoader,
    );

    const visualizer = new RPGCanvasVisualizer(renderer, isDeveloperMode);

    window.addEventListener("keydown", (e) => {
      if (e.ctrlKey) {
        visualizer.isDebugMode = !visualizer.isDebugMode;
      }
    });

    return new EggWorldActivity(
      visualizer,
      levelBuilder,
      entityFactory,
      modelLoader,
    );
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
    const groundModel = await this.modelLoader.load("#b9bd1c");

    const top = this.entityFactory.buildEntity(
      "map_bounds_wall",
      wallModel,
      true,
      50,
      new Rect2D(mapSizeX, this.wallWeight, 0, 0),
      null,
      null,
    );

    const bottom = this.entityFactory.buildEntity(
      "map_bounds_wall",
      wallModel,
      true,
      50,
      new Rect2D(mapSizeX, this.wallWeight, 0, mapSizeY - this.wallWeight),
      null,
      null,
    );

    const left = this.entityFactory.buildEntity(
      "map_bounds_wall",
      wallModel,
      true,
      50,
      new Rect2D(this.wallWeight, mapSizeY, 0, 0),
      null,
      null,
    );

    const right = this.entityFactory.buildEntity(
      "map_bounds_wall",
      wallModel,
      true,
      50,
      new Rect2D(this.wallWeight, mapSizeY, mapSizeX - this.wallWeight, 0),
      null,
      null,
    );

    const ground = this.entityFactory.buildEntity(
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
      null,
    );

    return [top, bottom, left, right, ground];
  }

  public async generateWorldContent(
    level: Level<Rect2D>,
  ): Promise<Array<Entity<Rect2D>>> {
    const result = new Array<Entity<Rect2D>>();

    /*const eggModel = await this.modelLoader.load("egg.png");
    const houseModel = await this.modelLoader.load("chicken_house.png");

    const defaultEggRect = new Rect2D(0.5, 0.5);
    const defaultHouseRect = new Rect2D(2.3, 3);

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

      const house = this.entityFactory.buildEntity(
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

        const egg = this.entityFactory.buildEntity(
          "egg",
          eggModel,
          true,
          600,
          defaultEggRect.plusRectCoordinates(eggPosition),
          null,
        );

        result.push(egg);
      }
    }*/

    return result;
  }
}
