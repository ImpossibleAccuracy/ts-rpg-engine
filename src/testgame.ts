import { GameEngine } from "@/library/api/engine";
import { MouseKeyboardController } from "@/library/impl/controller";
import { SimpleLooper } from "@/library/impl/looper";
import { ColorModel, ColorModelLoader } from "@/library/impl/visualizer/model";
import { PlayerController } from "@/library/impl/entity/player";
import { RPGCanvasVisualizer } from "@/library/impl/visualizer/world";
import { AssetsLevelBuilder2D } from "@/library/impl/level";
import { CanvasRenderer } from "@/library/impl/visualizer/renderer";
import { GameWorldActivity } from "@/library/impl/activity/world";

export class TestGameEngine extends GameEngine<CanvasRenderer> {
  constructor(canvas: HTMLCanvasElement) {
    const renderer = new CanvasRenderer(canvas);

    const levelBuilder = new AssetsLevelBuilder2D<ColorModel>(
      "/src/assets/levels/level1.json",
      new Map(
        Object.entries({
          player_controller: () => new PlayerController(),
        }),
      ),
    );

    const modelLoader = new ColorModelLoader();

    const visualizer = new RPGCanvasVisualizer(renderer);

    const startActivity = new GameWorldActivity(
      visualizer,
      modelLoader,
      levelBuilder,
    );

    startActivity.load();

    super(new MouseKeyboardController(), new SimpleLooper(), startActivity);
  }
}
