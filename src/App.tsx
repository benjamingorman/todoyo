import { For, createEffect, createSignal } from "solid-js";
import { createStore } from "solid-js/store";
import { Store } from "tauri-plugin-store-api";
import { AppApi } from "./AppApi";
import { configureDefaultHandlers } from "./Handlers";
import { MessageBroker } from "./MessageBroker";
import { TaskData, type TaskList, TaskWidget } from "./TodoTask";
import { TodoTitle } from "./TodoTitle";
import { UsageInfo } from "./UsageInfo";

interface SaveData {
	taskLists: TaskList[];
	selectedListIndex: number;
	selectedIndex: number;
	showHelp: boolean;
}

const SETTINGS_VERSION = 1;
let DONE_LOAD_TASKS = false;

function App() {
	const initTask = new TaskData();
	initTask.title = "New task";
	const initList: TaskList = { title: "Tasks", tasks: [initTask], done: false };
	const [taskLists, setTaskLists] = createStore<TaskList[]>([initList]);
	const [selectedListIndex, setSelectedListIndex] = createSignal(0);
	// -1 means no task is selected and we're editing the list title
	const [selectedIndex, setSelectedIndex] = createSignal(-1);
	const [doFocus, setDoFocus] = createSignal(false);
	const [showHelp, setShowHelp] = createSignal(true);
	const store = new Store(`.tasks.${SETTINGS_VERSION}.dat`);

	let todoListsRef: HTMLDivElement | undefined;

	const api = new AppApi({
		getTaskLists: () => taskLists,
		setTaskLists,
		selectedListIndex,
		setSelectedListIndex,
		selectedIndex,
		setSelectedIndex,
		doFocus,
		setDoFocus,
		showHelp,
		setShowHelp,
	});

	const broker = new MessageBroker(api);
	broker.setupHotkeys();
	configureDefaultHandlers(api, broker);

	createEffect(() => {
		if (!todoListsRef) return;
		const listRef = document.getElementById(`todo-list-${selectedListIndex()}`);
		console.log("listRef", listRef);
		if (!listRef) return;
		console.log("scrolling to", todoListsRef);
		// setTimeout(
		// 	() =>
		// 		todoListsRef.scrollTo({
		// 			left: listRef.offsetLeft - 2,
		// 			behavior: "smooth",
		// 		}),
		// 	1,
		// );
	});

	// Save/load tasks from store
	createEffect(() => {
		const saveData: SaveData = {
			taskLists: taskLists,
			selectedListIndex: selectedListIndex(),
			selectedIndex: selectedIndex(),
			showHelp: showHelp(),
		};
		console.log("Saving tasks...", saveData);
		// Use different save data for dev and prod
		store.set(`saveData-${window.location.host}`, saveData);
		store.save();
	});

	if (!DONE_LOAD_TASKS) {
		store.get(`saveData-${window.location.host}`).then(
			(data) => {
				if (!data) {
					console.error("No save data found in store");
					return;
				}

				const saveData = data as SaveData;
				if (!saveData.taskLists) {
					console.error("No lists found in saveData");
					return;
				}

				setTaskLists(saveData.taskLists);
				setSelectedListIndex(saveData.selectedListIndex);
				setSelectedIndex(saveData.selectedIndex);
				setShowHelp(saveData.showHelp);
			},
			(e) => {
				console.error("No tasks found in store", e);
			},
		);
		DONE_LOAD_TASKS = true;
	}

	return (
		<div id="App">
			<div ref={todoListsRef} class="todo-lists">
				<For each={taskLists}>
					{(currList, i) => (
						<div id={`todo-list-${i()}`} class="container">
							<div class="row">
								<TodoTitle
									text={currList.title}
									done={currList.done}
									selected={
										i() === selectedListIndex() && selectedIndex() === -1
									}
									doFocus={
										i() === selectedListIndex() &&
										selectedIndex() === -1 &&
										doFocus()
									}
									onEdit={(...args) => {
										api.onEditListTitle(i(), ...args);
									}}
								/>
							</div>

							<div class="row">
								<For each={currList.tasks}>
									{(task, j) => (
										<TaskWidget
											task={task}
											index={j()}
											selected={
												i() === selectedListIndex() && j() === selectedIndex()
											}
											doFocus={
												i() === selectedListIndex() &&
												j() === selectedIndex() &&
												doFocus()
											}
											onEditTaskTitle={(...args) =>
												api.onEditTaskTitle(...args)
											}
											onTouch={() => {
												setSelectedIndex(j());
												setSelectedListIndex(i());
											}}
										/>
									)}
								</For>
							</div>

							<div class="row">
								<button class="add-task" onClick={() => api.createNewTask()}>
									+
								</button>
							</div>
						</div>
					)}
				</For>
				{/* Ghost container to make sure scrolling always works */}
				<div class="container" />
			</div>

			<UsageInfo
				toggle={showHelp()}
				triggerToggle={() => setShowHelp(!showHelp())}
			/>
		</div>
	);
}

export default App;
