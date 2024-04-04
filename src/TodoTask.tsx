import { autofocus } from "@solid-primitives/autofocus";
import { createEffect } from "solid-js";
import uuid4 from "uuid4";

autofocus;

export interface TaskList {
  title: string;
  done: boolean;
  tasks: TaskData[];
}

export class TaskData {
  uuid: string;
  title: string;
  done: boolean;

  constructor() {
    this.uuid = uuid4();
    this.title = "";
    this.done = false;
  }
}

type TaskWidgetProps = {
  task: TaskData;
  doFocus: boolean;
  selected: boolean;
  index: number;
  onEditTaskTitle: (uuid: string, newTitle: string) => undefined;
  onTouch: () => any;
};

export const TaskWidget = (props: TaskWidgetProps) => {
  // const [title, setTitle] = createSignal(props.task.title);

  let inputRef: HTMLInputElement | undefined;

  createEffect(() => {
    if (props.doFocus) inputRef?.focus();
  });

  const classes = () => [
    props.selected ? "selected" : "",
    props.task.done ? "task-done" : "",
  ];

  return (
    <article class={classes().join(" ")} onClick={props.onTouch}>
      <div class="task-accent"></div>
      <input
        ref={inputRef}
        class={classes().join(" ")}
        value={props.task.title}
        onChange={(e) =>
          props.onEditTaskTitle(props.task.uuid, e.currentTarget.value)
        }
        onKeyDown={(e) => {
          console.log("input keydown", e.key);
          if (e.key === "Enter" || e.key === "Escape") {
            inputRef?.blur();
          }
          e.stopPropagation();
        }}
      ></input>
    </article>
  );
};
