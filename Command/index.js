const express = require("express");
const mqtt = require("mqtt");
const http = require("http");
const WebSocket = require("ws");

const app = express();
const port = 3000;

// MQTT konfiguracija
const brokerAddress = "mqtt://192.168.99.100"; // Adresa MQTT brokera
const topicToSubscribe = "eKuiper/anomalies";
const client = mqtt.connect(brokerAddress);

// WebSocket server
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

client.on("connect", () => {
  console.log("Connected to MQTT broker");

  client.subscribe(topicToSubscribe, (err) => {
    if (err) {
      console.error("Error subscribing to topic:", err);
    } else {
      console.log(`Subscribed to topic: ${topicToSubscribe}`);
    }
  });
});

// Obrada primljenih poruka sa MQTT brokera
client.on("message", (topic, message) => {
  const payload = message.toString();

  console.log(`Received message on topic: ${topic}`);
  console.log(`Payload: ${payload}`);

  try {
    const parsedData = JSON.parse(payload);
    // Emitovanje primljenih podataka putem WebSocket-a svim povezanim klijentima
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(parsedData));
      }
    });
  } catch (error) {
    console.error("Error parsing MQTT message:", error);
  }
});

// WebSocket konekcija
wss.on("connection", (ws) => {
  console.log("WebSocket client connected");

  // Dodavanje event handlera za primanje poruka od WebSocket klijenata
  ws.on("message", (message) => {
    console.log(`Received message from WebSocket client: ${message}`);
    // Ovde možete dodati logiku za obrađivanje poruka od klijenata, ako je potrebno
  });
});

app.get("/", (req, res) => {
  res.send("Server is running. WebSocket is ready for data transmission.");
});

server.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
