export const UsageInfo = () => {
  return (
    <div class="usage-info">
      <h3>Usage</h3>
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
          <span class="keycap">?</span> Help
        </div>
      </div>
    </div>
  );
}
