public class SmartCityMetrics
{
    public int Count { get; set; }
    public double TotalSmartMobility { get; set; }
    public double TotalSmartEnvironment { get; set; }
    public double TotalSmartGovernment { get; set; }
    public double TotalSmartEconomy { get; set; }
    public double TotalSmartPeople { get; set; }
    public double TotalSmartLiving { get; set; }
    public double TotalSmartCityIndex { get; set; }
    public double TotalSmartCityIndexRelativeEdmonton { get; set; }

    public double AverageSmartMobility => TotalSmartMobility / Count;
    public double AverageSmartEnvironment => TotalSmartEnvironment / Count;
    public double AverageSmartGovernment => TotalSmartGovernment / Count;
    public double AverageSmartEconomy => TotalSmartEconomy / Count;
    public double AverageSmartPeople => TotalSmartPeople / Count;
    public double AverageSmartLiving => TotalSmartLiving / Count;
    public double AverageSmartCityIndex => TotalSmartCityIndex / Count;
    public double AverageSmartCityIndexRelativeEdmonton => TotalSmartCityIndexRelativeEdmonton / Count;

    public void AddData(dynamic data)
    {
        Count++;
        TotalSmartMobility += data.Smart_Mobility;
        TotalSmartEnvironment += data.Smart_Environment;
        TotalSmartGovernment += data.Smart_Government;
        TotalSmartEconomy += data.Smart_Economy;
        TotalSmartPeople += data.Smart_People;
        TotalSmartLiving += data.Smart_Living;
        TotalSmartCityIndex += data.SmartCity_Index;
        TotalSmartCityIndexRelativeEdmonton += data.SmartCity_Index_relative_Edmonton;
    }

    public double CalculateAverageForSingleEntry(dynamic data)
    {
        double sum = 0;
        int count = 0;

        if (data.Smart_Mobility != null)
        {
            sum += (double)data.Smart_Mobility;
            count++;
        }
        if (data.Smart_Environment != null)
        {
            sum += (double)data.Smart_Environment;
            count++;
        }
        if (data.Smart_Government != null)
        {
            sum += (double)data.Smart_Government;
            count++;
        }
        if (data.Smart_Economy != null)
        {
            sum += (double)data.Smart_Economy;
            count++;
        }
        if (data.Smart_People != null)
        {
            sum += (double)data.Smart_People;
            count++;
        }
        if (data.Smart_Living != null)
        {
            sum += (double)data.Smart_Living;
            count++;
        }
        if (data.SmartCity_Index != null)
        {
            sum += (double)data.SmartCity_Index;
            count++;
        }
        if (data.SmartCity_Index_relative_Edmonton != null)
        {
            sum += (double)data.SmartCity_Index_relative_Edmonton;
            count++;
        }

        return count > 0 ? sum / count : 0;
    }
}
