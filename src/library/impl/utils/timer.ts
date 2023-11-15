export class Timer {
  private readonly duration: number;
  private start: number;

  constructor(duration: number) {
    this.duration = duration;
    this.start = Date.now();
  }

  public get timeLeft(): number {
    return this.start + this.duration - Date.now();
  }

  public reset() {
    this.start = Date.now();
  }

  public isReady() {
    return this.start + this.duration <= Date.now();
  }
}
