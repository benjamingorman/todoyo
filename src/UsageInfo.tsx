interface UsageInfoProps {
	toggle: boolean;
	triggerToggle: () => void;
}

export const UsageInfo = (props: UsageInfoProps) => {
	const classes = () => [
		"usage-info",
		props.toggle ? "toggle-on" : "toggle-off",
	];

	return (
		<div class={classes().join(" ")}>
			<div class="help-trigger" onClick={() => props.triggerToggle()}>
				?
			</div>
			<div class="content">
				<h3>Usage</h3>
				<div class="row">
					<div class="col">
						<span class="keycap">Esc</span> Normal mode
					</div>
				</div>

				<div class="row">
					<div class="col">
						<span class="keycap">j</span> Go down
					</div>
					<div class="col">
						<span class="keycap">k</span> Go up
					</div>
					<div class="col">
						<span class="keycap">o</span> New item
					</div>
				</div>

				<div class="row">
					<div class="col">
						<span class="keycap">h</span> Prev list
					</div>
					<div class="col">
						<span class="keycap">l</span> Next list
					</div>
					<div class="col">
						<span class="keycap">x</span> Mark done
					</div>
				</div>

				<div class="row">
					<div class="col">
						<span class="keycap">u</span> Undo mark
					</div>
					<div class="col">
						<span class="keycap">i</span> Edit item
					</div>
					<div class="col">
						<span class="keycap">z</span> Help
					</div>
				</div>
			</div>
		</div>
	);
};
