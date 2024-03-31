import { For, createSignal, createEffect, onMount } from "solid-js";
import "./App.css";
import { TaskData, TaskWidget } from "./TodoTask";
import { createShortcut } from "@solid-primitives/keyboard";
import { createStore } from "solid-js/store";
import { Store } from "tauri-plugin-store-api";

enum HotKeys {
  NEW_TASK,
  EDIT_TASK,
  NEXT_ITEM,
  PREV_ITEM,
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
  [HotKeys.DONE_TASK]: ["x"],
  [HotKeys.UNDO_DONE_TASK]: ["u"],
  [HotKeys.SWAP_UP]: ["["],
  [HotKeys.SWAP_DOWN]: ["]"],
  [HotKeys.GO_TO_START]: ["g"],
  [HotKeys.GO_TO_END]: ["Shift", "g"],
};

let DONE_LOAD_TASKS = false;

function App() {
  const initTask = new TaskData();
  initTask.title = "New task";
  const [tasks, setTasks] = createStore([initTask]);
  const [selectedIndex, setSelectedIndex] = createSignal(0);
  const [doFocusTask, setDoFocusTask] = createSignal(false);
  const store = new Store(".settings.dat");

  createEffect(() => {
    store.set("tasks", tasks);
    store.save();
    console.log("Tasks saved", tasks);
  });

  if (!DONE_LOAD_TASKS) {
    store.get("tasks").then(
      (data) => {
        setTasks(data as TaskData[]);
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
    setSelectedIndex(Math.min(targetIndex + 1, tasks.length - 1));
    setDoFocusTask(true);
    setTimeout(() => {
      setDoFocusTask(false);
    });
  };

  createShortcut(Bindings[HotKeys.NEW_TASK], createNewTask, {
    preventDefault: true,
    requireReset: true,
  });

  createShortcut(
    Bindings[HotKeys.EDIT_TASK],
    () => {
      setDoFocusTask(true);
      setTimeout(() => {
        setDoFocusTask(false);
      });
    },
    { preventDefault: true, requireReset: true }
  );

  createShortcut(
    Bindings[HotKeys.NEXT_ITEM],
    () => {
      setSelectedIndex(Math.min(selectedIndex() + 1, tasks.length - 1));
      console.log("Next item", selectedIndex());
    },
    { preventDefault: true, requireReset: true }
  );

  createShortcut(
    Bindings[HotKeys.PREV_ITEM],
    () => {
      setSelectedIndex(Math.max(selectedIndex() - 1, 0));
      console.log("Prev item", selectedIndex());
    },
    { preventDefault: true, requireReset: true }
  );

  createShortcut(
    Bindings[HotKeys.DONE_TASK],
    () => {
      const task = tasks[selectedIndex()];
      if (!task) return;

      console.log("Marking task as done", selectedIndex());

      if (!task.done) {
        // Mark the task as done and move it to either the end
        // or the beginning of the done tasks.
        const newTasks = [...tasks];
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
        const newTasks = tasks.filter((_, i) => i !== selectedIndex());
        setTasks(newTasks);
        // And decrement the index
        setSelectedIndex(Math.max(selectedIndex() - 1, 0));
      }
    },
    { preventDefault: true, requireReset: true }
  );

  createShortcut(
    Bindings[HotKeys.UNDO_DONE_TASK],
    () => {
      const task = tasks[selectedIndex()];
      if (!task || !task.done) return;

      console.log("Marking task as not done", selectedIndex());

      // Mark the task as not done and move it to the end of active tasks.
      const newTasks = [...tasks];
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
      const newTasks = [...tasks];
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
      if (selectedIndex() === tasks.length - 1) return;
      const newTasks = [...tasks];
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
      setSelectedIndex(0);
    },
    { preventDefault: true, requireReset: true }
  );

  createShortcut(
    Bindings[HotKeys.GO_TO_END],
    () => {
      setSelectedIndex(Math.max(tasks.length - 1, 0));
    },
    { preventDefault: true, requireReset: true }
  );

  const onEditTaskTitle = (uuid: string, newTitle: string): undefined => {
    setTasks(
      (task) => task.uuid === uuid,
      (task) => {
        return { ...task, title: newTitle };
      }
    );
  };

  return (
    <div>
      <h1>
        todo<span class="yo-accent">yo.</span>
      </h1>

      {/* <p>
        {selectedIndex()} {`${editingActive()}`}
      </p> */}
      <div class="container">
        <div class="row">
          <For each={tasks}>
            {(task, i) => (
              <TaskWidget
                task={task}
                index={i()}
                selected={i() === selectedIndex()}
                doFocusTask={i() === selectedIndex() && doFocusTask()}
                onEditTaskTitle={onEditTaskTitle}
              />
            )}
          </For>
        </div>

        <div class="row">
          <button onClick={createNewTask}>+</button>
        </div>
      </div>
    </div>
  );
}

export default App;
