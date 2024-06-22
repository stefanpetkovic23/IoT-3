const mqtt = require("mqtt");
const fs = require("fs");
const csv = require("csv-parser");

async function readCitiesFromCSV(filePath) {
  return new Promise((resolve, reject) => {
    const cities = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => {
        // Loguje sirovi red podataka
        console.log("Raw data:", data);

        try {
          const city = {
            Id: data["Id"] ? parseInt(data["Id"].trim(), 10) : null,
            City: data["City"] ? data["City"].trim() : null,
            Country: data["Country"] ? data["Country"].trim() : null,
            Smart_Mobility: data["Smart_Mobility "]
              ? parseFloat(data["Smart_Mobility "].trim())
              : null,
            Smart_Environment: data["Smart_Environment"]
              ? parseFloat(data["Smart_Environment"].trim())
              : null,
            Smart_Government: data["Smart_Government "]
              ? parseFloat(data["Smart_Government "].trim())
              : null,
            Smart_Economy: data["Smart_Economy "]
              ? parseFloat(data["Smart_Economy "].trim())
              : null,
            Smart_People: data["Smart_People"]
              ? parseFloat(data["Smart_People"].trim())
              : null,
            Smart_Living: data["Smart_Living"]
              ? parseFloat(data["Smart_Living"].trim())
              : null,
            SmartCity_Index: data["SmartCity_Index"]
              ? parseFloat(data["SmartCity_Index"].trim())
              : null,
            SmartCity_Index_relative_Edmonton: data[
              "SmartCity_Index_relative_Edmonton"
            ]
              ? parseFloat(data["SmartCity_Index_relative_Edmonton"].trim())
              : null,
          };

          // Loguje parsirane podatke za svaki grad
          console.log("Parsed city data:", city);

          cities.push(city);
        } catch (error) {
          console.error(`Error parsing data: ${error.message}`);
        }
      })
      .on("end", () => {
        resolve(cities);
      })
      .on("error", (error) => {
        reject(error);
      });
  });
}

const mqttConfig = {
  host: "192.168.99.100", // Adresa EMQX MQTT brokera
  port: 1883,
  username: "admin",
  password: "qwert123",
};

async function sendCityDataOverMQTT() {
  const filePath = "Smart_City_index_headers.csv"; // Putanja do vašeg CSV fajla
  const topic = "sensor_dummy/values";

  try {
    const cities = await readCitiesFromCSV(filePath);
    const mqttClient = mqtt.connect(mqttConfig);

    mqttClient.on("connect", async () => {
      console.log("Connected to MQTT broker");

      let cityIndex = 0;

      const interval = setInterval(() => {
        if (cityIndex < cities.length) {
          const city = cities[cityIndex];
          console.log("City data:", JSON.stringify(city));

          const message = JSON.stringify(city);
          mqttClient.publish(topic, message);
          console.log(`Published data to topic: ${topic}`);
          cityIndex++;
        } else {
          clearInterval(interval);
          mqttClient.end();
          console.log("Finished publishing all city data");
        }
      }, 5000);
    });
  } catch (error) {
    console.error("Error reading cities from CSV:", error);
  }
}

sendCityDataOverMQTT();
