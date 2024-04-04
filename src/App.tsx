import { For, createSignal, createEffect } from "solid-js";
import { TaskData, TaskWidget, TaskList } from "./TodoTask";
import { createShortcut } from "@solid-primitives/keyboard";
import { createStore } from "solid-js/store";
import { Store } from "tauri-plugin-store-api";
import { TodoTitle } from "./TodoTitle";

enum HotKeys {
  NEW_TASK,
  EDIT_TASK,
  NEXT_ITEM,
  PREV_ITEM,
  NEXT_LIST,
  PREV_LIST,
  DONE_TASK,
  UNDO_DONE_TASK,
  SWAP_UP,
  SWAP_DOWN,
  GO_TO_START,
  GO_TO_END,
}

const Bindings = {
  [HotKeys.NEW_TASK]: ["o"],
  [HotKeys.EDIT_TASK]: ["i"],
  [HotKeys.NEXT_ITEM]: ["j"],
  [HotKeys.PREV_ITEM]: ["k"],
  [HotKeys.NEXT_LIST]: ["l"],
  [HotKeys.PREV_LIST]: ["h"],
  [HotKeys.DONE_TASK]: ["x"],
  [HotKeys.UNDO_DONE_TASK]: ["u"],
  [HotKeys.SWAP_UP]: ["["],
  [HotKeys.SWAP_DOWN]: ["]"],
  [HotKeys.GO_TO_START]: ["g"],
  [HotKeys.GO_TO_END]: ["Shift", "g"],
};

const SETTINGS_VERSION = 1;
let DONE_LOAD_TASKS = false;

function App() {
  const initTask = new TaskData();
  initTask.title = "New task";
  const initList: TaskList = { title: "Tasks", tasks: [initTask], done: false };
  const initList2: TaskList = { title: "Tasks 2", tasks: [new TaskData()], done: false };
  const [taskLists, setTaskLists] = createStore<TaskList[]>([initList, initList2]);
  const [selectedListIndex, setSelectedListIndex] = createSignal(0);
  // -1 means no task is selected and we're editing the list title
  const [selectedIndex, setSelectedIndex] = createSignal(-1);
  const [doFocus, setDoFocus] = createSignal(false);
  const store = new Store(`.tasks.${SETTINGS_VERSION}.dat`);

  let todoListsRef: HTMLDivElement | undefined;

  createEffect(() => {
    if (!todoListsRef) return;
    const listRef = document.getElementById(`todo-list-${selectedListIndex()}`);
    console.log("listRef", listRef);
    if (!listRef) return;
    console.log("offsetLeft", listRef.offsetLeft);
    console.log("scrollLeft", todoListsRef.scrollLeft);
    todoListsRef.scrollTo({
      left: listRef.offsetLeft,
      behavior: "smooth",
    })
  });

  const getCurrentList = () => {
    return taskLists[selectedListIndex()];
  }

  const setTasks = (tasks: TaskData[]) => {
    if (!taskLists[selectedListIndex()]) return;
    const newList = { ...taskLists[selectedListIndex()] };
    newList.tasks = tasks;
    setTaskLists(selectedListIndex(), newList);
  };

  const setTasksByUuid = (uuid: string, tfn: (task: TaskData) => TaskData) => {
    const newTasks = getTasks().map((task) => {
      if (task.uuid === uuid) return tfn(task);
      return task;
    });
    setTasks(newTasks);
  }

  const getTasks = () => {
    if (!taskLists[selectedListIndex()]) return [];
    return taskLists[selectedListIndex()].tasks;
  }

  // createEffect(() => {
  //   sliderControl.moveTo(selectedListIndex());
  // });

  createEffect(() => {
    store.set("taskLists", taskLists);
    store.save();
    console.log("Tasks saved", taskLists);
  });

  if (!DONE_LOAD_TASKS) {
    store.get("tasks").then(
      (data) => {
        if (!data) return;
        setTaskLists(data as TaskList[]);
      },
      (e) => {
        console.error("No tasks found in store", e);
      }
    );
    DONE_LOAD_TASKS = true;
  }

  const createNewTask = () => {
    const prevTasks = [];
    let targetIndex = selectedIndex();

    const tasks = getTasks();
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

    setTasks([...prevTasks, new TaskData(), ...nextTasks]);
    setSelectedIndex(Math.min(targetIndex + 1, getTasks().length - 1));
    setDoFocus(true);
    setTimeout(() => {
      setDoFocus(false);
    });
  };

  const appendNewTaskList = () => {
    const newTitle = taskLists.length === 0 ? "Tasks" : `Tasks ${taskLists.length + 1}`;
    setTaskLists([...taskLists, { title: `${newTitle}`, tasks: [], done: false }]);
  }

  createShortcut(Bindings[HotKeys.NEW_TASK], createNewTask, {
    preventDefault: true,
    requireReset: true,
  });

  createShortcut(
    Bindings[HotKeys.EDIT_TASK],
    () => {
      setDoFocus(true);
      setTimeout(() => {
        setDoFocus(false);
      });
    },
    { preventDefault: true, requireReset: true }
  );

  createShortcut(
    Bindings[HotKeys.NEXT_ITEM],
    () => {
      setSelectedIndex(Math.min(selectedIndex() + 1, getTasks().length - 1));
      console.log("Next item", selectedIndex());
    },
    { preventDefault: true, requireReset: true }
  );

  createShortcut(
    Bindings[HotKeys.PREV_ITEM],
    () => {
      setSelectedIndex(Math.max(selectedIndex() - 1, -1));
      console.log("Prev item", selectedIndex());
    },
    { preventDefault: true, requireReset: true }
  );

  createShortcut(
    Bindings[HotKeys.NEXT_LIST],
    () => {
      if (selectedListIndex() === taskLists.length - 1) {
        console.log("Creating new list");
        appendNewTaskList();
      }
      setSelectedListIndex(Math.min(selectedListIndex() + 1, taskLists.length - 1));
      setSelectedIndex(Math.max(-1, Math.min(selectedIndex(), getTasks().length - 1)));
      console.log("Next list", selectedListIndex());
    },
    { preventDefault: true, requireReset: true }
  );

  createShortcut(
    Bindings[HotKeys.PREV_LIST],
    () => {
      setSelectedListIndex(Math.max(selectedListIndex() - 1, -1));
      setSelectedIndex(Math.max(-1, Math.min(selectedIndex(), getTasks().length - 1)));

      console.log("Prev list", selectedListIndex());
    },
    { preventDefault: true, requireReset: true }
  );


  createShortcut(
    Bindings[HotKeys.DONE_TASK],
    () => {
      if (selectedIndex() === -1) {
        // Mark the whole list as done
        if (getCurrentList().done) {
          // Delete the list
          const newLists = taskLists.filter((_, i) => i !== selectedListIndex());
          setTaskLists(newLists);

          if (taskLists.length === 0) {
            appendNewTaskList();
          }
          setSelectedListIndex(Math.max(selectedListIndex() - 1, 0));
        } else {
          // Mark the list as done
          const newList = { ...getCurrentList(), done: true };
          setTaskLists(selectedListIndex(), newList);
        }
        return;
      };

      const task = getTasks()[selectedIndex()];
      if (!task) return;

      console.log("Marking task as done", selectedIndex());

      if (!task.done) {
        // Mark the task as done and move it to either the end
        // or the beginning of the done tasks.
        const newTasks = [...getTasks()];
        const targetTask = newTasks[selectedIndex()];
        const editedTask = { ...targetTask, done: true };
        console.log("Target task", targetTask);
        newTasks.splice(selectedIndex(), 1);
        const targetIndex = newTasks.findIndex((task) => task.done);
        if (targetIndex === -1) {
          newTasks.push(editedTask);
        } else {
          newTasks.splice(targetIndex, 0, editedTask);
        }
        setTasks(newTasks);
      } else {
        // Delete the task
        const newTasks = getTasks().filter((_, i) => i !== selectedIndex());
        setTasks(newTasks);
        // And decrement the index
        setSelectedIndex(Math.max(selectedIndex() - 1, -1));
      }
    },
    { preventDefault: true, requireReset: true }
  );

  createShortcut(
    Bindings[HotKeys.UNDO_DONE_TASK],
    () => {
      if (selectedIndex() === -1) {
        // Mark the title as not done
        if (!getCurrentList().done) return;
        const newList = { ...getCurrentList(), done: false };
        setTaskLists(selectedListIndex(), newList);
      }

      const task = getTasks()[selectedIndex()];
      if (!task || !task.done) return;

      console.log("Marking task as not done", selectedIndex());

      // Mark the task as not done and move it to the end of active tasks.
      const newTasks = [...getTasks()];
      const targetTask = newTasks[selectedIndex()];
      const editedTask = { ...targetTask, done: false };
      newTasks.splice(selectedIndex(), 1);
      const targetIndex = newTasks.findIndex((task) => task.done);
      if (targetIndex === -1) {
        newTasks.splice(selectedIndex(), 0, editedTask);
      } else {
        newTasks.splice(targetIndex, 0, editedTask);
        setSelectedIndex(targetIndex);
      }
      setTasks(newTasks);
    },
    { preventDefault: true, requireReset: true }
  );

  createShortcut(
    Bindings[HotKeys.SWAP_UP],
    () => {
      console.log("SWAP UP", selectedIndex());
      if (selectedIndex() === 0) return;
      const newTasks = [...getTasks()];
      const task = newTasks[selectedIndex()];
      newTasks[selectedIndex()] = newTasks[selectedIndex() - 1];
      newTasks[selectedIndex() - 1] = task;
      setTasks(newTasks);
      setSelectedIndex(selectedIndex() - 1);
    },
    { preventDefault: true, requireReset: true }
  );

  createShortcut(
    Bindings[HotKeys.SWAP_DOWN],
    () => {
      console.log("SWAP DOWN", selectedIndex());
      if (selectedIndex() === getTasks().length - 1) return;
      const newTasks = [...getTasks()];
      const task = newTasks[selectedIndex()];
      newTasks[selectedIndex()] = newTasks[selectedIndex() + 1];
      newTasks[selectedIndex() + 1] = task;
      setTasks(newTasks);
      setSelectedIndex(selectedIndex() + 1);
    },
    { preventDefault: true, requireReset: true }
  );

  createShortcut(
    Bindings[HotKeys.GO_TO_START],
    () => {
      setSelectedIndex(getTasks().length ? 0 : -1);
    },
    { preventDefault: true, requireReset: true }
  );

  createShortcut(
    Bindings[HotKeys.GO_TO_END],
    () => {
      setSelectedIndex(Math.max(getTasks().length - 1, -1));
    },
    { preventDefault: true, requireReset: true }
  );

  const onEditTaskTitle = (uuid: string, newTitle: string): undefined => {
    setTasksByUuid(
      uuid,
      (task) => {
        return { ...task, title: newTitle };
      }
    );
  };

  const onEditListTitle = (index: number, newTitle: string): undefined => {
    const newList = { ...taskLists[index] };
    newList.title = newTitle;
    setTaskLists(index, newList);
    console.log("List title changed", index, newTitle);
  };

  return (
    <div>
      <h1>
        todo<span class="yo-accent">yo.</span>
      </h1>

      <div ref={todoListsRef} class="todo-lists">
        <For each={taskLists}>{(currList, i) => (
          <div id={`todo-list-${i()}`} class="container">
            <div class="row">
              <TodoTitle
                text={currList.title}
                done={currList.done}
                selected={i() === selectedListIndex() && selectedIndex() === -1}
                doFocus={i() === selectedListIndex() && selectedIndex() === -1 && doFocus()}
                onEdit={(newTitle: string) => { onEditListTitle(i(), newTitle) }}
              />
            </div>

            <div class="row">
              <For each={currList.tasks}>
                {(task, j) => (
                  <TaskWidget
                    task={task}
                    index={j()}
                    selected={i() === selectedListIndex() && j() === selectedIndex()}
                    doFocus={i() === selectedListIndex() && j() === selectedIndex() && doFocus()}
                    onEditTaskTitle={onEditTaskTitle}
                    onTouch={() => {
                      setSelectedIndex(j())
                      setSelectedListIndex(i())
                    }}
                  />
                )}
              </For>
            </div>

            <div class="row">
              <button class="add-task" onClick={createNewTask}>
                +
              </button>
            </div>
          </div>
        )}</For>
        {/* Ghost container to make sure scrolling always works */}
        <div class="container"></div>
      </div>
    </div>
  );
}

export default App;
