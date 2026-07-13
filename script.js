const invitation = {
  name: "Yeray Pacheco",
  title: "Mis 15 - Yeray Pacheco",
  guestName: "Nombre de invitado",
  guestPasses: "# Cupos",
  startsAt: "2026-08-01T20:00:00-05:00",
  endsAt: "2026-08-02T02:00:00-05:00",
  locationName: "Salón de eventos El York",
  address: "Blas de Lezo",
  mapsUrl: "https://maps.app.goo.gl/c2pcLYeJusupSj8Z9",
  description:
    "Acompáñanos a celebrar los 15 años de Yeray Pacheco. Código de vestimenta: formal. Lluvia de sobres.",
  rsvpUrl:
    "https://wa.me/573007460242?text=Confirmo%20mi%20asistencia%20a%20los%2015%20de%20Yeray%20Pacheco",
  playlistUrl:
    "https://open.spotify.com/embed/playlist/2nZ7jUZ7UAs8LUvLSmN4Fs?utm_source=generator",
  socials: {
    instagram:
      "https://www.instagram.com/yerapachecor_?igsh=MWRheGpqazliNnhwcA%3D%3D&utm_source=qr",
    tiktok: "https://www.tiktok.com/@yera.pacheco2?_r=1&_t=ZS-97gYq3Bptxg",
    facebook: "https://www.facebook.com/share/1EUYah9m7h/?mibextid=wwXIfr",
  },
};

const GUEST_STORAGE_KEY = "yeray-xv-guests";

const defaultGuestList = [
  { name: "Nombre de invitado", passes: "# Cupos" },
  { name: "Familia Rodríguez Piña", passes: "4 Cupos" },
  { name: "Familia Pacheco Cardona", passes: "4 Cupos" },
  { name: "Invitado especial", passes: "2 Cupos" },
];

function loadGuestList() {
  try {
    const storedGuestList = localStorage.getItem(GUEST_STORAGE_KEY);

    if (!storedGuestList) {
      return defaultGuestList;
    }

    const storedGuests = JSON.parse(storedGuestList);

    if (!Array.isArray(storedGuests)) {
      return defaultGuestList;
    }

    return storedGuests.filter(
      (guest) => guest && guest.name && guest.passes
    );
  } catch {
    return defaultGuestList;
  }
}

const guestList = loadGuestList();

const formatEventDate = new Intl.DateTimeFormat("es-CO", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

const formatCalendarMonth = new Intl.DateTimeFormat("es-CO", {
  month: "long",
  year: "numeric",
});

const formatCalendarNote = new Intl.DateTimeFormat("es-CO", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

const pad = (value) => String(value).padStart(2, "0");

function normalizeSearch(value) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

const fallbackImage =
  "data:image/svg+xml;charset=UTF-8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1600">
      <defs>
        <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stop-color="#fff7f6"/>
          <stop offset="0.48" stop-color="#f3d7d2"/>
          <stop offset="1" stop-color="#f3d7ad"/>
        </linearGradient>
      </defs>
      <rect width="1200" height="1600" fill="url(#bg)"/>
      <circle cx="600" cy="660" r="310" fill="none" stroke="#b9864f" stroke-width="10" opacity=".5"/>
      <text x="600" y="690" text-anchor="middle" font-family="Georgia, serif" font-size="120" fill="#7d3f3a">Yeray Pacheco</text>
      <text x="600" y="790" text-anchor="middle" font-family="Arial, sans-serif" font-size="42" fill="#745c58">Mis 15 años</text>
    </svg>
  `);

function updateCountdown() {
  const target = new Date(invitation.startsAt).getTime();
  const remaining = Math.max(target - Date.now(), 0);
  const totalSeconds = Math.floor(remaining / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  document.querySelector("#days").textContent = pad(days);
  document.querySelector("#hours").textContent = pad(hours);
  document.querySelector("#minutes").textContent = pad(minutes);
  document.querySelector("#seconds").textContent = pad(seconds);
}

function toCalendarStamp(dateString) {
  return new Date(dateString).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

function buildGoogleCalendarUrl() {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: invitation.title,
    dates: `${toCalendarStamp(invitation.startsAt)}/${toCalendarStamp(invitation.endsAt)}`,
    details: invitation.description,
    location: `${invitation.locationName}, ${invitation.address}`,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function buildOutlookCalendarUrl() {
  const params = new URLSearchParams({
    path: "/calendar/action/compose",
    rru: "addevent",
    subject: invitation.title,
    startdt: new Date(invitation.startsAt).toISOString(),
    enddt: new Date(invitation.endsAt).toISOString(),
    body: invitation.description,
    location: `${invitation.locationName}, ${invitation.address}`,
  });

  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}

function buildIcsFile() {
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Yeray Pacheco//Invitación XV//ES",
    "BEGIN:VEVENT",
    `UID:${Date.now()}@yeray-pacheco-xv`,
    `DTSTAMP:${toCalendarStamp(new Date().toISOString())}`,
    `DTSTART:${toCalendarStamp(invitation.startsAt)}`,
    `DTEND:${toCalendarStamp(invitation.endsAt)}`,
    `SUMMARY:${invitation.title}`,
    `DESCRIPTION:${invitation.description}`,
    `LOCATION:${invitation.locationName}, ${invitation.address}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  return URL.createObjectURL(
    new Blob([ics], { type: "text/calendar;charset=utf-8" })
  );
}

function renderEventCalendar() {
  const eventDate = new Date(invitation.startsAt);
  const year = eventDate.getFullYear();
  const month = eventDate.getMonth();
  const eventDay = eventDate.getDate();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const mondayFirstOffset = (firstDay.getDay() + 6) % 7;
  const calendarDays = document.querySelector("#calendarDays");

  document.querySelector("#calendarMonth").textContent =
    formatCalendarMonth.format(eventDate);
  document.querySelector("#calendarEventNote").textContent =
    `Celebración: ${formatCalendarNote.format(eventDate)}`;

  calendarDays.innerHTML = "";

  for (let index = 0; index < mondayFirstOffset; index += 1) {
    const emptyDay = document.createElement("span");
    emptyDay.className = "calendar-day calendar-day--empty";
    emptyDay.setAttribute("aria-hidden", "true");
    calendarDays.append(emptyDay);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const dayElement = document.createElement("span");
    dayElement.className = "calendar-day";
    dayElement.textContent = day;

    if (day === eventDay) {
      dayElement.classList.add("calendar-day--event");
      dayElement.setAttribute("aria-label", `Día de la celebración, ${day}`);
    }

    calendarDays.append(dayElement);
  }
}

function hydrateInvitation() {
  document.title = invitation.title;
  document.querySelector("#guestName").textContent = invitation.guestName;

  const guestPasses = document.querySelector("#guestPasses");
  const guestPassesCard = guestPasses.closest(".guest-message__passes");
  if (invitation.guestPasses) {
    guestPasses.textContent = invitation.guestPasses;
    guestPassesCard.hidden = false;
  } else {
    guestPassesCard.hidden = true;
  }

  document.querySelector("#eventDateText").textContent =
    formatEventDate.format(new Date(invitation.startsAt));
  document.querySelector("#playlistFrame").src = invitation.playlistUrl;
  document.querySelector("#locationText").textContent =
    `${invitation.locationName} - ${invitation.address}`;
  document.querySelector("#mapsButton").href = invitation.mapsUrl;
  document.querySelector("#rsvpButton").href = invitation.rsvpUrl;

  const googleUrl = buildGoogleCalendarUrl();
  const outlookUrl = buildOutlookCalendarUrl();
  const icsUrl = buildIcsFile();

  document.querySelector("#heroCalendar").href = googleUrl;
  document.querySelector("#googleCalendar").href = googleUrl;
  document.querySelector("#outlookCalendar").href = outlookUrl;
  document.querySelector("#downloadIcs").href = icsUrl;
  document.querySelector("#downloadIcs").download = "mis-15-yeray-pacheco.ics";

  document.querySelector("#instagramLink").href = invitation.socials.instagram;
  document.querySelector("#tiktokLink").href = invitation.socials.tiktok;
  document.querySelector("#facebookLink").href = invitation.socials.facebook;

  document.querySelectorAll("img").forEach((image) => {
    const replaceMissingImage = () => {
      image.src = fallbackImage;
    };

    image.addEventListener("error", replaceMissingImage, { once: true });

    if (image.complete && image.naturalWidth === 0) {
      replaceMissingImage();
    }
  });

  renderEventCalendar();
}

function lockInvitation(isLocked) {
  document.body.classList.toggle("guest-gate-active", isLocked);
  document.querySelectorAll("header, main, footer").forEach((section) => {
    section.toggleAttribute("inert", isLocked);
    section.setAttribute("aria-hidden", String(isLocked));
  });
}

function selectGuest(guest) {
  invitation.guestName = guest.name;
  invitation.guestPasses = guest.passes;
  hydrateInvitation();
  lockInvitation(false);
  document.querySelector("#guestGate").hidden = true;
  window.scrollTo({ top: 0, behavior: "auto" });
}

function renderGuestResults(query = "") {
  const results = document.querySelector("#guestResults");
  const normalizedQuery = normalizeSearch(query);
  const filteredGuests = guestList
    .filter((guest) => normalizeSearch(guest.name).includes(normalizedQuery))
    .slice(0, 8);

  results.innerHTML = "";

  if (!filteredGuests.length) {
    const emptyState = document.createElement("p");
    emptyState.className = "guest-gate__empty";
    emptyState.textContent = "No encontramos ese nombre. Revisa la escritura e inténtalo de nuevo.";
    results.append(emptyState);
    return;
  }

  filteredGuests.forEach((guest) => {
    const button = document.createElement("button");
    const name = document.createElement("strong");
    const passes = document.createElement("span");

    button.className = "guest-gate__option";
    button.type = "button";
    name.textContent = guest.name;
    passes.textContent = guest.passes;
    button.append(name, passes);
    button.addEventListener("click", () => selectGuest(guest));
    results.append(button);
  });
}

function setupGuestGate() {
  const searchInput = document.querySelector("#guestSearch");

  lockInvitation(true);
  renderGuestResults();

  searchInput.addEventListener("input", (event) => {
    renderGuestResults(event.target.value);
  });

  window.requestAnimationFrame(() => searchInput.focus());
}

function setupRevealAnimations() {
  const animatedElements = document.querySelectorAll(
    [
      ".topbar a",
      ".hero__content > *",
      ".guest-message > *",
      ".section-heading",
      ".intro__text",
      ".intro__photo",
      ".event-calendar",
      ".timer > div",
      ".calendar-actions > *",
      ".details__intro",
      ".detail-card",
      ".music__copy",
      ".player-shell",
      ".location > *",
      ".gallery img",
      ".rsvp > *",
      ".social > *",
      "footer",
    ].join(",")
  );

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    animatedElements.forEach((element) => element.classList.add("is-visible"));
    return;
  }

  animatedElements.forEach((element, index) => {
    element.classList.add("reveal");
    element.style.setProperty("--reveal-delay", `${Math.min(index % 6, 5) * 70}ms`);
  });

  if (!("IntersectionObserver" in window)) {
    animatedElements.forEach((element) => element.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "0px 0px -10% 0px", threshold: 0.12 }
  );

  animatedElements.forEach((element) => observer.observe(element));
}

hydrateInvitation();
setupGuestGate();
setupRevealAnimations();
updateCountdown();
setInterval(updateCountdown, 1000);
