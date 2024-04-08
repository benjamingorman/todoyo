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
	let inputRef: HTMLInputElement | undefined;
	let articleRef: HTMLDivElement | undefined;

	createEffect(() => {
		console.log("props", { doFocus: props.doFocus, selected: props.selected });
		if (props.selected && !props.doFocus) {
			console.log("Focusing", inputRef);
			articleRef?.focus();
			articleRef?.scrollIntoView({
				// left: articleRef.offsetLeft - 2,
				behavior: "smooth",
				block: "center",
			});
		}
		if (props.doFocus) {
			console.log("Focusing", inputRef);
			inputRef?.focus();
		}
	});

	const classes = () => [
		props.selected ? "selected" : "",
		props.task.done ? "task-done" : "",
	];

	return (
		<article
			ref={articleRef}
			class={classes().join(" ")}
			onClick={props.onTouch}
		>
			<div class="task-accent" />
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
			/>
		</article>
	);
};
