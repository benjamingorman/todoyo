import { Message } from "./message";

export const Bindings: Record<Message, string[]> = {
  [Message.NEW_TASK]: ["o"],
  [Message.EDIT_TASK]: ["i"],
  [Message.NEXT_ITEM]: ["j"],
  [Message.PREV_ITEM]: ["k"],
  [Message.NEXT_LIST]: ["l"],
  [Message.PREV_LIST]: ["h"],
  [Message.DONE_TASK]: ["x"],
  [Message.UNDO_DONE_TASK]: ["u"],
  [Message.SWAP_UP]: ["["],
  [Message.SWAP_DOWN]: ["]"],
  [Message.GO_TO_START]: ["g"],
  [Message.GO_TO_END]: ["Shift", "g"],
  [Message.TOGGLE_HELP]: ["z"],
};
