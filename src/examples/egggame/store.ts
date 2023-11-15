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
      repeat: false,
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
      repeat: false,
    },
  },
  playerHappy: {
    image: "ui/persons/player.png",
    sprite: {
      isAutomatic: true,
      chunkSizeX: 128,
      chunkSizeY: 128,
      maxCols: 2,
      onlyRow: 4,
      updateRate: 500,
      repeat: false,
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
      repeat: false,
    },
  },
  npcQuestGiver: {
    image: "ui/persons/npc_01.png",
    sprite: {
      isAutomatic: true,
      chunkSizeX: 42,
      chunkSizeY: 40,
      maxCols: 1,
      maxRows: 1,
      repeat: false,
    },
  },
};

export const PlayerMonologues = {
  whereIsTheMan: [
    {
      content: "Ох. наконец-то я здесь!",
      person: persons.player,
    },
    {
      content: "Телепортация - штука сложная",
      person: persons.player,
    },
    {
      content: "Где же этот дедок? Он должен быть здесь.",
      person: persons.player,
    },
  ],
  iAmHere: [
    {
      content: "Чертов дед!",
      person: persons.playerAngry,
    },
    {
      content: "Я с него в двойном размере яиц вытресу!",
      person: persons.playerAngry,
    },
    {
      content: "Что ж...",
      person: persons.player,
    },
    {
      content: "Пора рубить гоблинов.",
      person: persons.player,
    },
  ],
  noChance: [
    {
      content: "Это было слишком просто!",
      person: persons.playerHappy,
    },
    {
      content: "Пойду деда трясти",
      person: persons.playerHappy,
    },
  ]
};

export const QuestQiverDialogs = {
  giveMeEggs: [
    {
      content: "OoO. Привет!",
      person: persons.player,
    },
    {
      content: "Помнишь меня?",
      person: persons.player,
    },
    {
      content: "А? Что? Ты.. ты кто? Что тебе надо?",
      person: persons.npcQuestGiver,
    },
    {
      content: "Денег у меня нет",
      person: persons.npcQuestGiver,
    },
    {
      content: "Я тебя яйца одалживал",
      person: persons.playerRich,
    },
    {
      content: "Время вернуть долг.",
      person: persons.playerRich,
    },
    {
      content: "Какие яйца?",
      person: persons.npcQuestGiver,
    },
    {
      content: "Где мои яйца, дед?",
      person: persons.playerAngry,
    },
    {
      content: "Ааа... Эти... Тут такая история случилась... Ха-ха-ха",
      person: persons.npcQuestGiver,
    },
    {
      content: "Я потерял все яйца...",
      person: persons.npcQuestGiver,
    },
    {
      content: "Это все гоблины, честно. Они меня обокрали недавно",
      person: persons.npcQuestGiver,
    },
    {
      content: "А я то думал, почему ты на острове сидишь...",
      person: persons.player,
    },
    {
      content:
        "Можешь пойти и поискать в лесу на соседнем острове. Только будь осторожен.",
      person: persons.npcQuestGiver,
    },
    {
      content: "Они ВСЕГДА рядом...",
      person: persons.npcQuestGiver,
    },
  ],
  getAway: [
    {
      content: "ААААА!!!! ГОБЛИНЫ!!!!!",
      person: persons.npcQuestGiver,
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
  ZombieTime: [
    {
      content: "АААААААА! МЕРТВЕЦЫ ОЖИВАЮТ!!!",
      person: persons.npcQuestGiver,
    },
    {
      content: "СПАСАЙСЯ КТО МОЖЕТ!!!",
      person: persons.npcQuestGiver,
    },
    {
      content: "Совсем их ума выжил?",
      person: persons.playerAngry,
    },
    {
      content: "Я так-то еще жив.",
      person: persons.playerAngry,
    },
    {
      content: "ОоО. Так ты оттуда выбрался живым!",
      person: persons.npcQuestGiver,
    },
    {
      content: "Не зря про тебя все говорят: \"быстрые ноги урона не боятся\"",
      person: persons.npcQuestGiver,
    },
    {
      content: "Ты мне тут зубы не заговаривай",
      person: persons.playerAngry,
    },
    {
      content: "Я там курятники видел.",
      person: persons.playerAngry,
    },
    {
      content: "Ты же понимаешь о чем я, верно?!",
      person: persons.playerRich,
    },
    {
      content: "Ох, не даешь ты старику продоху.",
      person: persons.npcQuestGiver,
    },
    {
      content: "Все мои деньги хранятся в хижине на небольшом островке неподалеку.",
      person: persons.npcQuestGiver,
    },
    {
      content: "Если убьешь всех гоблинов, можешь забрать половину выручки.",
      person: persons.npcQuestGiver,
    },
    {
      content: "На том и договорились.",
      person: persons.playerRich,
    },
  ]
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
