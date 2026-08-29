const http = require("http");

const PORT = 8085;

const server = http.createServer((req, res) => {
    console.log("\n========== REQUEST ==========");
    console.log("Method:", req.method);
    console.log("URL:", req.url);
    console.log("Headers:", req.headers);

    let body = "";

    req.on("data", (chunk) => {
        body += chunk.toString();
    });

    req.on("end", () => {
        console.log("Body:", body || "<empty>");
        console.log("=============================\n");

        if (req.method === "GET" && req.url === "/api/stub_service") {

            const response = {
                areEvacuated: true
            };

            res.writeHead(200, {
                "Content-Type": "application/json"
            });

            res.end(JSON.stringify(response));
            return;
        }

        res.writeHead(404);
        res.end();
    });
});

server.listen(PORT, () => {
    console.log(`Stub server running on http://localhost:${PORT}`);
});