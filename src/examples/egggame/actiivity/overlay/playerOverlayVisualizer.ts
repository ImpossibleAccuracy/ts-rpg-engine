import { AbstractVisualizer } from "@/library/api/visualizer";
import { CanvasRenderer } from "@/library/impl/visualizer/renderer";
import type { PlayerOverlayState } from "@/examples/egggame/actiivity/overlay/playerOverlay";
import type { ModelLoader } from "@/library/impl/models/loaders";
import type { Model } from "@/library/api/models";

export class PlayerOverlayVisualizer extends AbstractVisualizer<CanvasRenderer> {
  private static readonly StartPaddingX: number = 24;
  private static readonly StartPaddingY: number = 16;
  private static readonly EggSizeX: number = 45;
  private static readonly EggSizeY: number = 50;

  private static readonly TextMargin: number = 16;
  private static readonly FontSize: number = 24;
  private static readonly FontName: string = "Courier New";

  private eggModel?: Model;

  constructor(
    renderer: CanvasRenderer,
    private readonly modelLoader: ModelLoader,
  ) {
    super(renderer);

    modelLoader.load("ui/icons/icon_egg.png").then((el) => {
      this.eggModel = el;
    });
  }

  public drawOverlay(overlay: PlayerOverlayState) {
    if (!this.eggModel) return;

    this.renderer.drawModelManually(
      this.eggModel,
      PlayerOverlayVisualizer.StartPaddingX,
      PlayerOverlayVisualizer.StartPaddingY,
      PlayerOverlayVisualizer.EggSizeX,
      PlayerOverlayVisualizer.EggSizeY,
    );

    this.renderer.context.font = `${PlayerOverlayVisualizer.FontSize}px bold ${PlayerOverlayVisualizer.FontName}`;
    this.renderer.context.fillStyle = "black";

    this.renderer.context.fillText(
      `x ${overlay.totalEggsCount - overlay.pickedUpEggsCount}`,
      PlayerOverlayVisualizer.StartPaddingX +
        PlayerOverlayVisualizer.EggSizeX +
        PlayerOverlayVisualizer.TextMargin,
      PlayerOverlayVisualizer.StartPaddingY +
        PlayerOverlayVisualizer.FontSize +
        5,
    );
  }
}
