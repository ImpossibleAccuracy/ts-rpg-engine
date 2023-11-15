import { AbstractActivity } from "@/library/api/activity";
import { CanvasRenderer } from "@/library/impl/visualizer/renderer";
import { PlayerOverlayVisualizer } from "@/examples/egggame/actiivity/overlay/playerOverlayVisualizer";
import type { GameEngine } from "@/library/api/engine";
import { GameWorldActivity } from "@/library/impl/activity/world";
import { AssetModelLoader } from "@/library/impl/models/loaders/assetModelLoader";
import type { ModelLoader } from "@/library/impl/models/loaders";

export interface PlayerOverlayState {
  totalEggsCount: number;
  pickedUpEggsCount: number;
}

export class PlayerOverlayActivity extends AbstractActivity<
  CanvasRenderer,
  PlayerOverlayVisualizer
> {
  private isOverlayDataLoaded: boolean = false;

  private readonly state: PlayerOverlayState = {
    totalEggsCount: -1,
    pickedUpEggsCount: -1,
  };

  constructor(renderer: CanvasRenderer, modelLoader: ModelLoader) {
    super(new PlayerOverlayVisualizer(renderer, modelLoader));
  }

  public onAttach(gameEngine: GameEngine<CanvasRenderer>) {
    super.onAttach(gameEngine);

    if (!this.isOverlayDataLoaded) {
      this.loadOverlayData();
    }
  }

  public draw(): void {
    if (this.isOverlayDataLoaded) {
      this.visualizer.drawOverlay(this.state);
    }
  }

  public update(): void {
    if (!this.isOverlayDataLoaded) {
      this.loadOverlayData();
    }

    if (!this.isOverlayDataLoaded) return;

    const world = this.requireGameWorldActivity();

    const eggs = world.level.findAllEntitiesByType("egg");

    this.state.pickedUpEggsCount = this.state.totalEggsCount - eggs.length;
  }

  private loadOverlayData() {
    const world = this.requireGameWorldActivity();

    if (world.isLevelLoaded) {
      const eggs = world.level.findAllEntitiesByType("egg");

      this.state.totalEggsCount = eggs.length;

      this.isOverlayDataLoaded = true;
    }
  }

  private requireGameWorldActivity() {
    const gameEngine = this.requireGameEngine();

    const world = gameEngine.findActivity(
      (a) => a instanceof GameWorldActivity,
    );

    if (!world || !(world instanceof GameWorldActivity)) {
      throw new Error("Overlay must be attached after GameWorldActivity");
    }

    return world;
  }
}
