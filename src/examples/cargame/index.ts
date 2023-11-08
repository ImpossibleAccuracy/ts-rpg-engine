import { GameEngine, GameState } from "@/library/api/engine";
import { CanvasRenderer } from "@/library/impl/visualizer/renderer";
import { MouseKeyboardController } from "@/library/impl/controller";
import { SimpleLooper } from "@/library/impl/looper";
import { CarWorldActivity } from "@/examples/cargame/world";

export function createCarGame(canvas: HTMLCanvasElement, assetsUrl: string) {
  return new CarGame(canvas, assetsUrl, GameState.RUNNING);
}

export class CarGame extends GameEngine<CanvasRenderer> {
  constructor(canvas: HTMLCanvasElement, assetsUrl: string, state: GameState) {
    const renderer = new CanvasRenderer(canvas);

    const startActivity = new CarWorldActivity(assetsUrl, renderer);

    startActivity.load();

    super(
      new MouseKeyboardController(),
      new SimpleLooper(),
      startActivity,
      state,
    );
  }
}
