import { GameWorldActivity } from "@/library/impl/activity/world";
import { CanvasRenderer } from "@/library/impl/visualizer/renderer";
import { LevelBuilder } from "@/library/api/level";
import { Rect2D } from "@/library/api/data/rect";
import { DefaultEntityFactory } from "@/library/impl/entity/factory";
import {
  FullMapVisualizer,
  RPGCanvasVisualizer,
} from "@/library/impl/visualizer/world";
import {
  FinalLocationPlayerController,
  StartLocationPlayerController,
  WorldPlayerController
} from "@/examples/egggame/entity/player";
import type { EntityFactory } from "@/library/api/data/entity";
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
import { EggLevelBuilder } from "@/examples/egggame/level/loader";
import { DeathscreenActivity } from "@/examples/egggame/actiivity/deathscreen";
import { config } from "@/examples/egggame/config";

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
    isDeveloperMode: boolean = false,
  ) {
    const controllers = {
      player_start: (data?: any) =>
        new StartLocationPlayerController(data?.speed),
      player_world: (data?: any) => new WorldPlayerController(data?.speed),
      player_finish: (data?: any) =>
        new FinalLocationPlayerController(data?.speed),
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

    const levelBuilder = new EggLevelBuilder(
      config.resources.levelUrl,
      new Map(Object.entries(controllers)),
    );

    const fallbackModelLoader = new ColorModelLoader();
    const modelLoader = new AssetModelLoader(
      config.resources.imageUrl,
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

  public onPlayerDeath() {
    const deathscreen = this.createActivity(DeathscreenActivity);
    this.startActivity(deathscreen);

    this.finish();
  }
}
