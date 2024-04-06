import { AppApi } from "./AppApi";
import { MessageBroker } from "./MessageBroker";
import { Message } from "./message";

export function configureDefaultHandlers(api: AppApi, broker: MessageBroker) {
  broker.on(Message.NEW_TASK, () => { api.createNewTask() });

  broker.on(Message.EDIT_TASK, () => {
    api.setDoFocus(true);
    setTimeout(() => {
      api.setDoFocus(false);
    });
  });

  broker.on(Message.NEXT_ITEM, () => {
    api.setSelectedIndex(Math.min(api.selectedIndex() + 1, api.getTasks().length - 1));
    console.log("Next item", api.selectedIndex());
  });

  broker.on(Message.PREV_ITEM, () => {
    api.setSelectedIndex(Math.max(api.selectedIndex() - 1, -1));
    console.log("Prev item", api.selectedIndex());
  });

  broker.on(Message.NEXT_LIST, () => {
    if (api.selectedListIndex() === api.getTaskLists().length - 1) {
      console.log("Creating new list");
      api.appendNewTaskList();
    }
    api.setSelectedListIndex(Math.min(api.selectedListIndex() + 1, api.getTaskLists().length - 1));
    api.setSelectedIndex(Math.max(-1, Math.min(api.selectedIndex(), api.getTasks().length - 1)));
    console.log("Next list", api.selectedListIndex());
  });

  broker.on(Message.PREV_LIST, () => {
    api.setSelectedListIndex(Math.max(api.selectedListIndex() - 1, 0));
    api.setSelectedIndex(Math.max(-1, Math.min(api.selectedIndex(), api.getTasks().length - 1)));

    console.log("Prev list", api.selectedListIndex());
  });

  broker.on(Message.DONE_TASK, () => {
    if (api.selectedIndex() === -1) {
      // Mark the whole list as done
      if (api.getCurrentList().done) {
        // Delete the list
        const newLists = api.getTaskLists().filter((_, i) => i !== api.selectedListIndex());
        api.setTaskLists(newLists);

        if (api.getTaskLists().length === 0) {
          api.appendNewTaskList();
        }
        api.setSelectedListIndex(Math.max(api.selectedListIndex() - 1, 0));
      } else {
        // Mark the list as done
        const newList = { ...api.getCurrentList(), done: true };
        api.setTaskLists(api.selectedListIndex(), newList);
      }
      return;
    };

    const task = api.getTasks()[api.selectedIndex()];
    if (!task) return;

    console.log("Marking task as done", api.selectedIndex());

    if (!task.done) {
      // Mark the task as done and move it to either the end
      // or the beginning of the done tasks.
      const newTasks = [...api.getTasks()];
      const targetTask = newTasks[api.selectedIndex()];
      const editedTask = { ...targetTask, done: true };
      console.log("Target task", targetTask);
      newTasks.splice(api.selectedIndex(), 1);
      const targetIndex = newTasks.findIndex((task) => task.done);
      if (targetIndex === -1) {
        newTasks.push(editedTask);
      } else {
        newTasks.splice(targetIndex, 0, editedTask);
      }
      api.setTasks(newTasks);
    } else {
      // Delete the task
      const newTasks = api.getTasks().filter((_, i) => i !== api.selectedIndex());
      api.setTasks(newTasks);
      // And decrement the index
      api.setSelectedIndex(Math.max(api.selectedIndex() - 1, -1));
    }
  });

  broker.on(Message.UNDO_DONE_TASK, () => {
    if (api.selectedIndex() === -1) {
      // Mark the title as not done
      if (!api.getCurrentList().done) return;
      const newList = { ...api.getCurrentList(), done: false };
      api.setTaskLists(api.selectedListIndex(), newList);
    }

    const task = api.getTasks()[api.selectedIndex()];
    if (!task || !task.done) return;

    console.log("Marking task as not done", api.selectedIndex());

    // Mark the task as not done and move it to the end of active tasks.
    const newTasks = [...api.getTasks()];
    const targetTask = newTasks[api.selectedIndex()];
    const editedTask = { ...targetTask, done: false };
    newTasks.splice(api.selectedIndex(), 1);
    const targetIndex = newTasks.findIndex((task) => task.done);
    if (targetIndex === -1) {
      newTasks.splice(api.selectedIndex(), 0, editedTask);
    } else {
      newTasks.splice(targetIndex, 0, editedTask);
      api.setSelectedIndex(targetIndex);
    }
    api.setTasks(newTasks);
  });

  broker.on(Message.SWAP_UP, () => {
    console.log("SWAP UP", api.selectedIndex());
    if (api.selectedIndex() === 0) return;
    const newTasks = [...api.getTasks()];
    const task = newTasks[api.selectedIndex()];
    newTasks[api.selectedIndex()] = newTasks[api.selectedIndex() - 1];
    newTasks[api.selectedIndex() - 1] = task;
    api.setTasks(newTasks);
    api.setSelectedIndex(api.selectedIndex() - 1);
  });

  broker.on(Message.SWAP_DOWN, () => {
    console.log("SWAP DOWN", api.selectedIndex());
    if (api.selectedIndex() === api.getTasks().length - 1) return;
    const newTasks = [...api.getTasks()];
    const task = newTasks[api.selectedIndex()];
    newTasks[api.selectedIndex()] = newTasks[api.selectedIndex() + 1];
    newTasks[api.selectedIndex() + 1] = task;
    api.setTasks(newTasks);
    api.setSelectedIndex(api.selectedIndex() + 1);
  });

  broker.on(Message.GO_TO_START, () => {
    api.setSelectedIndex(api.getTasks().length ? 0 : -1);
  });

  broker.on(Message.GO_TO_END, () => {
    api.setSelectedIndex(Math.max(api.getTasks().length - 1, -1));
  });
}
