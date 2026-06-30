const invitation = {
  name: "Yeray Pachero",
  title: "Mis 15 - Yeray Pachero",
  startsAt: "2026-12-12T19:00:00-05:00",
  endsAt: "2026-12-13T01:00:00-05:00",
  locationName: "Salon de eventos",
  address: "Direccion por confirmar",
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=Salon%20de%20eventos",
  description:
    "Acompananos a celebrar los 15 anos de Yeray Pachero en una noche especial.",
  playlistUrl:
    "https://open.spotify.com/embed/playlist/37i9dQZF1DX10zKzsJ2jva?utm_source=generator",
  socials: {
    instagram: "https://www.instagram.com/",
    tiktok: "https://www.tiktok.com/",
    whatsapp: "https://wa.me/",
  },
};

const formatEventDate = new Intl.DateTimeFormat("es-CO", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

const pad = (value) => String(value).padStart(2, "0");

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
      <text x="600" y="690" text-anchor="middle" font-family="Georgia, serif" font-size="120" fill="#7d3f3a">Yeray Pachero</text>
      <text x="600" y="790" text-anchor="middle" font-family="Arial, sans-serif" font-size="42" fill="#745c58">Mis 15 anos</text>
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
    "PRODID:-//Yeray Pachero//Invitacion XV//ES",
    "BEGIN:VEVENT",
    `UID:${Date.now()}@yeray-pachero-xv`,
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

function hydrateInvitation() {
  document.title = invitation.title;
  document.querySelector("#eventDateText").textContent =
    formatEventDate.format(new Date(invitation.startsAt));
  document.querySelector("#playlistFrame").src = invitation.playlistUrl;
  document.querySelector("#locationText").textContent =
    `${invitation.locationName} - ${invitation.address}`;
  document.querySelector("#mapsButton").href = invitation.mapsUrl;

  const googleUrl = buildGoogleCalendarUrl();
  const outlookUrl = buildOutlookCalendarUrl();
  const icsUrl = buildIcsFile();

  document.querySelector("#heroCalendar").href = googleUrl;
  document.querySelector("#googleCalendar").href = googleUrl;
  document.querySelector("#outlookCalendar").href = outlookUrl;
  document.querySelector("#downloadIcs").href = icsUrl;
  document.querySelector("#downloadIcs").download = "mis-15-yeray-pachero.ics";

  document.querySelector("#instagramLink").href = invitation.socials.instagram;
  document.querySelector("#tiktokLink").href = invitation.socials.tiktok;
  document.querySelector("#whatsappLink").href = invitation.socials.whatsapp;

  document.querySelectorAll("img").forEach((image) => {
    const replaceMissingImage = () => {
      image.src = fallbackImage;
    };

    image.addEventListener("error", replaceMissingImage, { once: true });

    if (image.complete && image.naturalWidth === 0) {
      replaceMissingImage();
    }
  });
}

hydrateInvitation();
updateCountdown();
setInterval(updateCountdown, 1000);
