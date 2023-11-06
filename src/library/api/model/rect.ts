import type { Copyable } from "@/library/api/model/common";

export class Rect implements Copyable<Rect> {
  public posX: number;
  public sizeX: number;

  constructor(sizeX: number, posX: number = 0) {
    this.posX = posX;
    this.sizeX = sizeX;
  }

  get posX2() {
    return this.posX + this.sizeX;
  }

  public isOverlaps(rect: Rect): boolean {
    return !(this.posX >= rect.posX2 || rect.posX >= this.posX2);
  }

  copy(): Rect {
    return new Rect(this.posX, this.sizeX);
  }
}

export class Rect2D extends Rect implements Copyable<Rect2D> {
  public posY: number;
  public sizeY: number;

  constructor(
    sizeX: number,
    sizeY: number,
    posX: number = 0,
    posY: number = 0,
  ) {
    super(sizeX, posX);
    this.posY = posY;
    this.sizeY = sizeY;
  }

  get posY2() {
    return this.posY + this.sizeY;
  }

  public isOverlaps(rect: Rect2D): boolean {
    return !(
      this.posX >= rect.posX2 ||
      rect.posX >= this.posX2 ||
      this.posY >= rect.posY2 ||
      rect.posY >= this.posY2
    );
  }

  copy(): Rect2D {
    return new Rect2D(this.sizeX, this.sizeY, this.posX, this.posY);
  }
}

export class Rect3D extends Rect2D implements Copyable<Rect3D> {
  public posZ: number;
  public sizeZ: number;

  constructor(
    sizeX: number,
    sizeY: number,
    sizeZ: number,
    posX: number = 0,
    posY: number = 0,
    posZ: number = 0,
  ) {
    super(sizeX, sizeY, posX, posY);
    this.posZ = posZ;
    this.sizeZ = sizeZ;
  }

  get posZ2() {
    return this.posY + this.sizeY;
  }

  public isOverlaps(rect: Rect3D): boolean {
    return !(
      this.posX >= rect.posX2 ||
      rect.posX >= this.posX2 ||
      this.posY >= rect.posY2 ||
      rect.posY >= this.posY2 ||
      this.posZ >= rect.posZ2 ||
      rect.posZ >= this.posZ2
    );
  }

  copy(): Rect3D {
    return new Rect3D(
      this.sizeX,
      this.sizeY,
      this.sizeZ,
      this.posX,
      this.posY,
      this.posZ,
    );
  }
}

// export interface Dimensions {
//   w: number;
// }
//
// export interface Coordinates {
//   x: number;
// }
//
// export interface Dimensions2d extends Dimensions {
//   h: number;
// }
//
// export interface Coordinates2d extends Coordinates {
//   y: number;
// }

// export function isOverlaps<R extends Coordinates & Dimensions>(
//   rect: R,
//   rect2: R,
// ): boolean {
//
// }

// return !(
//   this.x >= rect.x2 ||
//   rect.x >= this.x2 ||
//   this.y >= rect.y2 ||
//   rect.y >= this.y2
// );
