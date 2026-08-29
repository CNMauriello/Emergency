const http = require("http");

const ORCHESTRATOR_URL = process.env.ORCHESTRATOR_URL || "http://localhost:8083/api/emergency-triggers";

const payload = {
  event_id: "evt-fire-001",
  timestamp: "2026-08-29T12:00:00Z",
  emergency_category: "FIRE",
  severity: "HIGH",
  incident_context: {
    has_injured: false,
    has_unconscious: false,
    has_trapped: true,
    has_special_vehicle_involved: false,
  },
  coordinates: {
    latitude: 40.8362,
    longitude: 14.3064,
  },
  address: "Via Roma 12, Napoli",
  global_confidence: 0.92,
};

function postJson(url, body) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const data = JSON.stringify(body);

    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || 80,
      path: `${parsedUrl.pathname}${parsedUrl.search}`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(data),
      },
    };

    const req = http.request(options, (res) => {
      let responseBody = "";

      res.on("data", (chunk) => {
        responseBody += chunk.toString();
      });

      res.on("end", () => {
        console.log(`HTTP ${res.statusCode} ${res.statusMessage || ""}`);
        console.log(responseBody || "<empty response>");

        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ statusCode: res.statusCode, body: responseBody });
        } else {
          reject(new Error(`Request failed with status ${res.statusCode}: ${responseBody}`));
        }
      });
    });

    req.on("error", (err) => {
      reject(err);
    });

    req.write(data);
    req.end();
  });
}

postJson(ORCHESTRATOR_URL, payload)
  .then(() => {
    console.log("Evento inviato all'orchestrator: Camunda dovrebbe partire.");
  })
  .catch((err) => {
    console.error("Errore durante l'invio del payload:", err.message);
    process.exit(1);
  });
