const API_URL = "http://localhost:8086/api/auth/register";

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
    }
];

async function registraOperatori() {
    console.log("Inizio registrazione degli operatori...");

    for (const operatore of operatori) {
        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(operatore)
            });

            if (response.ok) {
                console.log(`[SUCCESS] Registrato: ${operatore.name} ${operatore.surname} (${operatore.username})`);
            } else {
                const errorMsg = await response.text();
                console.error(`[ERROR] Fallita registrazione per ${operatore.username}. Status: ${response.status} - ${errorMsg}`);
            }
        } catch (error) {
            console.error(`[NETWORK ERROR] Impossibile connettersi ad AuthMicroService per ${operatore.username}: ${error.message}`);
        }
    }
    
    console.log("Script completato. Nota: L'AuthMicroService di default imposta il ruolo a 'ROLE_USER' tramite l'endpoint di registrazione.");
}

registraOperatori();
