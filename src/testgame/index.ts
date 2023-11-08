import { GameEngine, GameState } from "@/library/api/engine";
import { MouseKeyboardController } from "@/library/impl/controller";
import { SimpleLooper } from "@/library/impl/looper";
import { CanvasRenderer } from "@/library/impl/visualizer/renderer";
import { EggWorldActivity } from "@/testgame/world";

export function createEggWorld(canvas: HTMLCanvasElement, assetsUrl: string) {
  return new TestGameEngine(canvas, assetsUrl, GameState.RUNNING);
}

export class TestGameEngine extends GameEngine<CanvasRenderer> {
  constructor(canvas: HTMLCanvasElement, assetsUrl: string, state: GameState) {
    const renderer = new CanvasRenderer(canvas);

    const startActivity = new EggWorldActivity(assetsUrl, renderer);

    startActivity.load();

    super(
      new MouseKeyboardController(),
      new SimpleLooper(),
      startActivity,
      state,
    );
  }
}
