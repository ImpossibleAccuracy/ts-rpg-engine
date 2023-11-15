import { GameEngine, GameState } from "@/library/api/engine";
import { MouseKeyboardController } from "@/library/impl/controller";
import { SimpleLooper } from "@/library/impl/looper";
import { CanvasRenderer } from "@/library/impl/visualizer/renderer";
import { EggWorldActivity } from "@/examples/egggame/actiivity/world";

export async function createEggWorld(
  canvas: HTMLCanvasElement,
  isDeveloperMode: boolean = false,
) {
  const renderer = new CanvasRenderer(canvas);
  const controller = new MouseKeyboardController();
  const looper = new SimpleLooper();

  const startActivity = EggWorldActivity.build(renderer, isDeveloperMode);

  startActivity.loadLevel("start");

  return new GameEngine(controller, looper, startActivity, GameState.RUNNING);
}
