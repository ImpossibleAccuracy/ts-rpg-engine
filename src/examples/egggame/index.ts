import { GameEngine, GameState } from "@/library/api/engine";
import { MouseKeyboardController } from "@/library/impl/controller";
import { SimpleLooper } from "@/library/impl/looper";
import { CanvasRenderer } from "@/library/impl/visualizer/renderer";
import { EggWorldActivity } from "@/examples/egggame/world";

export async function createEggWorld(
  canvas: HTMLCanvasElement,
  assetsUrl: string,
  isDeveloperMode: boolean = false,
) {
  const renderer = new CanvasRenderer(canvas);
  const controller = new MouseKeyboardController();
  const looper = new SimpleLooper();

  const startActivity = EggWorldActivity.build(
    renderer,
    assetsUrl,
    "levels/level1.json",
    isDeveloperMode,
  );

  await startActivity.load();

  return new GameEngine(controller, looper, startActivity, GameState.RUNNING);
}
