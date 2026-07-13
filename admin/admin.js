const guestsApiUrl = new URL(
  "../api/guests",
  document.querySelector('script[src$="admin.js"]').src
).href;
const ADMIN_TOKEN_KEY = "yeray-xv-admin-token";

let guests = [];
let editingIndex = null;

const guestForm = document.querySelector("#guestForm");
const tokenInput = document.querySelector("#adminToken");
const nameInput = document.querySelector("#adminGuestName");
const passesInput = document.querySelector("#adminGuestPasses");
const guestList = document.querySelector("#adminGuestList");
const feedback = document.querySelector("#adminFeedback");
const clearGuests = document.querySelector("#clearGuests");

tokenInput.value = sessionStorage.getItem(ADMIN_TOKEN_KEY) || "";

function setFeedback(message) {
  feedback.textContent = message;
}

function getAdminToken() {
  const token = tokenInput.value.trim();

  if (token) {
    sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
  }

  return token;
}

async function loadGuests() {
  const response = await fetch(guestsApiUrl, { cache: "no-store" });

  if (!response.ok) {
    throw new Error("No se pudo cargar la lista de invitados.");
  }

  const data = await response.json();
  return Array.isArray(data.guests) ? data.guests : [];
}

async function saveGuests(nextGuests) {
  const token = getAdminToken();

  if (!token) {
    throw new Error("Escribe la clave de administrador.");
  }

  const response = await fetch(guestsApiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Admin-Token": token,
    },
    body: JSON.stringify({ guests: nextGuests }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "No se pudo guardar la lista.");
  }

  return Array.isArray(data.guests) ? data.guests : nextGuests;
}

function renderGuests() {
  guestList.innerHTML = "";

  if (!guests.length) {
    const empty = document.createElement("p");
    empty.className = "admin-empty";
    empty.textContent = "Todavía no hay invitados registrados.";
    guestList.append(empty);
    return;
  }

  guests.forEach((guest, index) => {
    const item = document.createElement("article");
    const text = document.createElement("div");
    const name = document.createElement("strong");
    const passes = document.createElement("span");
    const actions = document.createElement("div");
    const editButton = document.createElement("button");
    const deleteButton = document.createElement("button");

    item.className = "admin-guest-item";
    actions.className = "admin-guest-actions";
    editButton.className = "admin-icon-button";
    deleteButton.className = "admin-icon-button";
    editButton.type = "button";
    deleteButton.type = "button";

    name.textContent = guest.name;
    passes.textContent = guest.passes;
    editButton.textContent = "Editar";
    deleteButton.textContent = "Eliminar";

    editButton.addEventListener("click", () => {
      nameInput.value = guest.name;
      passesInput.value = guest.passes;
      editingIndex = index;
      nameInput.focus();
      setFeedback("Edita los datos y vuelve a guardar el invitado.");
    });

    deleteButton.addEventListener("click", async () => {
      const nextGuests = guests.filter((_, guestIndex) => guestIndex !== index);

      try {
        guests = await saveGuests(nextGuests);
        editingIndex = null;
        renderGuests();
        setFeedback("Invitado eliminado.");
      } catch (error) {
        setFeedback(error.message);
      }
    });

    text.append(name, passes);
    actions.append(editButton, deleteButton);
    item.append(text, actions);
    guestList.append(item);
  });
}

async function refreshGuests() {
  guests = await loadGuests();
  renderGuests();
}

guestForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const name = nameInput.value.trim();
  const passes = passesInput.value.trim();

  if (!name || !passes) {
    setFeedback("Completa el nombre y los cupos.");
    return;
  }

  const nextGuests = [...guests];

  if (editingIndex === null) {
    nextGuests.push({ name, passes });
  } else {
    nextGuests[editingIndex] = { name, passes };
  }

  nextGuests.sort((a, b) => a.name.localeCompare(b.name, "es"));

  try {
    guests = await saveGuests(nextGuests);
    renderGuests();
    guestForm.reset();
    editingIndex = null;
    nameInput.focus();
    setFeedback("Invitado guardado en la nube.");
  } catch (error) {
    setFeedback(error.message);
  }
});

clearGuests.addEventListener("click", async () => {
  try {
    guests = await saveGuests([]);
    editingIndex = null;
    renderGuests();
    setFeedback("Lista limpia.");
  } catch (error) {
    setFeedback(error.message);
  }
});

refreshGuests().catch((error) => {
  setFeedback(error.message);
  renderGuests();
});
