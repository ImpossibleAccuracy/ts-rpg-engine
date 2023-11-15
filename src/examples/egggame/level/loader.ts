import { AssetsLevelBuilder2D } from "@/library/impl/level";
import type {
  EntityControllerFactory,
  EntityFactory,
} from "@/library/api/data/entity";
import { Rect2D } from "@/library/api/data/rect";
import type { ModelLoader } from "@/library/impl/models/loaders";
import type { Level } from "@/library/api/level";
import {
  fetchAllEggs,
  fetchAllGoblins,
} from "@/examples/egggame/data/repository";
import type { SpriteMetaData } from "@/library/api/models/spriteModel";
import { GoblinController } from "@/examples/egggame/entity/enemy";

export class EggLevelBuilder extends AssetsLevelBuilder2D {
  private static readonly SpawnStartX: number = 19;
  private static readonly SpawnStartY: number = 2.5;

  constructor(
    baseLevelPath: string,
    controllers: Map<string, EntityControllerFactory<Rect2D>>,
  ) {
    super(baseLevelPath, controllers);
  }

  async build(
    mapName: string,
    entityFactory: EntityFactory<Rect2D>,
    modelLoader: ModelLoader,
  ): Promise<Level<Rect2D>> {
    const level = await super.build(
      mapName + ".json",
      entityFactory,
      modelLoader,
    );

    if (mapName.endsWith("_world")) {
      await this.loadWorldContent(level, entityFactory, modelLoader);
    }

    return level;
  }

  private async loadWorldContent(
    level: Level<Rect2D>,
    entityFactory: EntityFactory<Rect2D>,
    modelLoader: ModelLoader,
  ) {
    const step1 = this.loadEggs(level, entityFactory, modelLoader);
    const step2 = this.loadEnemies(level, entityFactory, modelLoader);

    await Promise.all([step1, step2]);
  }

  private async loadEggs(
    level: Level<Rect2D>,
    entityFactory: EntityFactory<Rect2D>,
    modelLoader: ModelLoader,
  ) {
    const eggs = await fetchAllEggs();
    const eggModel = await modelLoader.load("objects/static/egg.png");

    for (const egg of eggs) {
      const eggPosition = new Rect2D(
        0.5,
        0.5,
        egg.x + EggLevelBuilder.SpawnStartX,
        egg.y + EggLevelBuilder.SpawnStartY,
      );

      const entity = entityFactory.buildEntity(
        "egg",
        eggModel,
        true,
        2000,
        eggPosition,
        null,
        null,
      );

      level.attachEntity(entity);
    }
  }

  private async loadEnemies(
    level: Level<Rect2D>,
    entityFactory: EntityFactory<Rect2D>,
    modelLoader: ModelLoader,
  ) {
    const enemies = await fetchAllGoblins();

    for (const enemy of enemies) {
      const enemyModel = await modelLoader.loadSprite("entity/enemy/goblin.png", {
        chunkSizeX: 64,
        chunkSizeY: 64,
        updateRate: 200,
        isAutomatic: false,
      } as SpriteMetaData);

      const enemyRect = new Rect2D(
        1,
        1,
        enemy.x + EggLevelBuilder.SpawnStartX,
        enemy.y + EggLevelBuilder.SpawnStartY,
      );

      const entity = entityFactory.buildEntity(
        "enemy",
        enemyModel,
        true,
        2000,
        enemyRect,
        null,
        new GoblinController(4, 0.2, 4, 10),
      );

      level.attachEntity(entity);
    }
  }
}
