const { Grid } = agGrid;

let rowData = [];

const saveToLocal = () => {
  console.log("saveToLocal called");
  if (!gridOptions.api) {
    console.warn("Grid API not ready yet - cannot save");
    return;
  }
  const data = [];
  gridOptions.api.forEachNode((node) => data.push(node.data));
  localStorage.setItem("todos", JSON.stringify(data));
};

const restoreFromLocal = () => {
  console.log("restoreFromLocal called");
  try {
    const raw = localStorage.getItem("todos");
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error("Failed to parse todos from localStorage", e);
    return [];
  }
};

const columnDefs = [
  {
    headerName: "Done",
    field: "done",
    width: 90,
    cellRenderer: (params) => {
      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.checked = !!params.value;
      cb.className = "checkbox";
      cb.addEventListener("change", () => {
        params.node.setDataValue("done", cb.checked);
        saveToLocal();
      });
      return cb;
    },
    sortable: false,
    filter: false,
  },
  { headerName: "Task", field: "task", flex: 1, editable: true },
  {
    headerName: "Priority",
    field: "priority",
    width: 120,
    editable: true,
    cellEditor: "agSelectCellEditor",
    cellEditorParams: { values: ["Low", "Medium", "High"] },
  },
  { headerName: "Due", field: "due", width: 140, editable: true },
  {
    headerName: "Actions",
    field: "actions",
    width: 90,
    cellRenderer: (params) => {
      const btn = document.createElement("button");
      btn.innerText = "✕";
      btn.className = "remove-btn";
      btn.addEventListener("click", () => {
        gridOptions.api.applyTransaction({ remove: [params.node.data] });
        saveToLocal();
      });
      return btn;
    },
    sortable: false,
    filter: false,
  },
];

const gridOptions = {
  columnDefs,
  rowData,
  defaultColDef: { resizable: true, sortable: true },
  animateRows: true,
  onCellValueChanged: () => saveToLocal(),
  onGridReady: (params) => {
    console.log("grid ready");
    // load persisted todos
    const loaded = restoreFromLocal();
    if (loaded && loaded.length) {
      params.api.setRowData(loaded);
    }

    // wire UI buttons once the grid is ready
    const addEl = document.getElementById("add-btn");
    const saveEl = document.getElementById("save-btn");
    const restoreEl = document.getElementById("restore-btn");
    if (addEl) addEl.addEventListener("click", addTodo);
    if (saveEl) saveEl.addEventListener("click", saveToLocal);
    if (restoreEl)
      restoreEl.addEventListener("click", () => {
        const data = restoreFromLocal();
        params.api.setRowData(data);
      });
  },
};

const addBtn = () => document.getElementById("add-btn");

const addTodo = () => {
  const taskInput = document.getElementById("new-task");
  const priorityInput = document.getElementById("new-priority");
  const dueInput = document.getElementById("new-due");
  const task = taskInput.value && taskInput.value.trim() ? taskInput.value.trim() : "New Task";
  const priority = priorityInput.value || "Medium";
  const due = dueInput.value || "";
  const newRow = { done: false, task, priority, due };
  gridOptions.api.applyTransaction({ add: [newRow], addIndex: 0 });
  taskInput.value = "";
  dueInput.value = "";
  saveToLocal();
};

const saveBtn = () => document.getElementById("save-btn");
const restoreBtn = () => document.getElementById("restore-btn");

const setupGrid = () => {
  const gridDiv = document.getElementById("grid");
  new Grid(gridDiv, gridOptions);
};

document.addEventListener("DOMContentLoaded", setupGrid);