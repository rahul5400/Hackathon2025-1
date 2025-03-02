export const fetchWeatherData = async (lat: number, lng: number) => {
    try {
      const response = await fetch(`https://api.weather.gov/points/${lat},${lng}`);
      if (!response.ok) {
        throw new Error(`Weather API responded with status: ${response.status}`);
      }
      const data = await response.json();
      
      if (!data.properties || !data.properties.forecast) {
        console.warn('Weather API response missing forecast URL:', data);
        return { properties: { periods: [] } }; // Return empty data structure
      }
      
      const forecastUrl = data.properties.forecast;
      const forecastResponse = await fetch(forecastUrl);
      
      if (!forecastResponse.ok) {
        throw new Error(`Forecast API responded with status: ${forecastResponse.status}`);
      }
      
      return forecastResponse.json();
    } catch (error) {
      console.error('Error in fetchWeatherData:', error);
      return { properties: { periods: [] } }; // Return empty data structure on error
    }
  };