import { createShortcut } from "@solid-primitives/keyboard";
import { Bindings } from "./Bindings";
import { Message } from "./message";
import { AppApi } from "./AppApi";

type Callback = (api: AppApi, msg: Message) => void;

const allMsg = [
  Message.NEW_TASK,
  Message.EDIT_TASK,
  Message.NEXT_ITEM,
  Message.PREV_ITEM,
  Message.NEXT_LIST,
  Message.PREV_LIST,
  Message.DONE_TASK,
  Message.UNDO_DONE_TASK,
  Message.SWAP_UP,
  Message.SWAP_DOWN,
  Message.GO_TO_START,
  Message.GO_TO_END,
  Message.TOGGLE_HELP,
];

export class MessageBroker {
  private msgBuf: Message[] = [];
  private callbacks: Map<Message, Callback[]> = new Map();
  private api: AppApi;

  constructor(api: AppApi) {
    this.api = api;
  }

  setupHotkeys() {
    // TODO iterate enum?
    for (const msg of allMsg) {
      const bindings = Bindings[msg];
      if (bindings)
        createShortcut(bindings, () => { this.sendMsg(msg) }, {
          preventDefault: true,
          requireReset: true,
        });
    }
  }

  sendMsg(msg: Message) {
    console.log("Broker sending message", Message[msg]);
    this.msgBuf.push(msg);
    for (const cb of this.callbacks.get(msg) || []) {
      cb(this.api, msg);
    }
  }

  on(msg: Message, cb: Callback) {
    if (!this.callbacks.has(msg))
      this.callbacks.set(msg, []);
    (this.callbacks.get(msg) as Callback[]).push(cb);
  }
}
