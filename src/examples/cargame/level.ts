import { type EntityFactory, Level, LevelBuilder } from "@/library/api/level";
import { Rect2D } from "@/library/api/data/rect";
import { CarController } from "@/examples/cargame/entity/player";
import { WallController } from "@/examples/cargame/entity/wall";

import { ModelLoader } from "@/library/impl/models/loaders";

export class CarLevel extends LevelBuilder<Rect2D> {
  public static readonly roadSize: number = 12;
  public static readonly wallSize: number = 1;
  public static readonly carSizeX: number = 1;
  public static readonly carSizeY: number = 1.7;

  async build(
    entityFactory: EntityFactory<Rect2D>,
    modelLoader: ModelLoader,
  ): Promise<Level<Rect2D>> {
    const wallModel = await modelLoader.load("border.png");
    const carModel = await modelLoader.load("car1.png");
    const mapGroundModel = await modelLoader.load("world_bg.png");
    const roadGroundModel = await modelLoader.load("silver");

    const background = entityFactory.buildEntity(
      "map_ground",
      null,
      mapGroundModel,
      false,
      10000,
      new Rect2D(-1, -1, -1, 0),
      null,
      null,
    );

    const road = entityFactory.buildEntity(
      "road_ground",
      null,
      roadGroundModel,
      false,
      9000,
      new Rect2D(
        CarLevel.roadSize - CarLevel.wallSize * 2,
        0,
        CarLevel.wallSize,
        0,
      ),
      null,
      null,
    );

    const leftWall = entityFactory.buildEntity(
      "wall",
      new WallController(),
      wallModel,
      true,
      500,
      new Rect2D(CarLevel.wallSize, 24, 0, 0),
      null,
      null,
    );

    const rightWall = entityFactory.buildEntity(
      "wall",
      new WallController(),
      wallModel,
      true,
      500,
      new Rect2D(
        CarLevel.wallSize,
        24,
        CarLevel.roadSize - CarLevel.wallSize,
        0,
      ),
      null,
      null,
    );

    const car = entityFactory.buildEntity(
      "car",
      new CarController(),
      carModel,
      true,
      500,
      new Rect2D(
        CarLevel.carSizeX,
        CarLevel.carSizeY,
        CarLevel.roadSize / 2 - CarLevel.carSizeX / 2,
        -CarLevel.carSizeY * 2,
      ),
      null,
      null,
    );

    return new Level(
      [background, road, leftWall, rightWall, car],
      new Rect2D(CarLevel.roadSize, -1),
    );
  }
}
