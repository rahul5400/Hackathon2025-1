import React, { useEffect, useState } from 'react';
import mapStyles from '../mapStyles.json'; // Import the JSON file


interface Location {
  lat: number;
  lng: number;
  name: string;
}

const GoogleMap: React.FC<{ disasterType: string }> = ({ disasterType }) => {
  const [locations, setLocations] = useState<Location[]>([]);

  useEffect(() => {
    // Update the list of locations based on the disaster type
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
        case 'hurricane':
          return [
            { lat: 39.57476806640625, lng: -75.75569152832031, name: 'Hurricane Shelter 1' },
            { lat: 39.80015687000223, lng: -75.52089364232909, name: 'Hurricane Shelter 2' },
          ];
        case 'wildfire':
          return [
            { lat: 39.57476806640625, lng: -75.75569152832031, name: 'Wildfire Shelter 1' },
            { lat: 39.80015687000223, lng: -75.52089364232909, name: 'Wildfire Shelter 2' },
          ];
        case 'blizzard':
          return [
            { lat: 39.57476806640625, lng: -75.75569152832031, name: 'Blizzard Shelter 1' },
            { lat: 39.80015687000223, lng: -75.52089364232909, name: 'Blizzard Shelter 2' },
          ];
        case 'power-plant-meltdown':
          return [
            { lat: 39.57476806640625, lng: -75.75569152832031, name: 'Power Plant Meltdown Shelter 1' },
            { lat: 39.80015687000223, lng: -75.52089364232909, name: 'Power Plant Meltdown Shelter 2' },
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
    if (!disasterType || disasterType === 'blizzard' || disasterType === 'wildfire' || disasterType === 'earthquake' || disasterType === 'power-plant-meltdown' || disasterType === 'hurricane') {
      return;
    }

    let map: any;

    // Haversine formula to calculate distance between two points
    const haversineDistance = (coords1: any, coords2: any) => {
      const toRad = (x: number) => (x * Math.PI) / 180;
      const R = 6371; // Radius of the Earth in km
      const dLat = toRad(coords2.lat - coords1.lat);
      const dLng = toRad(coords2.lng - coords1.lng);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(coords1.lat)) * Math.cos(toRad(coords2.lat)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    (window as any).initMap = () => {
      // Calculate the center of all locations
      const center = locations.reduce(
        (acc, loc) => ({ lat: acc.lat + loc.lat / locations.length, lng: acc.lng + loc.lng / locations.length }),
        { lat: 0, lng: 0 }
      );

      map = new (window as any).google.maps.Map(document.getElementById('map') as HTMLElement, {
        center: center,
        zoom: 10,
        styles: mapStyles,
      });

      // Add markers for all shelter locations
      locations.forEach((location) => {
        const marker = new (window as any).google.maps.Marker({
          map,
          position: { lat: location.lat, lng: location.lng },
          title: location.name,
        });

        const infoWindow = new (window as any).google.maps.InfoWindow({
          content: `<div style="color: black;"><h3>${location.name}</h3></div>`, // Inline CSS for black text color
        });

        marker.addListener('click', () => {
          infoWindow.open(map, marker);
        });
      });

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const userLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };

            // Find the closest location
            let closestLocation = locations[0];
            let minDistance = haversineDistance(userLocation, locations[0]);

            for (const location of locations) {
              const distance = haversineDistance(userLocation, location);
              if (distance < minDistance) {
                closestLocation = location;
                minDistance = distance;
              }
            }

            // Add user's location marker
            new (window as any).google.maps.Marker({
              map,
              position: userLocation,
              title: 'Your location',
              icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
            });

            // Highlight the closest shelter
            const closestMarker = new (window as any).google.maps.Marker({
              map,
              position: closestLocation,
              title: `Closest shelter: ${closestLocation.name}`,
              icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
            });

            // Add an info window for the closest shelter
            const closestInfoWindow = new (window as any).google.maps.InfoWindow({
              content: `<div style="color: black;"><h3>Closest Shelter</h3><p>${closestLocation.name}</p><p>Distance: ${minDistance.toFixed(2)} km</p></div>`, // Inline CSS for black text color
            });

            closestMarker.addListener('click', () => {
              closestInfoWindow.open(map, closestMarker);
            });

            closestInfoWindow.open(map, closestMarker);
          },
          () => {
            handleLocationError(true, map.getCenter());
          }
        );
      } else {
        // Browser doesn't support Geolocation
        handleLocationError(false, center);
      }
    };

    const handleLocationError = (browserHasGeolocation: boolean, pos: any) => {
      const infoWindow = new (window as any).google.maps.InfoWindow({
        position: pos,
      });
      infoWindow.setContent(
        browserHasGeolocation
          ? 'Error: The Geolocation service failed.'
          : "Error: Your browser doesn't support geolocation."
      );
      infoWindow.open(map);
    };

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyAa0cJhxgE1nTh4-FXfNWjU8MCQxUePa7I&callback=initMap&libraries=places`;
    script.async = true;
    script.onerror = () => {
      console.error('Google Maps script could not be loaded.');
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [locations, disasterType]);

  return <div id="map" style={{ height: '100vh', width: '100%' }}></div>;
};

export default GoogleMap;
