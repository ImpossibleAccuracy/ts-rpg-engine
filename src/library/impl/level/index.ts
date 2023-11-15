import { CompositeRect2D, Rect2D } from "@/library/api/data/rect";
import { Model } from "@/library/api/models";
import { AssetsLevelBuilder } from "@/library/api/level";
import type {
  CollisionType,
  ControllerJson,
  ControllerType,
  CoordinatesJson,
  DimensionsJson,
  LevelJson,
  ModelType,
  RectJson,
  TilesetModelCellJson,
  TilesetModelJson,
  TilesetModelRowJson,
} from "@/library/impl/level/data";
import {
  instanceOfArraySpriteModel,
  instanceOfEntity,
  instanceOfEntityCollection,
  instanceOfModel,
  instanceOfModelArray,
  instanceOfSpriteModel,
  instanceOfTilesetModel,
} from "@/library/impl/level/data";
import type {
  Entity,
  EntityController,
  EntityControllerFactory,
  EntityFactory,
} from "@/library/api/data/entity";
import type { Nullable } from "@/library/api/data/common";
import { mergeDeep } from "@/library/api/utils/object";

import { ModelLoader } from "@/library/impl/models/loaders";
import type { TilesetItem } from "@/library/impl/models/tilesetModel";

export class AssetsLevelBuilder2D extends AssetsLevelBuilder<
  Rect2D,
  LevelJson
> {
  constructor(
    baseLevelPath: string,
    controllers: Map<string, EntityControllerFactory<Rect2D>>,
  ) {
    super(baseLevelPath, controllers);
  }

  public calculateLevelDimensions(json: LevelJson): Rect2D {
    return new Rect2D(json.size.w, json.size.h);
  }

  public async parseObjects(
    json: LevelJson,
    entityFactory: EntityFactory<Rect2D>,
    modelLoader: ModelLoader,
  ): Promise<Array<Entity<Rect2D>>> {
    const promises = new Array<Promise<Array<Entity<Rect2D>>>>();

    for (const el of Object.entries(json.objects)) {
      const type = el[0];
      const obj = el[1];

      const items = this.buildEntities(type, obj, entityFactory, modelLoader);

      promises.push(items);
    }

    const items = await Promise.all(promises);

    return items.flat();
  }

  private async buildEntities(
    type: string,
    obj: ModelType,
    entityFactory: EntityFactory<Rect2D>,
    modelLoader: ModelLoader,
  ): Promise<Array<Entity<Rect2D>>> {
    const promises = new Array<Entity<Rect2D>>();

    if (instanceOfEntity(obj)) {
      if (obj.attach === false) return [];

      if (!obj.model) {
        throw new Error("Entity model must be specified");
      }

      if (!obj.size) {
        throw new Error("Entity size must be specified");
      }

      const item = await this.buildEntity(
        type,
        obj.controller ?? null,
        obj.order,
        obj.size,
        obj.position,
        obj.model,
        obj.is_material ?? true,
        obj.collision ?? null,
        entityFactory,
        modelLoader,
      );

      promises.push(item);
    } else if (instanceOfEntityCollection(obj)) {
      for (const valueElement of obj.items) {
        if (valueElement.attach === false) continue;

        const data = mergeDeep({}, obj, valueElement);

        const items = await this.buildEntities(
          type,
          data,
          entityFactory,
          modelLoader,
        );

        promises.push(...items);
      }
    }

    return promises;
  }

  private async buildEntity(
    type: string,
    controllerInfo: Nullable<ControllerType>,
    order: number,
    size: DimensionsJson,
    position: CoordinatesJson,
    modelInfo: ModelType,
    isMaterial: boolean,
    collisionInfo: Nullable<CollisionType>,
    entityFactory: EntityFactory<Rect2D>,
    modelLoader: ModelLoader,
  ): Promise<Entity<Rect2D>> {
    const rect = new Rect2D(size.w, size.h, position.x, position.y);

    const collision = collisionInfo ? this.parseCollision(collisionInfo) : null;

    const controller = controllerInfo
      ? this.parseController(controllerInfo)
      : null;

    const models = await this.parseModels(modelInfo, modelLoader);

    return entityFactory.buildEntity(
      type,
      models,
      isMaterial,
      order,
      rect,
      collision,
      controller,
    );
  }

  private parseRect(rectJson: RectJson): Rect2D {
    return new Rect2D(rectJson.w, rectJson.h, rectJson.x, rectJson.y);
  }

  private parseCollision(collision: CollisionType): Rect2D {
    if (collision instanceof Array) {
      const items = new Array<Rect2D>();

      for (const item of collision) {
        const collisionItem = this.parseCollision(item);
        items.push(collisionItem);
      }

      return new CompositeRect2D(items);
    } else {
      return this.parseRect(collision as RectJson);
    }
  }

  private parseController(
    controller: ControllerType,
  ): EntityController<Rect2D> {
    if (typeof controller === "string") {
      return this.createController(controller as string);
    } else {
      const data = controller as ControllerJson;

      return this.createController(data.name, data.meta);
    }
  }

  private async parseModels(
    modelJson: ModelType,
    modelLoader: ModelLoader,
  ): Promise<Array<Model>> {
    if (modelJson instanceof Array) {
      const promises = modelJson.map((el) => this.createModel(el, modelLoader));

      return await Promise.all(promises);
    } else if (instanceOfModelArray(modelJson)) {
      const promises = modelJson.items.map((el) =>
        this.createModel(el, modelLoader),
      );

      return await Promise.all(promises);
    } else {
      const model = await this.createModel(modelJson, modelLoader);
      return [model];
    }
  }

  private createModel(
    modelJson: ModelType,
    modelLoader: ModelLoader,
  ): Promise<Model> {
    if (instanceOfModel(modelJson)) {
      return modelLoader.load(modelJson.name, modelJson.props);
    } else if (instanceOfTilesetModel(modelJson)) {
      const itemChunkSizeX = modelJson.chunk_size.w;
      const itemChunkSizeY = modelJson.chunk_size.h;

      const startX = modelJson.start_position
        ? modelJson.start_position.x * itemChunkSizeX
        : 0;
      const startY = modelJson.start_position
        ? modelJson.start_position.y * itemChunkSizeY
        : 0;

      const tiles = this.createTilesetItems(
        modelJson,
        itemChunkSizeX,
        itemChunkSizeY,
        startX,
        startY,
      );

      return modelLoader.loadTileset(modelJson.name, tiles);
    } else if (instanceOfSpriteModel(modelJson)) {
      return modelLoader.loadSprite(modelJson.name, modelJson.props);
    } else if (instanceOfArraySpriteModel(modelJson)) {
      return modelLoader.loadSpriteFromArray(modelJson.items, modelJson.props);
    } else {
      throw new Error("Unknown model type");
    }
  }

  private createTilesetItems(
    modelJson: TilesetModelJson,
    itemChunkSizeX: number,
    itemChunkSizeY: number,
    startX: number,
    startY: number,
  ): Array<TilesetItem> {
    const items = new Array<TilesetItem & { order: number }>();

    let activeRow = 0;
    for (let i = 0; i < modelJson.tiles.length; i++) {
      const row = modelJson.tiles[i];

      if (typeof row === "string") {
        const command = row as string;
        const activeTile = modelJson.tiles[i - 1];

        if (command.startsWith("repeat ")) {
          const number = parseInt(command.substring(7));

          for (let j = 0; j < number; j++) {
            const buildTileRow = this.buildTileRow(
              activeTile,
              activeRow++,
              itemChunkSizeX,
              itemChunkSizeY,
              startX,
              startY,
            );

            items.push(...buildTileRow);
          }
        }
      } else if (row instanceof Array) {
        const tiles = this.buildTileRow(
          row,
          activeRow++,
          itemChunkSizeX,
          itemChunkSizeY,
          startX,
          startY,
        );

        items.push(...tiles);
      }
    }

    return items.sort((el, el2) => el.order - el2.order);
  }

  private buildTileRow(
    row: TilesetModelRowJson,
    rowIndex: number,
    itemChunkSizeX: number,
    itemChunkSizeY: number,
    startX: number,
    startY: number,
  ): Array<TilesetItem & { order: number }> {
    const result = new Array<TilesetItem & { order: number }>();

    let columnIndex = 0;
    for (let j = 0; j < row.length; j++) {
      const cell = row[j] as TilesetModelCellJson;

      if (typeof cell === "string") {
        const command = cell as string;
        const activeTile = row[j - 1];

        if (command.startsWith("repeat ")) {
          const number = parseInt(command.substring(7));

          for (let j = 0; j < number; j++) {
            const tileItem = this.buildTile(
              activeTile as number[],
              rowIndex,
              columnIndex++,
              itemChunkSizeX,
              itemChunkSizeY,
              startX,
              startY,
            );

            if (!tileItem) continue;

            result.push(tileItem);
          }
        }
      } else {
        const tileItem = this.buildTile(
          cell as number[],
          rowIndex,
          columnIndex++,
          itemChunkSizeX,
          itemChunkSizeY,
          startX,
          startY,
        );

        if (!tileItem) continue;

        result.push(tileItem);
      }
    }

    return result;
  }

  private buildTile(
    cell: number[],
    rowIndex: number,
    celIndex: number,
    itemChunkSizeX: number,
    itemChunkSizeY: number,
    startX: number,
    startY: number,
  ): Nullable<TilesetItem & { order: number }> {
    if (cell.length == 0) return null;

    const order = cell.length >= 7 ? cell[6] : 1;

    const sourceRect = new Rect2D(
      (cell.length == 2 ? 1 : cell[2]) * itemChunkSizeX,
      (cell.length == 2 ? 1 : cell[3]) * itemChunkSizeY,
      startX + cell[0] * itemChunkSizeX,
      startY + cell[1] * itemChunkSizeY,
    );

    const destinationPosX = cell.length >= 6 ? cell[4] : celIndex;
    const destinationPosY = cell.length >= 6 ? cell[5] : rowIndex;

    if (sourceRect.posX < 0 && sourceRect.posY < 0) return null;

    return {
      order: order,
      sourceRect: sourceRect,
      destinationRect: new Rect2D(1, 1, destinationPosX, destinationPosY),
    };
  }

  private createController(
    controllerName: string,
    controllerParams?: unknown,
  ): EntityController<Rect2D> {
    const controllerCreator = this.controllers.get(controllerName);

    if (!controllerCreator) {
      throw new Error(`Entity controller "${controllerName}" not found`);
    }

    if (controllerParams) {
      if (controllerParams instanceof Array) {
        return controllerCreator(...controllerParams);
      } else {
        return controllerCreator(controllerParams);
      }
    } else {
      return controllerCreator();
    }
  }
}
