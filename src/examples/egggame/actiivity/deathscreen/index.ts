import { AbstractActivity } from "@/library/api/activity";
import { CanvasRenderer } from "@/library/impl/visualizer/renderer";
import { DeathscreenVisualizer } from "@/examples/egggame/actiivity/deathscreen/visualizer";
import { Timer } from "@/library/impl/utils/timer";
import { EggWorldActivity } from "@/examples/egggame/actiivity/world";

export class DeathscreenActivity extends AbstractActivity<
  CanvasRenderer,
  DeathscreenVisualizer
> {
  private restartTimer: Timer = new Timer(5000);

  constructor(renderer: CanvasRenderer) {
    super(new DeathscreenVisualizer(renderer));
  }

  public draw(): void {
    this.visualizer.draw(Math.ceil(this.restartTimer.timeLeft / 1000));
  }

  public update(): void {
    if (this.restartTimer.isReady()) {
      const engine = this.requireGameEngine();

      const world = EggWorldActivity.build(this.visualizer.renderer);
      world.loadLevel("level1_world");

      engine.attachActivity(world);

      this.finish();
    }
  }
}
