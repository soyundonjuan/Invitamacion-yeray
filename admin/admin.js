const GUEST_STORAGE_KEY = "yeray-xv-guests";

const defaultGuests = [
  { name: "Nombre de invitado", passes: "# Cupos" },
  { name: "Familia Rodríguez Piña", passes: "4 Cupos" },
  { name: "Familia Pacheco Cardona", passes: "4 Cupos" },
  { name: "Invitado especial", passes: "2 Cupos" },
];

function loadGuests() {
  try {
    const storedGuests = JSON.parse(localStorage.getItem(GUEST_STORAGE_KEY));
    return Array.isArray(storedGuests) ? storedGuests : defaultGuests;
  } catch {
    return defaultGuests;
  }
}

function saveGuests(guests) {
  localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(guests));
}

let guests = loadGuests();

const guestForm = document.querySelector("#guestForm");
const nameInput = document.querySelector("#adminGuestName");
const passesInput = document.querySelector("#adminGuestPasses");
const guestList = document.querySelector("#adminGuestList");
const feedback = document.querySelector("#adminFeedback");
const clearGuests = document.querySelector("#clearGuests");

function setFeedback(message) {
  feedback.textContent = message;
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
      guests.splice(index, 1);
      saveGuests(guests);
      renderGuests();
      nameInput.focus();
      setFeedback("Edita los datos y vuelve a guardar el invitado.");
    });

    deleteButton.addEventListener("click", () => {
      guests.splice(index, 1);
      saveGuests(guests);
      renderGuests();
      setFeedback("Invitado eliminado.");
    });

    text.append(name, passes);
    actions.append(editButton, deleteButton);
    item.append(text, actions);
    guestList.append(item);
  });
}

guestForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const name = nameInput.value.trim();
  const passes = passesInput.value.trim();

  if (!name || !passes) {
    setFeedback("Completa el nombre y los cupos.");
    return;
  }

  guests.push({ name, passes });
  guests.sort((a, b) => a.name.localeCompare(b.name, "es"));
  saveGuests(guests);
  renderGuests();
  guestForm.reset();
  nameInput.focus();
  setFeedback("Invitado agregado.");
});

clearGuests.addEventListener("click", () => {
  guests = [];
  saveGuests(guests);
  renderGuests();
  setFeedback("Lista limpia.");
});

renderGuests();
