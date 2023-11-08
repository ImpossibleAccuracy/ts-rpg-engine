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

  public isTouch(rect: Rect): boolean {
    return !(this.posX > rect.posX2 || rect.posX > this.posX2);
  }

  public isOverlaps(rect: Rect): boolean {
    return !(this.posX >= rect.posX2 || rect.posX >= this.posX2);
  }

  public copy(): Rect {
    return new Rect(this.sizeX, this.posX);
  }

  public plusRectCoordinates(rect: Rect) {
    return new Rect(this.sizeX, this.posX + rect.posX);
  }

  public calculateCoordinatesDiff(rect: Rect): Rect {
    return new Rect(this.sizeX, this.posX - rect.posX);
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

  public isTouch(rect: Rect2D): boolean {
    return !(
      this.posX > rect.posX2 ||
      rect.posX > this.posX2 ||
      this.posY > rect.posY2 ||
      rect.posY > this.posY2
    );
  }

  public isOverlaps(rect: Rect2D): boolean {
    return !(
      this.posX >= rect.posX2 ||
      rect.posX >= this.posX2 ||
      this.posY >= rect.posY2 ||
      rect.posY >= this.posY2
    );
  }

  public copy(): Rect2D {
    return new Rect2D(this.sizeX, this.sizeY, this.posX, this.posY);
  }

  public plusRectCoordinates(rect: Rect2D) {
    return new Rect2D(
      this.sizeX,
      this.sizeY,
      this.posX + rect.posX,
      this.posY + rect.posY,
    );
  }

  public calculateCoordinatesDiff(rect: Rect2D): Rect {
    return new Rect2D(
      this.sizeX,
      this.sizeY,
      this.posX - rect.posX,
      this.posY - rect.posY,
    );
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

  public isTouch(rect: Rect3D): boolean {
    return !(
      this.posX > rect.posX2 ||
      rect.posX > this.posX2 ||
      this.posY > rect.posY2 ||
      rect.posY > this.posY2 ||
      this.posZ > rect.posZ2 ||
      rect.posZ > this.posZ2
    );
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

  public copy(): Rect3D {
    return new Rect3D(
      this.sizeX,
      this.sizeY,
      this.sizeZ,
      this.posX,
      this.posY,
      this.posZ,
    );
  }

  public plusRectCoordinates(rect: Rect3D) {
    return new Rect3D(
      this.sizeX,
      this.sizeY,
      this.sizeZ,
      this.posX + rect.posX,
      this.posY + rect.posY,
      this.posZ + rect.posZ,
    );
  }

  public calculateCoordinatesDiff(rect: Rect3D): Rect {
    return new Rect3D(
      this.sizeX,
      this.sizeY,
      this.sizeZ,
      this.posX - rect.posX,
      this.posY - rect.posY,
      this.posZ - rect.posZ,
    );
  }
}

function getBounds(rects: Array<Rect2D>): Rect2D {
  let minX: number = rects[0].posX;
  let maxX: number = rects[0].posX2;
  let minY: number = rects[0].posY;
  let maxY: number = rects[0].posY2;

  for (let i = 1; i < rects.length; i++) {
    const rect = rects[i];

    if (rect.posX < minX) {
      minX = rect.posX;
    }

    if (rect.posX2 > maxX) {
      maxX = rect.posX2;
    }

    if (rect.posY < minY) {
      minY = rect.posY;
    }

    if (rect.posY2 > maxY) {
      maxY = rect.posY2;
    }
  }

  return new Rect2D(maxX - minX, maxY - minY, minX, minY);
}

export class CompositeRect2D extends Rect2D implements Copyable<Rect2D> {
  public rects: Array<Rect2D>;

  constructor(rects: Array<Rect2D> = new Array<Rect2D>()) {
    const bounds = getBounds(rects);
    super(bounds.sizeX, bounds.sizeY, bounds.posX, bounds.posY);

    this.rects = rects;
  }

  isOverlaps(rect: Rect2D): boolean {
    for (const r of this.rects) {
      if (r.isOverlaps(rect)) {
        return true;
      }
    }

    return false;
  }

  public getBounds(): Rect2D {
    return getBounds(this.rects);
  }
}
