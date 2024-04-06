import { TaskList } from "./TodoTask";
import { Accessor, Setter } from "solid-js";
import { SetStoreFunction } from "solid-js/store";
import { TaskData } from "./TodoTask";

interface AppControls {
  getTaskLists: Accessor<TaskList[]>;
  setTaskLists: SetStoreFunction<TaskList[]>;

  selectedListIndex: Accessor<number>;
  setSelectedListIndex: Setter<number>;

  selectedIndex: Accessor<number>;
  setSelectedIndex: Setter<number>;

  doFocus: Accessor<boolean>;
  setDoFocus: Setter<boolean>;

  showHelp: Accessor<boolean>;
  setShowHelp: Setter<boolean>;
}

export class AppApi {
  getTaskLists: Accessor<TaskList[]>;
  setTaskLists: SetStoreFunction<TaskList[]>;

  selectedListIndex: Accessor<number>;
  setSelectedListIndex: Setter<number>;

  selectedIndex: Accessor<number>;
  setSelectedIndex: Setter<number>;

  doFocus: Accessor<boolean>;
  setDoFocus: Setter<boolean>;

  showHelp: Accessor<boolean>;
  setShowHelp: Setter<boolean>;

  constructor(api: AppControls) {
    this.getTaskLists = api.getTaskLists;
    this.setTaskLists = api.setTaskLists;
    this.selectedListIndex = api.selectedListIndex;
    this.setSelectedListIndex = api.setSelectedListIndex;
    this.selectedIndex = api.selectedIndex;
    this.setSelectedIndex = api.setSelectedIndex;
    this.doFocus = api.doFocus;
    this.setDoFocus = api.setDoFocus;
    this.showHelp = api.showHelp;
    this.setShowHelp = api.setShowHelp;
  }

  /**
   * Get the currently selected list of tasks.
   */
  getTasks(): TaskData[] {
    if (!this.getTaskLists()[this.selectedListIndex()]) return [];
    return this.getTaskLists()[this.selectedListIndex()].tasks;
  }

  /**
   * Update the currently selected list of tasks.
   */
  setTasks(tasks: TaskData[]) {
    if (!this.getTaskLists()[this.selectedListIndex()]) return;
    const newList = { ...this.getTaskLists()[this.selectedListIndex()] };
    newList.tasks = tasks;
    this.setTaskLists(this.selectedListIndex(), newList);
  };

  /**
   * Update a single task matching the given uuid.
   */
  setTasksByUuid(uuid: string, tfn: (task: TaskData) => TaskData) {
    const newTasks = this.getTasks().map((task) => {
      if (task.uuid === uuid) return tfn(task);
      return task;
    });
    this.setTasks(newTasks);
  }

  /**
   * Get the currently selected list.
   */
  getCurrentList() {
    return this.getTaskLists()[this.selectedListIndex()];
  }

  /**
   * Create a new task and append it to the current list.
   */
  createNewTask() {
    const prevTasks = [];
    let targetIndex = this.selectedIndex();

    const tasks = this.getTasks();
    if (!tasks) return;

    // Prevent appending a new task after a done task
    if (tasks[targetIndex]?.done) {
      targetIndex = tasks.findIndex((task) => task.done) - 1;
    }

    for (let i = 0; i <= targetIndex; i++) {
      if (i < tasks.length) prevTasks.push(tasks[i]);
    }
    const nextTasks = [];
    for (let i = targetIndex + 1; i < tasks.length; i++) {
      nextTasks.push(tasks[i]);
    }

    this.setTasks([...prevTasks, new TaskData(), ...nextTasks]);
    this.setSelectedIndex(Math.min(targetIndex + 1, this.getTasks().length - 1));
    this.setDoFocus(true);
    setTimeout(() => {
      this.setDoFocus(false);
    });
  };


  /**
   * Add a new list of tasks.
   */
  appendNewTaskList() {
    const lists = this.getTaskLists();
    const newTitle = lists.length === 0 ? "Tasks" : `Tasks ${lists.length + 1}`;
    this.setTaskLists([...lists, { title: `${newTitle}`, tasks: [], done: false }]);
  }

  /**
   * Callback to run when a task title is edited.
   */
  onEditTaskTitle(uuid: string, newTitle: string): undefined {
    this.setTasksByUuid(
      uuid,
      (task) => {
        return { ...task, title: newTitle };
      }
    );
  };

  /**
   * Callback to run when a list title is edited.
   */
  onEditListTitle(index: number, newTitle: string): undefined {
    const newList = { ...this.getTaskLists()[index] };
    newList.title = newTitle;
    this.setTaskLists(index, newList);
    console.log("List title changed", index, newTitle);
  };
}
