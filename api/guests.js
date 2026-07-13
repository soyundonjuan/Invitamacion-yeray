const DEFAULT_GUESTS = [
  { name: "Nombre de invitado", passes: "# Cupos" },
  { name: "Familia Rodríguez Piña", passes: "4 Cupos" },
  { name: "Familia Pacheco Cardona", passes: "4 Cupos" },
  { name: "Invitado especial", passes: "2 Cupos" },
];

const owner = process.env.GITHUB_OWNER || "soyundonjuan";
const repo = process.env.GITHUB_REPO || "Invitamacion-yeray";
const branch = process.env.GITHUB_BRANCH || "main";
const guestsPath = process.env.GITHUB_GUESTS_PATH || "data/guests.json";

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}

function encodeBase64(value) {
  return Buffer.from(value, "utf8").toString("base64");
}

function decodeBase64(value) {
  return Buffer.from(value, "base64").toString("utf8");
}

function validateGuests(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((guest) => ({
      name: String(guest?.name || "").trim(),
      passes: String(guest?.passes || "").trim(),
    }))
    .filter((guest) => guest.name && guest.passes);
}

function parseBody(req) {
  if (!req.body) {
    return {};
  }

  if (typeof req.body === "string") {
    return JSON.parse(req.body || "{}");
  }

  return req.body;
}

async function githubRequest(path, options = {}) {
  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    throw new Error("Missing GITHUB_TOKEN");
  }

  const response = await fetch(`https://api.github.com${path}`, {
    ...options,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(options.headers || {}),
    },
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`GitHub ${response.status}: ${errorText}`);
  }

  return response.json();
}

async function readGuestsFile() {
  const content = await githubRequest(
    `/repos/${owner}/${repo}/contents/${guestsPath}?ref=${branch}`
  );

  if (!content) {
    return { guests: DEFAULT_GUESTS, sha: null };
  }

  const guests = validateGuests(JSON.parse(decodeBase64(content.content)));
  return { guests, sha: content.sha };
}

async function writeGuestsFile(guests, sha) {
  const body = {
    message: "Actualizar lista de invitados",
    content: encodeBase64(`${JSON.stringify(guests, null, 2)}\n`),
    branch,
  };

  if (sha) {
    body.sha = sha;
  }

  return githubRequest(`/repos/${owner}/${repo}/contents/${guestsPath}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

module.exports = async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const { guests } = await readGuestsFile();
      json(res, 200, { guests });
    } catch (error) {
      json(res, 500, { error: error.message });
    }
    return;
  }

  if (req.method === "POST") {
    try {
      const body = parseBody(req);
      const guests = validateGuests(body.guests);
      const current = await readGuestsFile();
      await writeGuestsFile(guests, current.sha);
      json(res, 200, { guests });
    } catch (error) {
      json(res, 500, { error: error.message });
    }
    return;
  }

  res.setHeader("Allow", "GET, POST");
  json(res, 405, { error: "Método no permitido" });
};
