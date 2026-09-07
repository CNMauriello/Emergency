// trigger.js

const url = 'http://localhost:8083/api/emergency-triggers';

const payload = {
    "event_id": "evt-fire-001",
    "timestamp": "2026-08-29 12:00:00",
    "emergency_category": "FIRE",
    "severity": "CRITICAL",
    "incident_context": {
        "has_injured": false,
        "has_unconscious": false,
        "has_trapped": true,
        "has_special_vehicle_involved": false
    },
    "coordinates": {
        "latitude": 40.8362,
        "longitude": 14.3064
    },
    "address": "Via Roma 12, Napoli",
    "global_confidence": 0.92
};

async function sendRequest() {
    console.log(`Inviando richiesta POST a ${url}...`);

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`Errore HTTP! Status: ${response.status} - ${response.statusText}`);
        }

        // Se il server restituisce JSON, lo processiamo
        const text = await response.text();
        const data = text ? JSON.parse(text) : {};

        console.log('✅ Richiesta completata con successo:');
        console.log(data);

    } catch (error) {
        console.error('❌ Errore durante l\'invio della richiesta:', error.message);
    }
}

sendRequest();