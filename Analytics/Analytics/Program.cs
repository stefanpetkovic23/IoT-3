using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using AnalyticsService;
using MQTTnet.Client;
using Newtonsoft.Json;
using NATS.Client;

public class Program
{
    private static SmartCityMetrics _metrics = new SmartCityMetrics();
    private static IConnection _natsConnection;

    public static async Task Main(string[] args)
    {
        var mqttService = MqttService.Instance();

        var brokerAddress = "192.168.99.100"; // Adresa MQTT brokera
        var port = 1883;
        var topicToSubscribe = new List<string> { "sensor_dummy/values", "eKuiper/anomalies" };

        try
        {
            // Poveži se na MQTT broker
            await mqttService.ConnectAsync(brokerAddress, port);
            await mqttService.SubsribeToTopicsAsync(topicToSubscribe);

            Console.WriteLine("Connected to MQTT broker and subscribed to topics.");

            mqttService.AddApplicationMessageReceived(MessageReceivedFunctionAsync);

            // Poveži se na NATS server
            var natsConnectionFactory = new ConnectionFactory();
            _natsConnection = natsConnectionFactory.CreateConnection("nats://192.168.99.100:4222");

            Console.WriteLine("Connected to NATS server.");

            Console.ReadLine();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
        }

        async Task MessageReceivedFunctionAsync(MqttApplicationMessageReceivedEventArgs args)
        {
            string payload = Encoding.UTF8.GetString(args.ApplicationMessage.Payload);

            Console.WriteLine($"Received message on topic: {args.ApplicationMessage.Topic}");
            Console.WriteLine($"Payload: {payload}");

            if (args.ApplicationMessage.Topic == "sensor_dummy/values")
            {
                try
                {
                    dynamic data = JsonConvert.DeserializeObject(payload);
                    double average = _metrics.CalculateAverageForSingleEntry(data);

                    Console.WriteLine($"Calculated average for the received data: {average}");

                    var metricsMessage = new MetricsMessage(average);
                    string messagePayload = JsonConvert.SerializeObject(metricsMessage);

                    Console.WriteLine($"Message payload for the received data which now sending to new topic: {messagePayload}");

                    // Slanje poruke na MQTT
                    await mqttService.PublishMessage("analyticsAVG/values", messagePayload);
                    Console.WriteLine($"Message forwarded to analyticsAVG/values topic.");

                    // Slanje poruke preko NATS
                    _natsConnection.Publish("analyticsAVGNats/values", Encoding.UTF8.GetBytes(messagePayload));
                    Console.WriteLine("Message sent to NATS on topic 'analyticsAVG/values'.");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error processing message: {ex.Message}");
                }
            }
        }
    }
}