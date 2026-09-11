const API_URL = process.env.API_URL || "http://gateway-service:8090/api/auth/register";

console.log("========================================");
console.log("       INSERT OPERATORI - DEBUG");
console.log("========================================");
console.log(`[CONFIG] API_URL: ${API_URL}`);
console.log(`[CONFIG] NODE_VERSION: ${process.version}`);
console.log(`[CONFIG] HOSTNAME: ${process.env.HOSTNAME || "N/A"}`);
console.log(`[CONFIG] TIMESTAMP: ${new Date().toISOString()}`);
console.log("========================================");

const operatori = [
    {
        username: "mario.rossi",
        name: "Mario",
        surname: "Rossi",
        email: "mario.rossi@emergency.com",
        password: "Password123!"
    },
    {
        username: "luigi.verdi",
        name: "Luigi",
        surname: "Verdi",
        email: "luigi.verdi@emergency.com",
        password: "Password123!"
    },
    {
        username: "giulia.bianchi",
        name: "Giulia",
        surname: "Bianchi",
        email: "giulia.bianchi@emergency.com",
        password: "Password123!"
    },
    {
        username: "maria.viola",
        name: "Maria",
        surname: "Viola",
        email: "maria.viola@emergency.com",
        password: "Password123!"
    },
    {
        username: "giacomo.neri",
        name: "Giacomo",
        surname: "Neri",
        email: "giacomo.neri@emergency.com",
        password: "Password123!"
    }
];

async function registraOperatori() {
    console.log("");
    console.log("========================================");
    console.log("       INIZIO REGISTRAZIONE");
    console.log("========================================");
    console.log(`[INFO] Operatori da registrare: ${operatori.length}`);
    console.log(`[INFO] Endpoint: ${API_URL}`);
    console.log("");

    for (const operatore of operatori) {

        const startTime = Date.now();

        console.log("----------------------------------------");
        console.log(`[REQUEST] ${operatore.username}`);
        console.log(`[REQUEST] Nome: ${operatore.name} ${operatore.surname}`);
        console.log(`[REQUEST] Email: ${operatore.email}`);
        console.log(`[REQUEST] Method: POST`);
        console.log(`[REQUEST] URL: ${API_URL}`);
        console.log(`[REQUEST] Content-Type: application/json`);
        console.log(`[REQUEST] Invio richiesta...`);

        try {

            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(operatore)
            });

            const elapsed = Date.now() - startTime;

            console.log(`[RESPONSE] ${operatore.username}`);
            console.log(`[RESPONSE] Status: ${response.status}`);
            console.log(`[RESPONSE] Status Text: ${response.statusText}`);
            console.log(`[RESPONSE] OK: ${response.ok}`);
            console.log(`[RESPONSE] Time: ${elapsed} ms`);

            const contentType = response.headers.get("content-type");
            console.log(`[RESPONSE] Content-Type: ${contentType || "N/A"}`);

            const responseBody = await response.text();

            console.log(`[RESPONSE] Body: ${responseBody || "(empty)"}`);

            if (response.ok) {
                console.log(`[SUCCESS] Registrato: ${operatore.name} ${operatore.surname} (${operatore.username})`);
            } else {
                console.error(`[ERROR] Registrazione fallita: ${operatore.username}`);
                console.error(`[ERROR] HTTP Status: ${response.status}`);
                console.error(`[ERROR] Response: ${responseBody}`);
            }

        } catch (error) {

            const elapsed = Date.now() - startTime;

            console.error("----------------------------------------");
            console.error(`[NETWORK ERROR] ${operatore.username}`);
            console.error(`[NETWORK ERROR] Time: ${elapsed} ms`);
            console.error(`[NETWORK ERROR] Name: ${error.name}`);
            console.error(`[NETWORK ERROR] Message: ${error.message}`);
            console.error(`[NETWORK ERROR] Stack:`);
            console.error(error.stack);
            console.error("----------------------------------------");
        }
    }

    console.log("");
    console.log("========================================");
    console.log("       SCRIPT COMPLETATO");
    console.log("========================================");
    console.log(`[INFO] Fine: ${new Date().toISOString()}`);
}

registraOperatori();