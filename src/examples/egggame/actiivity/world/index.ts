import { GameWorldActivity } from "@/library/impl/activity/world";
import { CanvasRenderer } from "@/library/impl/visualizer/renderer";
import { Level, LevelBuilder } from "@/library/api/level";
import { Rect2D } from "@/library/api/data/rect";
import { DefaultEntityFactory } from "@/library/impl/entity/factory";
import { AssetsLevelBuilder2D } from "@/library/impl/level";
import {
  FullMapVisualizer,
  RPGCanvasVisualizer,
} from "@/library/impl/visualizer/world";
import { EggPlayerController } from "@/examples/egggame/entity/player";
import type { EntityFactory } from "@/library/api/data/entity";
import { Entity } from "@/library/api/data/entity";
import { LevelVisualizer } from "@/library/api/visualizer";
import {
  GoblinController,
  SlimeController,
  WraithController,
} from "@/examples/egggame/entity/enemy";
import { QuestGiverNpcController } from "@/examples/egggame/entity/npc";

import { ColorModelLoader } from "@/library/impl/models/loaders/colorModelLoader";
import { AssetModelLoader } from "@/library/impl/models/loaders/assetModelLoader";
import { ModelLoader } from "@/library/impl/models/loaders";
import { fetchAllEggs } from "@/examples/egggame/data/repository";

export class EggWorldActivity extends GameWorldActivity<
  CanvasRenderer,
  Rect2D
> {
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
      npc_quest_qiver: (data?: any) => new QuestGiverNpcController(),
      slime: (data?: any) =>
        new SlimeController(
          data?.speed,
          data?.attackDistance,
          data?.fieldOfView,
        ),
      goblin: (data?: any) =>
        new GoblinController(
          data?.speed,
          data?.attackDistance,
          data?.fieldOfView,
        ),
      wraith: (data?: any) =>
        new WraithController(
          data?.speed,
          data?.attackDistance,
          data?.fieldOfView,
        ),
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

    const activity = new EggWorldActivity(
      visualizer,
      levelBuilder,
      entityFactory,
      modelLoader,
    );

    if (isDeveloperMode) {
      window.addEventListener("keydown", (e) => {
        if (e.key.toLowerCase() === "t") {
          if (
            activity.visualizer instanceof FullMapVisualizer ||
            activity.visualizer instanceof RPGCanvasVisualizer
          ) {
            activity.visualizer.isDebugMode = !activity.visualizer.isDebugMode;
          }
        }

        if (e.key.toLowerCase() === "f") {
          if (activity.visualizer instanceof FullMapVisualizer) {
            activity.visualizer = new RPGCanvasVisualizer(
              renderer,
              activity.visualizer.isDebugMode,
            );
          } else if (activity.visualizer instanceof RPGCanvasVisualizer) {
            activity.visualizer = new FullMapVisualizer(
              renderer,
              activity.visualizer.isDebugMode,
            );
          }
        }
      });
    }

    return activity;
  }

  public async generateWorldBounds(
    level: Level<Rect2D>,
  ): Promise<Array<Entity<Rect2D>>> {
    return [];
  }

  public async generateWorldContent(
    level: Level<Rect2D>,
  ): Promise<Array<Entity<Rect2D>>> {
    const content = new Array<Entity<Rect2D>>();

    const eggs = await fetchAllEggs();
    const eggModel = await this.modelLoader.load("objects/static/egg.png");

    const baseEggRect = new Rect2D(0.5, 0.5, 19.5, 3.5);

    for (const egg of eggs) {
      const eggPosition = new Rect2D(0, 0, egg.x, egg.y);

      const entity = this.entityFactory.buildEntity(
        "egg",
        eggModel,
        true,
        1000,
        baseEggRect.plusRectCoordinates(eggPosition),
        null,
        null,
      );

      content.push(entity);
    }

    return content;
  }
}
