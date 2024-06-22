const mqtt = require("mqtt");
const { InfluxDB, Point } = require("@influxdata/influxdb-client");
const { url, token, org, bucket } = require("./env"); // Učitavanje konfiguracionih podataka (primer)
const moment = require("moment");
const { connect, StringCodec } = require("nats");

// MQTT konfiguracija
const mqttConfig = {
  host: "192.168.99.100", // Adresa EMQX MQTT brokera
  port: 1883,
  username: "admin",
  password: "qwert123",
};
const MQTT_TOPIC = "analyticsAVG/values"; // MQTT tema za čitanje poruka

// InfluxDB konfiguracija
const client = new InfluxDB({ url, token });

// Funkcija za upisivanje poruke u InfluxDB
async function writeToInfluxDB(message) {
  try {
    const writeApi = client.getWriteApi(org, bucket);
    writeApi.writePoint(
      new Point("metrics")
        .floatField("average", message.Average)
        .timestamp(moment(message.Timestamp).toDate())
    );

    await writeApi.close();
    console.log("Data written to InfluxDB successfully");
  } catch (error) {
    console.error(`Error writing to InfluxDB: ${error}`);
  }
}

// Povezivanje na MQTT topic i čitanje poruka
const mqttClient = mqtt.connect(mqttConfig);

mqttClient.on("connect", () => {
  console.log("Connected to MQTT broker");
  mqttClient.subscribe(MQTT_TOPIC);
});

mqttClient.on("message", (topic, message) => {
  // console.log(`Received message on topic: ${topic}`);
  // const data = JSON.parse(message.toString());
  // Pozivanje funkcije za upis podataka u InfluxDB
  // writeToInfluxDB(data);
});

// Funkcija za očitavanje poruka sa NATS-a
async function listenToNats() {
  try {
    const natsConnection = await connect({
      servers: "nats://192.168.99.100:4222",
    });
    console.log("Connected to NATS server");

    const sc = StringCodec();
    const subscription = natsConnection.subscribe("analyticsAVGNats/values");

    for await (const msg of subscription) {
      console.log(`Received message from NATS on subject ${msg.subject}`);
      const data = JSON.parse(sc.decode(msg.data));

      // Pozivanje funkcije za upis podataka u InfluxDB
      writeToInfluxDB(data);
    }
  } catch (error) {
    console.error(`Error connecting to NATS: ${error}`);
  }
}

// Testna funkcija za proveru konekcije sa InfluxDB
async function testInfluxDBConnection() {
  try {
    const ready = await client.ready(); // Provera da li je InfluxDB spremna

    if (ready) {
      console.log("InfluxDB server is ready for writing");
    } else {
      console.log("InfluxDB server is not ready");
    }
  } catch (error) {
    console.error(`Error connecting to InfluxDB: ${error}`);
  }
}

// Pozivamo test funkciju i funkciju za očitavanje poruka sa NATS-a
testInfluxDBConnection();
listenToNats();
