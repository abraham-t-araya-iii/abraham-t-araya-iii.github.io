/* =========================================================
   C++ Data Structures Learning Site — interaction scripts
   These demos are JavaScript visualizations, not a C++ compiler.
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  setupMobileNavigation();
  setupTheme();
  setupCopyButtons();
  setupSinglyLinkedList();
  setupDoublyLinkedList();
  setupQueue();
});

// ---------- Shared helpers ----------
function setStatus(element, message, type = "info") {
  if (!element) return;
  element.textContent = message;
  element.className = `status-message ${type}`;
}

function getValue(input) {
  return input ? input.value.trim() : "";
}

function clearInput(input) {
  if (input) input.value = "";
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"]/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"
  }[character]));
}

// ---------- Compact mobile navigation ----------
function setupMobileNavigation() {
  const menuButton = document.getElementById("menuToggle");
  const navigation = document.getElementById("primaryNav");
  if (!menuButton || !navigation) return;

  const closeMenu = () => {
    navigation.classList.remove("is-open");
    menuButton.setAttribute("aria-expanded", "false");
  };

  menuButton.addEventListener("click", () => {
    const isOpen = navigation.classList.toggle("is-open");
    menuButton.setAttribute("aria-expanded", String(isOpen));
  });

  // Close the menu after a learner chooses a section, keeping the screen clear.
  navigation.querySelectorAll("a").forEach(link => link.addEventListener("click", closeMenu));
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeMenu();
  });
  window.matchMedia("(min-width: 761px)").addEventListener("change", event => {
    if (event.matches) closeMenu();
  });
}

// ---------- Light / dark mode ----------
function setupTheme() {
  const button = document.getElementById("themeToggle");
  const text = document.getElementById("themeText");
  if (!button || !text) return;

  function updateLabel() {
    const dark = document.body.classList.contains("dark-mode");
    text.textContent = dark ? "Light" : "Dark";
    button.querySelector("span").textContent = dark ? "☀" : "☾";
  }

  try {
    if (localStorage.getItem("ds-theme") === "dark") document.body.classList.add("dark-mode");
  } catch (error) { /* Theme still works if storage is unavailable. */ }
  updateLabel();

  button.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    try { localStorage.setItem("ds-theme", document.body.classList.contains("dark-mode") ? "dark" : "light"); } catch (error) { /* no action needed */ }
    updateLabel();
  });
}

// ---------- Copy read-only C++ samples ----------
function setupCopyButtons() {
  document.querySelectorAll(".copy-btn").forEach(button => {
    button.addEventListener("click", async () => {
      const code = document.getElementById(button.dataset.copy);
      if (!code) return;
      const original = button.textContent;
      try {
        await navigator.clipboard.writeText(code.innerText);
      } catch (error) {
        // Fallback also works when the page was opened by double-clicking index.html.
        const area = document.createElement("textarea");
        area.value = code.innerText;
        document.body.appendChild(area);
        area.select();
        document.execCommand("copy");
        area.remove();
      }
      button.textContent = "Copied!";
      setTimeout(() => { button.textContent = original; }, 1400);
    });
  });
}

// ---------- Week 7–8: Singly linked list ----------
function setupSinglyLinkedList() {
  const input = document.getElementById("sllInput");
  const actionInput = document.getElementById("sllActionInput");
  const nodes = document.getElementById("sllNodes");
  const status = document.getElementById("sllStatus");
  const counter = document.getElementById("sllCounter");
  if (!input || !actionInput || !nodes || !status || !counter) return;

  let ids = [];

  function render(highlight = "", deleting = "") {
    counter.textContent = `${ids.length} / 5 IDs`;
    if (!ids.length) {
      nodes.innerHTML = '<p class="empty-state">No IDs in the linked list yet.</p>';
      return;
    }
    nodes.innerHTML = ids.map((id, index) => {
      const className = id === highlight ? "found" : id === deleting ? "deleting" : "";
      const arrow = index < ids.length - 1 ? '<i class="node-arrow" aria-hidden="true">→</i>' : "";
      return `<div class="interactive-node ${className}"><span class="node-value">${escapeHtml(id)}</span><span class="node-next">→</span></div>${arrow}`;
    }).join("");
  }

  function validId(id) {
    return /^\d{3,12}$/.test(id);
  }

  document.getElementById("sllAdd").addEventListener("click", () => {
    const id = getValue(input);
    if (!validId(id)) return setStatus(status, "Enter a student ID using 3–12 digits.", "error");
    if (ids.length >= 5) return setStatus(status, "Linked list is full. You can only add five student IDs.", "error");
    if (ids.includes(id)) return setStatus(status, "That student ID is already in the list.", "error");
    ids.push(id);
    clearInput(input);
    render();
    setStatus(status, `Added ID ${id} to the end of the linked list.`, "success");
  });

  document.getElementById("sllDisplay").addEventListener("click", () => {
    render();
    setStatus(status, ids.length ? `List: ${ids.join(" → ")} → NULL` : "The linked list is empty.", ids.length ? "info" : "error");
  });

  document.getElementById("sllSearch").addEventListener("click", () => {
    const id = getValue(actionInput);
    if (!validId(id)) return setStatus(status, "Enter the student ID that you want to search.", "error");
    if (!ids.includes(id)) { render(); return setStatus(status, `ID ${id} not found.`, "error"); }
    render(id);
    setStatus(status, `ID ${id} found in the linked list.`, "success");
  });

  document.getElementById("sllDelete").addEventListener("click", () => {
    const id = getValue(actionInput);
    const index = ids.indexOf(id);
    if (!validId(id)) return setStatus(status, "Enter the student ID that you want to delete.", "error");
    if (index === -1) return setStatus(status, `ID ${id} not found, so nothing was deleted.`, "error");
    render("", id);
    setTimeout(() => {
      ids.splice(index, 1);
      render();
      clearInput(actionInput);
      setStatus(status, `Deleted ID ${id}. The updated linked list is shown below.`, "success");
    }, 260);
  });
}

// ---------- Week 9: Doubly linked list ----------
function setupDoublyLinkedList() {
  const addInput = document.getElementById("dllInput");
  const findInput = document.getElementById("dllFindInput");
  const newInput = document.getElementById("dllNewInput");
  const nodes = document.getElementById("dllNodes");
  const status = document.getElementById("dllStatus");
  const counter = document.getElementById("dllCounter");
  if (!addInput || !findInput || !newInput || !nodes || !status || !counter) return;

  let values = [];
  const parseInteger = input => /^-?\d+$/.test(getValue(input)) ? Number(getValue(input)) : null;

  function render(highlight = "") {
    counter.textContent = `${values.length} / 5 values`;
    if (!values.length) {
      nodes.innerHTML = '<p class="empty-state">No values in the doubly linked list yet.</p>';
      return;
    }
    nodes.innerHTML = values.map((value, index) => {
      const arrow = index < values.length - 1 ? '<i class="node-arrow" aria-hidden="true">↔</i>' : "";
      return `<div class="dll-node-demo ${String(value) === String(highlight) ? "found" : ""}"><span>prev<br>${index ? "←" : "NULL"}</span><span class="data">${value}</span><span>next<br>${index < values.length - 1 ? "→" : "NULL"}</span></div>${arrow}`;
    }).join("");
  }

  document.getElementById("dllAdd").addEventListener("click", () => {
    const value = parseInteger(addInput);
    if (value === null) return setStatus(status, "Enter a whole number to add.", "error");
    if (values.length >= 5) return setStatus(status, "Doubly linked list is full. It accepts only five values.", "error");
    values.push(value);
    clearInput(addInput);
    render();
    setStatus(status, `Added ${value}. Each node now has prev, data, and next links.`, "success");
  });

  document.getElementById("dllForward").addEventListener("click", () => {
    render();
    setStatus(status, values.length ? `Forward: ${values.join(" → ")}` : "The list is empty.", values.length ? "info" : "error");
  });

  document.getElementById("dllBackward").addEventListener("click", () => {
    render();
    setStatus(status, values.length ? `Backward: ${[...values].reverse().join(" ← ")}` : "The list is empty.", values.length ? "info" : "error");
  });

  document.getElementById("dllSearch").addEventListener("click", () => {
    const value = parseInteger(findInput);
    if (value === null) return setStatus(status, "Enter a whole number to search for.", "error");
    if (!values.includes(value)) { render(); return setStatus(status, `Value ${value} not found.`, "error"); }
    render(value);
    setStatus(status, `Value ${value} found in the doubly linked list.`, "success");
  });

  document.getElementById("dllUpdate").addEventListener("click", () => {
    const oldValue = parseInteger(findInput);
    const newValue = parseInteger(newInput);
    if (oldValue === null || newValue === null) return setStatus(status, "Enter both the old value and the new value.", "error");
    const index = values.indexOf(oldValue);
    if (index === -1) return setStatus(status, `Value ${oldValue} not found, so it cannot be updated.`, "error");
    values[index] = newValue;
    render(newValue);
    clearInput(newInput);
    setStatus(status, `Updated ${oldValue} to ${newValue}.`, "success");
  });

  document.getElementById("dllDelete").addEventListener("click", () => {
    const value = parseInteger(findInput);
    if (value === null) return setStatus(status, "Enter the whole number that you want to delete.", "error");
    const index = values.indexOf(value);
    if (index === -1) return setStatus(status, `Value ${value} not found, so nothing was deleted.`, "error");
    values.splice(index, 1);
    render();
    clearInput(findInput);
    setStatus(status, `Deleted ${value}. The prev and next links have been updated.`, "success");
  });
}

// ---------- Week 10–11: Queue structures ----------
function setupQueue() {
  const type = document.getElementById("queueType");
  const input = document.getElementById("queueInput");
  const nodes = document.getElementById("queueNodes");
  const status = document.getElementById("queueStatus");
  const counter = document.getElementById("queueCounter");
  const priorityOptions = document.getElementById("priorityOptions");
  if (!type || !input || !nodes || !status || !counter || !priorityOptions) return;

  const MAX = 5;
  let linear = [];
  let linearRear = -1;
  let circular = Array(MAX).fill(null);
  let circularFront = 0;
  let circularRear = -1;
  let circularCount = 0;
  let priority = [];

  const queueOrder = () => document.querySelector('input[name="priority"]:checked').value;
  const activeItems = () => {
    if (type.value === "linear") return linear;
    if (type.value === "circular") return Array.from({ length: circularCount }, (_, i) => circular[(circularFront + i) % MAX]);
    return [...priority].sort((a, b) => queueOrder() === "min" ? a - b : b - a);
  };
  const setPriorityVisibility = () => { priorityOptions.hidden = type.value !== "priority"; };

  function render() {
    const items = activeItems();
    counter.textContent = `${items.length} / ${MAX} items`;
    if (!items.length) { nodes.innerHTML = '<p class="empty-state">The queue is empty.</p>'; return; }
    nodes.innerHTML = items.map((value, index) => {
      const classes = `queue-item ${index === 0 ? "front" : ""} ${index === items.length - 1 ? "rear" : ""}`;
      const slot = type.value === "circular" ? `<small class="slot">slot ${(circularFront + index) % MAX + 1}</small>` : "";
      return `<div class="${classes}">${value}${slot}</div>`;
    }).join("");
  }

  function getNumber() {
    const value = getValue(input);
    return value !== "" && Number.isFinite(Number(value)) ? Number(value) : null;
  }

  function resetMessage() {
    setPriorityVisibility();
    render();
    const readable = type.options[type.selectedIndex].text.replace(/^\d · /, "");
    setStatus(status, `${readable} selected. This queue starts empty.`, "info");
  }

  document.getElementById("queueEnqueue").addEventListener("click", () => {
    const value = getNumber();
    if (value === null) return setStatus(status, "Enter a valid number to enqueue.", "error");
    if (type.value === "linear") {
      if (linearRear >= MAX - 1) return setStatus(status, "Queue is full. In a linear queue, the rear has reached the last position.", "error");
      linear.push(value); linearRear++;
    } else if (type.value === "circular") {
      if (circularCount >= MAX) return setStatus(status, "Queue is full. Remove an item before adding another.", "error");
      circularRear = (circularRear + 1) % MAX;
      circular[circularRear] = value;
      circularCount++;
    } else {
      if (priority.length >= MAX) return setStatus(status, "Queue is full. This demo accepts five numbers.", "error");
      priority.push(value);
    }
    clearInput(input);
    render();
    setStatus(status, `${value} was enqueued at the rear.`, "success");
  });

  document.getElementById("queueDequeue").addEventListener("click", () => {
    let removed;
    if (type.value === "linear") {
      if (!linear.length) return setStatus(status, "Queue is empty. Nothing can be dequeued.", "error");
      removed = linear.shift();
      if (!linear.length) linearRear = -1; // reset when the queue is completely empty
    } else if (type.value === "circular") {
      if (!circularCount) return setStatus(status, "Queue is empty. Nothing can be dequeued.", "error");
      removed = circular[circularFront];
      circular[circularFront] = null;
      circularFront = (circularFront + 1) % MAX;
      circularCount--;
      if (!circularCount) { circularFront = 0; circularRear = -1; }
    } else {
      if (!priority.length) return setStatus(status, "Queue is empty. Nothing can be dequeued.", "error");
      const sorted = activeItems();
      removed = sorted[0];
      priority.splice(priority.indexOf(removed), 1);
    }
    render();
    setStatus(status, `${removed} was dequeued from the front.`, "success");
  });

  document.getElementById("queuePeek").addEventListener("click", () => {
    const items = activeItems();
    if (!items.length) return setStatus(status, "Queue is empty, so there is no front item to peek at.", "error");
    render();
    setStatus(status, `Peek: the front item is ${items[0]}.`, "success");
  });

  document.getElementById("queueDisplay").addEventListener("click", () => {
    const items = activeItems();
    render();
    if (!items.length) return setStatus(status, "The queue is empty.", "error");
    const label = type.value === "priority" ? `${queueOrder() === "min" ? "Min" : "Max"}-priority order` : "Queue";
    setStatus(status, `${label}: ${items.join(" → ")}`, "info");
  });

  type.addEventListener("change", resetMessage);
  priorityOptions.addEventListener("change", () => {
    render();
    if (type.value === "priority" && priority.length) setStatus(status, `Priority order changed to ${queueOrder() === "min" ? "smallest first" : "largest first"}.`, "info");
  });
  render();
  setPriorityVisibility();
}
