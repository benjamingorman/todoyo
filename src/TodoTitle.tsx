
import { createEffect } from "solid-js";

interface TodoTitleProps {
  text: string;
  done: boolean;
  selected: boolean;
  doFocus: boolean;
  onEdit: (newTitle: string) => undefined;
}

export const TodoTitle = (props: TodoTitleProps) => {
  let ref: HTMLInputElement | undefined;

  createEffect(() => {
    if (props.doFocus) {
      console.log("TodoTitle createEffect focus");
      ref?.focus();
    }
  });

  const classes = () => [
    "todo-title",
    props.done ? "done" : "",
    props.selected ? "selected" : "",
  ];

  return (
    <div class={classes().join(" ")}>
      <div class="title-accent"></div>
      <div class="title-wrapper">
        <input ref={ref}
          value={props.text}
          onChange={(e) => { props.onEdit(e.currentTarget.value); }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === "Escape") {
              ref?.blur();
            }
            e.stopPropagation();
          }}
        >
        </input>
      </div>
    </div >
  );
};
