import { Looper } from "@/library/api/looper";

export class SimpleLooper extends Looper {
  startLogicLooper(func: () => boolean): void {
    const interval = setInterval(() => {
      const resume = func();

      if (!resume) {
        clearInterval(interval);
      }
    }, 10);
  }

  startUiLooper(func: () => boolean): void {
    const draw = () => {
      const resume = func();

      if (resume) {
        requestAnimationFrame(draw);
      }
    };

    requestAnimationFrame(draw);
  }
}
