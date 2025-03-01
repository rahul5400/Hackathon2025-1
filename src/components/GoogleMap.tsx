import React, { useEffect, useState } from 'react';

interface Location {
  lat: number;
  lng: number;
  name: string;
}

const GoogleMap: React.FC<{ disasterType: string }> = ({ disasterType }) => {
  const [locations, setLocations] = useState<Location[]>([]);

  useEffect(() => {
    // Update the list of locations based on the disaster type
    const updateLocations = (type: string) => {
      switch (type) {
        case 'flood':
          return [
            { lat: 39.57476806640625, lng: -75.75569152832031, name: 'Flood Shelter 1' },
            { lat: 39.80015687000223, lng: -75.52089364232909, name: 'Flood Shelter 2' },
          ];
        case 'earthquake':
          return [
            { lat: 39.57476806640625, lng: -75.75569152832031, name: 'Earthquake Shelter 1' },
            { lat: 39.80015687000223, lng: -75.52089364232909, name: 'Earthquake Shelter 2' },
          ];
        default:
          return [
            { lat: 39.57476806640625, lng: -75.75569152832031, name: 'Default Shelter 1' },
            { lat: 39.80015687000223, lng: -75.52089364232909, name: 'Default Shelter 2' },
          ];
      }
    };

    setLocations(updateLocations(disasterType));
  }, [disasterType]);

  useEffect(() => {
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

    // Define the initMap function globally
    (window as any).initMap = () => {
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

            map = new (window as any).google.maps.Map(document.getElementById('map') as HTMLElement, {
              center: closestLocation,
              zoom: 14,
              mapId: 'DEMO_MAP_ID',
            });

            new (window as any).google.maps.marker.AdvancedMarkerElement({
              map,
              position: userLocation,
              title: 'Your location',
            });

            new (window as any).google.maps.marker.AdvancedMarkerElement({
              map,
              position: closestLocation,
              title: closestLocation.name,
            });
          },
          () => {
            handleLocationError(true, map.getCenter());
          }
        );
      } else {
        // Browser doesn't support Geolocation
        handleLocationError(false, { lat: 39.57476806640625, lng: -75.75569152832031 });
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
    script.src = `https://maps.googleapis.com/maps/api/js?key=API_KEY_HERE&callback=initMap&libraries=maps,marker&v=beta`;
    script.async = true;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [locations]);

  return <div id="map" style={{ height: '100vh', width: '100%' }}></div>;
};

export default GoogleMap;

export {};
