import { GameWorldActivity } from "@/library/impl/activity/world";
import { CanvasRenderer } from "@/library/impl/visualizer/renderer";
import { Level, LevelBuilder } from "@/library/api/level";
import { Rect2D } from "@/library/api/data/rect";
import { DefaultEntityFactory } from "@/library/impl/entity/factory";
import { AssetsLevelBuilder2D } from "@/library/impl/level";
import { RPGCanvasVisualizer } from "@/library/impl/visualizer/world";
import { EggPlayerController } from "@/examples/egggame/entity/player";
import type { EntityFactory } from "@/library/api/data/entity";
import { Entity } from "@/library/api/data/entity";
import { LevelVisualizer } from "@/library/api/visualizer";
import {
  GoblinController,
  SlimeController,
  WraithController,
} from "@/examples/egggame/entity/enemy";
import { SimpleNpcController } from "@/examples/egggame/entity/npc";

import { ColorModelLoader } from "@/library/impl/models/loaders/colorModelLoader";
import { AssetModelLoader } from "@/library/impl/models/loaders/assetModelLoader";
import { ModelLoader } from "@/library/impl/models/loaders";
import type { TilesetItem } from "@/library/impl/models/tilesetModel";

export class EggWorldActivity extends GameWorldActivity<
  CanvasRenderer,
  Rect2D
> {
  private readonly wallWeight: number = 1;
  private readonly paddingX: number = 20;
  private readonly paddingY: number = 20;
  private readonly wallInset = 0.5;

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
    const modelLoader = new AssetModelLoader(
      assetsUrl + "image/",
      fallbackModelLoader,
    );

    const visualizer = new RPGCanvasVisualizer(renderer);

    if (isDeveloperMode) {
      window.addEventListener("keydown", (e) => {
        if (e.ctrlKey) {
          visualizer.isDebugMode = !visualizer.isDebugMode;
        }
      });
    }

    return new EggWorldActivity(
      visualizer,
      levelBuilder,
      entityFactory,
      modelLoader,
    );
  }

  public async generateWorldBounds(
    level: Level<Rect2D>,
  ): Promise<Array<Entity<Rect2D>>> {
    const mapSizeX = level.dimensions.sizeX;
    const mapSizeY = level.dimensions.sizeY;

    const wallModel = await this.modelLoader.load("white");

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

    return [top, bottom, left, right];
  }

  public async generateWorldContent(
    level: Level<Rect2D>,
  ): Promise<Array<Entity<Rect2D>>> {
    const mapSizeX = level.dimensions.sizeX;
    const mapSizeY = level.dimensions.sizeY;

    const water = await this.createWater(mapSizeX, mapSizeY);
    const ground = await this.createMapGround(mapSizeX, mapSizeY);
    const waterWalls = await this.createInvisibleWalls(mapSizeX, mapSizeY);

    return [water, ground, ...waterWalls];
  }

  private async createMapGround(
    mapSizeX: number,
    mapSizeY: number,
  ): Promise<Entity<Rect2D>> {
    const tileSize = 64;
    const groundSizeX = mapSizeX - this.paddingX * 2;
    const groundSizeY = mapSizeY - this.paddingY * 2;

    const groundModelTiles = this.createGroundTiles(
      tileSize,
      groundSizeX,
      groundSizeY,
    );

    const groundModel = await this.modelLoader.loadTileset(
      "tilesets/grass.png",
      groundModelTiles,
    );

    return this.entityFactory.buildEntity(
      "map_foreground",
      groundModel,
      false,
      10000,
      new Rect2D(
        mapSizeX - this.paddingX * 2,
        mapSizeY - this.paddingY * 2,
        this.paddingX,
        this.paddingY,
      ),
      null,
      null,
    );
  }

  private async createWater(
    mapSizeX: number,
    mapSizeY: number,
  ): Promise<Entity<Rect2D>> {
    const waterTiles = this.createWaterWallsTiles(
      64,
      mapSizeX - this.wallWeight * 2,
      mapSizeY - this.wallWeight * 2,
    );

    const waterModel = await this.modelLoader.loadTileset(
      "tilesets/water.png",
      waterTiles,
    );

    return this.entityFactory.buildEntity(
      "map_background",
      waterModel,
      true,
      20000,
      new Rect2D(
        mapSizeX - this.wallWeight * 2,
        mapSizeY - this.wallWeight * 2,
        this.wallWeight,
        this.wallWeight,
      ),
      null,
      null,
    );
  }

  private async createInvisibleWalls(
    mapSizeX: number,
    mapSizeY: number,
  ): Promise<Array<Entity<Rect2D>>> {
    const invisibleWallModel = await this.modelLoader.load("transparent");

    const topWall = this.entityFactory.buildEntity(
      "map_wall",
      invisibleWallModel,
      true,
      1,
      new Rect2D(
        mapSizeX - this.paddingX * 2 - this.wallInset * 2,
        this.paddingY - this.wallWeight,
        this.paddingX + this.wallInset,
        this.wallWeight,
      ),
      null,
      null,
    );

    const leftWall = this.entityFactory.buildEntity(
      "map_wall",
      invisibleWallModel,
      true,
      1,
      new Rect2D(
        this.paddingX - this.wallWeight + this.wallInset,
        mapSizeY - this.wallWeight * 2,
        this.wallWeight,
        this.wallWeight,
      ),
      null,
      null,
    );

    const rightWall = this.entityFactory.buildEntity(
      "map_wall",
      invisibleWallModel,
      true,
      1,
      new Rect2D(
        this.paddingX - this.wallWeight + this.wallInset,
        mapSizeY - this.wallWeight * 2,
        mapSizeX - this.paddingX - this.wallInset,
        this.wallWeight,
      ),
      null,
      null,
    );

    const bottomWall = this.entityFactory.buildEntity(
      "map_wall",
      invisibleWallModel,
      true,
      1,
      new Rect2D(
        mapSizeX - this.paddingX * 2 - this.wallInset * 2,
        this.paddingY - this.wallWeight + this.wallInset,
        this.paddingX + this.wallInset,
        mapSizeY - this.paddingY - this.wallInset,
      ),
      null,
      null,
    );

    return [topWall, leftWall, rightWall, bottomWall];
  }

  private createGroundTiles(
    tileSize: number,
    groundSizeX: number,
    groundSizeY: number,
  ): Array<TilesetItem> {
    const modelTiles = new Array<TilesetItem>();

    for (let i = 0; i < groundSizeY; i++) {
      for (let j = 0; j < groundSizeX; j++) {
        let tileX: number;
        let tileY: number;

        if (i == 0 && j == 0) {
          tileX = 1;
          tileY = 3;
        } else if (i == groundSizeY - 1 && j == groundSizeX - 1) {
          tileX = 3;
          tileY = 5;
        } else if (i == 0 && j == groundSizeX - 1) {
          tileX = 3;
          tileY = 3;
        } else if (i == groundSizeY - 1 && j == 0) {
          tileX = 1;
          tileY = 5;
        } else if (i == 0) {
          tileX = 2;
          tileY = 3;
        } else if (j == 0) {
          tileX = 1;
          tileY = 4;
        } else if (i == groundSizeY - 1) {
          tileX = 2;
          tileY = 5;
        } else if (j == groundSizeX - 1) {
          tileX = 3;
          tileY = 4;
        } else {
          const a = Math.floor(i + j / (i / j));

          tileX = a % 2;
          tileY = 0;
        }

        const tile = {
          sourceRect: new Rect2D(
            tileSize,
            tileSize,
            tileX * tileSize,
            tileY * tileSize,
          ),
          destinationRect: new Rect2D(1, 1, j, i),
        };

        modelTiles.push(tile);
      }
    }

    return modelTiles;
  }

  private createWaterWallsTiles(
    tileSize: number,
    containerSizeX: number,
    containerSizeY: number,
  ): Array<TilesetItem> {
    const modelTiles = new Array<TilesetItem>();

    for (let i = 0; i < containerSizeY; i++) {
      for (let j = 0; j < containerSizeX; j++) {
        const tileX = j % 4;

        const tile = {
          sourceRect: new Rect2D(tileSize, tileSize, tileX * tileSize, 0),
          destinationRect: new Rect2D(1, 1, j, i),
        };

        modelTiles.push(tile);
      }
    }

    return modelTiles;
  }
}
