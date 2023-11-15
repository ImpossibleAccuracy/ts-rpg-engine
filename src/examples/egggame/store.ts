import type { ModelLoader } from "@/library/impl/models/loaders";
import type {
  Dialog,
  DialogMessage,
} from "@/examples/egggame/actiivity/dialog/model/dialog";

interface PersonItem {
  image: string;
  sprite: any;
}

interface SimpleDialogItem {
  content: string;
  person: PersonItem;
}

const persons = {
  player: {
    image: "ui/persons/player.png",
    sprite: {
      isAutomatic: true,
      chunkSizeX: 128,
      chunkSizeY: 128,
      maxCols: 2,
      onlyRow: 3,
      updateRate: 1000,
    },
  },
  playerAngry: {
    image: "ui/persons/player.png",
    sprite: {
      isAutomatic: true,
      chunkSizeX: 128,
      chunkSizeY: 128,
      maxCols: 2,
      onlyRow: 9,
      updateRate: 500,
    },
  },
  playerRich: {
    image: "ui/persons/player.png",
    sprite: {
      isAutomatic: true,
      chunkSizeX: 128,
      chunkSizeY: 128,
      maxCols: 2,
      onlyRow: 8,
      updateRate: 700,
    },
  },
  npc01: {
    image: "ui/persons/npc_01.png",
    sprite: {
      isAutomatic: true,
      chunkSizeX: 42,
      chunkSizeY: 40,
      maxCols: 1,
      maxRows: 1,
    },
  },
};

export const QuestQiverDialogs = {
  giveMeEggs: [
    {
      content: "Привет",
      person: persons.player,
    },
    {
      content: "Помнишь меня?",
      person: persons.player,
    },
    {
      content: "А? Что? Что тебе надо?",
      person: persons.npc01,
    },
    {
      content: "Я тебя яйца одалживал",
      person: persons.playerRich,
    },
    {
      content: "Пора возвращать долг.",
      person: persons.playerRich,
    },
    {
      content: "Какие яйца?",
      person: persons.npc01,
    },
    {
      content: "Где мои яйца, дед?",
      person: persons.playerAngry,
    },
    {
      content: "Я потерял все яйца...",
      person: persons.npc01,
    },
    {
      content: "Это все гоблины. Честно. Они меня обокрали недавно",
      person: persons.npc01,
    },
    {
      content: "А я то думал, почему ты на острове сидишь...",
      person: persons.player,
    },
    {
      content: "Можешь пойти и поискать в лесу. Только будь осторожен.",
      person: persons.npc01,
    },
    {
      content: "Они ВСЕГДА рядом...",
      person: persons.npc01,
    },
  ],
  getAway: [
    {
      content: "ААААА!!!! ГОБЛИНЫ!!!!!",
      person: persons.npc01,
    },
    {
      content: "Шизик старый...",
      person: persons.playerAngry,
    },
    {
      content: "Пойду-ка я отсюда...",
      person: persons.playerAngry,
    },
  ],
};

export async function buildDialog(
  items: Array<SimpleDialogItem>,
  modelLoader: ModelLoader,
): Promise<Dialog> {
  const messages = new Array<DialogMessage>();

  for (const item of items) {
    const model = await modelLoader.loadSprite(
      item.person.image,
      item.person.sprite,
    );

    messages.push({
      content: item.content,
      person: {
        model: model,
      },
    });
  }

  return {
    items: messages,
    extra: new Map(),
  };
}
