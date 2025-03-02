import React, { useEffect, useState, useRef } from 'react';
import mapStyles from '../mapStyles.json';

interface WeatherData {
  location: {
    name: string;
    region: string;
    country: string;
    lat: number;
    lon: number;
    localtime: string;
  };
  current: {
    temp_f: number;
    temp_c: number;
    condition: {
      text: string;
      icon: string;
    };
    wind_mph: number;
    wind_kph: number;
    wind_dir: string;
    humidity: number;
    feelslike_f: number;
    feelslike_c: number;
  };
  forecast?: {
    forecastday: Array<{
      date: string;
      day: {
        maxtemp_f: number;
        mintemp_f: number;
        condition: {
          text: string;
          icon: string;
        };
      };
      hour: Array<any>;
    }>;
  };
  alerts?: {
    alert: Array<{
      headline: string;
      msgtype: string;
      severity: string;
      urgency: string;
      areas: string;
      category: string;
      certainty: string;
      event: string;
      note: string;
      effective: string;
      expires: string;
      desc: string;
      instruction: string;
    }>;
  };
}

interface Location {
  lat: number;
  lng: number;
  name: string;
}

export const fetchWeatherData = async (lat: number, lng: number): Promise<WeatherData> => {
  const apiKey = '11c95f91d8a64498bcd121938250203';
    
  // WeatherAPI.com endpoint for current weather with forecast and alerts
  const response = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${lat},${lng}&days=3&aqi=no&alerts=yes`);
  
  
  const data = await response.json();
  
  return data;
};

const GoogleMap: React.FC<{ disasterType: string }> = ({ disasterType }) => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [isMapInitialized, setIsMapInitialized] = useState(false);
  const [weatherError, setWeatherError] = useState(false);
  const mapRef = useRef<any>(null);
  const googleRef = useRef<any>(null);

  useEffect(() => {
    const updateLocations = (type: string): Location[] => {
      switch (type) {
        case 'flood':
          return [
            { lat: 39.80012387046374, lng: -75.52088291729602, name: 'Brandywine High School' },
            { lat: 39.77415605250937, lng: -75.50507666362107, name: 'Mount Pleasant High School' },
            { lat: 39.23039069403077, lng: -75.58188945891627, name: 'Dover High School' },
            { lat: 39.11833555739248, lng: -75.5411440025365, name: 'Caesar Rodney High School' },
          ];
        case 'earthquake':
          return [
            { lat: 39.57476806640625, lng: -75.75569152832031, name: 'Earthquake Shelter 1' },
            { lat: 39.80015687000223, lng: -75.52089364232909, name: 'Earthquake Shelter 2' },
          ];
        default:
          return [
            { lat: 39.80012387046374, lng: -75.52088291729602, name: 'Brandywine High School' },
            { lat: 39.77415605250937, lng: -75.50507666362107, name: 'Mount Pleasant High School' },
            { lat: 39.23039069403077, lng: -75.58188945891627, name: 'Dover High School' },
            { lat: 39.11833555739248, lng: -75.5411440025365, name: 'Caesar Rodney High School' },
          ];
      }
    };

    setLocations(updateLocations(disasterType));
  }, [disasterType]);

  useEffect(() => {
    if (!locations.length) return;
    
    
    const loadGoogleMaps = () => {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyAa0cJhxgE1nTh4-FXfNWjU8MCQxUePa7I&libraries=places&callback=initGoogleMap`;
      script.async = true;
      script.defer = true;
      
      script.onerror = () => {
        console.error('Google Maps script failed to load.');
      };
      
      window.initGoogleMap = () => {
        console.log('Google Maps loaded successfully');
        googleRef.current = window.google;
        initializeMap();
      };
      
      document.head.appendChild(script);
      
      return () => {
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
        if (window.initGoogleMap) {
          delete window.initGoogleMap;
        }
      };
    };
    
    const initializeMap = () => {
      const mapElement = document.getElementById('map');
      if (!mapElement) {
        return;
      }
      
      // Calculate the center of all locations
      const center = locations.reduce(
        (acc, loc) => ({ 
          lat: acc.lat + loc.lat / locations.length, 
          lng: acc.lng + loc.lng / locations.length 
        }),
        { lat: 0, lng: 0 }
      );
      
          // Create the map
          const mapInstance = new googleRef.current.maps.Map(mapElement, {
            center: center,
            zoom: 10,
            styles: mapStyles,
          });
          
          mapRef.current = mapInstance;
          setIsMapInitialized(true);
          
          // Add basic markers without weather data first
          locations.forEach((location) => {
            const marker = new googleRef.current.maps.Marker({
              position: { lat: location.lat, lng: location.lng },
              map: mapInstance,
              title: location.name,
            });
            
            const basicInfoWindow = new googleRef.current.maps.InfoWindow({
              content: `<div style="color: black;"><h3>${location.name}</h3><p>Loading weather data...</p></div>`,
            });
            
            marker.addListener('click', () => {
              basicInfoWindow.open(mapInstance, marker);
            });
          });
          
          fetchWeatherDataForLocations();
    };
    
    if (window.google && window.google.maps) {
      googleRef.current = window.google;
      initializeMap();
    } else {
      loadGoogleMaps();
    }
  }, [locations]);
  
  // Fetch weather data
  const fetchWeatherDataForLocations = async () => {
    const results = [];
    for (const location of locations) {
       
      await new Promise(resolve => setTimeout(resolve, 300));
        const data = await fetchWeatherData(location.lat, location.lng);
        results.push(data);
    }
    
    setWeatherData(results);

  };
  const drawAlertAreas = (alerts: any[], location: Location) => {
    if (!alerts || !alerts.length || !googleRef.current) return;
    
    alerts.forEach(alert => {
      let radius = 2000;
      switch(alert.severity.toLowerCase()) {
        case 'extreme':
          radius = 5000;
          break;
        case 'severe':
          radius = 4000;
          break;
        case 'moderate':
          radius = 3000;
          break;
      }
      

      let fillColor = '#FF0000'; //red
      let strokeColor = '#CC0000';
      
      if (alert.event.toLowerCase().includes('flood')) {
        fillColor = '#0000FF';
        strokeColor = '#0000CC';
      } else if (alert.event.toLowerCase().includes('wind')) {
        fillColor = '#00FF00';
        strokeColor = '#00CC00';
      } else if (alert.event.toLowerCase().includes('storm')) {
        fillColor = '#FF00FF';
        strokeColor = '#CC00CC';
      }
      
      const alertCircle = new googleRef.current.maps.Circle({
        strokeColor: strokeColor,
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: fillColor,
        fillOpacity: 0.15,
        map: mapRef.current,
        center: { lat: location.lat, lng: location.lng },
        radius: radius
      });
    });
  };
  
  // Update markers with weather data and alerts
  useEffect(() => {
    if (!isMapInitialized || !weatherData.length || !googleRef.current) return;
    
    const center = locations.reduce(
      (acc, loc) => ({ 
        lat: acc.lat + loc.lat / locations.length, 
        lng: acc.lng + loc.lng / locations.length 
      }),
      { lat: 0, lng: 0 }
    );
    
    const haversineDistance = (coords1: any, coords2: any) => {
      const toRad = (x: number) => (x * Math.PI) / 180;
      const R = 6371;
      const dLat = toRad(coords2.lat - coords1.lat);
      const dLng = toRad(coords2.lng - coords1.lng);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(coords1.lat)) * Math.cos(toRad(coords2.lat)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };
    
    const locationAlerts: Array<{location: Location, alerts: any[]}> = [];
    
    // Add markers with weather data
    locations.forEach((location, index) => {
      const weatherInfo = weatherData[index];
      const alerts = weatherInfo?.alerts?.alert || [];
      const hasAlerts = alerts.length > 0;
      
      if (hasAlerts) {
        locationAlerts.push({
          location: location,
          alerts: alerts
        });
      }
      
      const marker = new googleRef.current.maps.Marker({
        position: { lat: location.lat, lng: location.lng },
        map: mapRef.current,
        title: location.name,
        icon: hasAlerts ? 'http://maps.google.com/mapfiles/ms/icons/red-dot.png' : undefined
      });
      
      let infoContent = `<div style="color: black; max-width: 400px;">`;
      infoContent += `<h3>${location.name}</h3>`;
      
      if (weatherInfo?.current) {
        const current = weatherInfo.current;
        
        if (current.condition.icon) {
          infoContent += `<img src="${current.condition.icon}" alt="Weather icon" style="float:right;margin-left:10px;">`;
        }
        
        infoContent += `
          <p><strong>Weather:</strong> ${current.condition.text || 'Unknown'}</p>
          <p><strong>Temperature:</strong> ${current.temp_f || 'Unknown'}°F (Feels like: ${current.feelslike_f || 'Unknown'}°F)</p>
          <p><strong>Wind:</strong> ${current.wind_mph || 'Unknown'} mph ${current.wind_dir || ''}</p>
          <p><strong>Humidity:</strong> ${current.humidity || 'Unknown'}%</p>`;
          
        if (weatherInfo.forecast && weatherInfo.forecast.forecastday && weatherInfo.forecast.forecastday.length > 0) {
          infoContent += `<h4 style="margin-top: 15px; border-top: 1px solid #ccc; padding-top: 10px;">Weather Forecast</h4>`;
          
          weatherInfo.forecast.forecastday.forEach((day, idx) => {
            if (idx === 0) return;
            const date = new Date(day.date);
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
            infoContent += `
              <div style="display: inline-block; text-align: center; margin-right: 15px;">
                <p><strong>${dayName}</strong></p>
                <img src="${day.day.condition.icon || ''}" alt="Weather icon" style="width: 40px;">
                <p>${day.day.maxtemp_f || 'N/A'}°F / ${day.day.mintemp_f || 'N/A'}°F</p>
                <p style="font-size: 0.9em;">${day.day.condition.text || 'Unknown'}</p>
              </div>`;
          });
        }
        
        if (hasAlerts) {
          infoContent += `<h4 style="margin-top: 15px; border-top: 1px solid #ccc; padding-top: 10px; color: #cc0000;">⚠️ Weather Alerts</h4>`;
          infoContent += `<div style="max-height: 200px; overflow-y: auto;">`;
          
          alerts.forEach(alert => {
            let severityColor = '#000';
            switch(alert.severity.toLowerCase()) {
              case 'extreme':
                severityColor = '#cc0000';
                break;
              case 'severe':
                severityColor = '#ff6600';
                break;
              case 'moderate':
                severityColor = '#ffcc00';
                break;
              default:
                severityColor = '#000';
            }
            
            infoContent += `<div style="margin-bottom: 10px; padding: 8px; border-left: 4px solid ${severityColor};">`;
            infoContent += `<p style="font-weight: bold; color: ${severityColor};">${alert.event}</p>`;
            infoContent += `<p>${alert.headline}</p>`;
            
            const alertId = `alert-${Math.random().toString(36).substring(2, 9)}`;
            infoContent += `
              <p><small>Effective: ${alert.effective}<br>Expires: ${alert.expires}</small></p>
              <div>
                <a href="javascript:void(0)" onclick="document.getElementById('${alertId}').style.display = document.getElementById('${alertId}').style.display === 'none' ? 'block' : 'none';" style="color: blue; text-decoration: underline;">
                  Show/Hide Details
                </a>
                <div id="${alertId}" style="display: none; margin-top: 8px; padding: 8px; background-color: #f9f9f9; border-radius: 4px;">
                  <p>${alert.desc}</p>
                  ${alert.instruction ? `<p><strong>Instructions:</strong> ${alert.instruction}</p>` : ''}
                </div>
              </div>`;
            infoContent += '</div>';
          });
          
          infoContent += `</div>`;
        }
      } else {
        infoContent += `<p><strong>Weather data unavailable</strong></p>`;
      }
      
      infoContent += `</div>`;
      
      const infoWindow = new googleRef.current.maps.InfoWindow({
        content: infoContent,
        maxWidth: 400
      });
      
      marker.addListener('click', () => {
        infoWindow.open(mapRef.current, marker);
      });
    });
    
    locationAlerts.forEach(locAlert => {
      drawAlertAreas(locAlert.alerts, locAlert.location);
    });
    
    if (locationAlerts.length > 0) {
      const alertControlDiv = document.createElement('div');
      alertControlDiv.style.backgroundColor = '#fff';
      alertControlDiv.style.border = '2px solid #f00';
      alertControlDiv.style.borderRadius = '3px';
      alertControlDiv.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
      alertControlDiv.style.cursor = 'pointer';
      alertControlDiv.style.marginBottom = '22px';
      alertControlDiv.style.marginRight = '10px';
      alertControlDiv.style.textAlign = 'center';
      alertControlDiv.title = 'Click to see active weather alerts';
      const controlText = document.createElement('div');
      controlText.style.color = 'rgb(25,25,25)';
      controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
      controlText.style.fontSize = '14px';
      controlText.style.lineHeight = '38px';
      controlText.style.paddingLeft = '5px';
      controlText.style.paddingRight = '5px';
      controlText.innerHTML = `⚠️ ${locationAlerts.reduce((total, loc) => total + loc.alerts.length, 0)} Weather Alerts`;
      alertControlDiv.appendChild(controlText);
      
      alertControlDiv.addEventListener('click', () => {
        let alertContent = '<div style="max-height: 300px; overflow-y: auto;">';
        alertContent += '<h3 style="margin-top: 0;">Active Weather Alerts</h3>';
        
        locationAlerts.forEach(locAlert => {
          alertContent += `<h4>${locAlert.location.name}</h4>`;
          locAlert.alerts.forEach(alert => {
            let severityColor = '#000';
            switch(alert.severity.toLowerCase()) {
              case 'extreme':
                severityColor = '#cc0000';
                break;
              case 'severe':
                severityColor = '#ff6600';
                break;
              case 'moderate':
                severityColor = '#ffcc00';
                break;
              default:
                severityColor = '#000';
            }
            
            alertContent += `<div style="margin-bottom: 10px; padding: 8px; border-left: 4px solid ${severityColor};">`;
            alertContent += `<p style="font-weight: bold; color: ${severityColor};">${alert.event}</p>`;
            alertContent += `<p>${alert.headline}</p>`;
            alertContent += `<p><small>Effective: ${alert.effective}<br>Expires: ${alert.expires}</small></p>`;
            alertContent += '</div>';
          });
        });
        
        alertContent += '</div>';
        
        const alertsInfoWindow = new googleRef.current.maps.InfoWindow({
          content: alertContent,
          position: center
        });
        
        alertsInfoWindow.open(mapRef.current);
      });
    
      mapRef.current.controls[googleRef.current.maps.ControlPosition.TOP_RIGHT].push(alertControlDiv);
    }
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          
          // Add user marker
          new googleRef.current.maps.Marker({
            position: userLocation,
            map: mapRef.current,
            title: 'Your location',
            icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
          });
          
          let closestLocation = locations[0];
          let minDistance = haversineDistance(userLocation, locations[0]);
          
          for (const location of locations) {
            const distance = haversineDistance(userLocation, location);
            if (distance < minDistance) {
              closestLocation = location;
              minDistance = distance;
            }
          }
          
          const closestMarker = new googleRef.current.maps.Marker({
            position: { lat: closestLocation.lat, lng: closestLocation.lng },
            map: mapRef.current,
            title: `Closest shelter: ${closestLocation.name}`,
            icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
          });
          
          const closestInfoWindow = new googleRef.current.maps.InfoWindow({
            content: `<div style="color: black;"><h3>Closest Shelter</h3><p>${closestLocation.name}</p><p>Distance: ${minDistance.toFixed(2)} km</p></div>`,
          });
          
          closestMarker.addListener('click', () => {
            closestInfoWindow.open(mapRef.current, closestMarker);
          });
          
          closestInfoWindow.open(mapRef.current, closestMarker);
        },
      );
    }
  }, [weatherData, isMapInitialized, locations]);

  return (
    <div style={{ position: 'relative', height: '100vh', width: '100%' }}>
      {!isMapInitialized && (
        <div style={{ 
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '5px',
          zIndex: 10
        }}>
          Loading map...
        </div>
      )}
      
      {weatherError && (
        <div style={{ 
          position: 'absolute', 
          top: '10px', 
          right: '10px',
          backgroundColor: 'white',
          padding: '10px',
          borderRadius: '5px',
          zIndex: 10
        }}>
          Weather data could not be loaded
        </div>
      )}
      <div id="map" style={{ height: '100%', width: '100%' }}></div>
    </div>
  );
};

declare global {
  interface Window {
    google: any;
    initGoogleMap?: () => void;
  }
}

export default GoogleMap;