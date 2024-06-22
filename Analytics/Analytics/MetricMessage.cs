public class MetricsMessage
{
    public double Average { get; set; }
    public string Timestamp { get; set; }

    public MetricsMessage(double average)
    {
        Average = average;
        Timestamp = DateTime.UtcNow.ToString("o"); // ISO 8601 format
    }
}
