import React, { useEffect } from 'react';

const GoogleMap: React.FC = () => {
  useEffect(() => {
    let map: any;

    // Define the initMap function globally
    (window as any).initMap = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const userLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };

            map = new (window as any).google.maps.Map(document.getElementById('map') as HTMLElement, {
              center: userLocation,
              zoom: 14,
              mapId: 'DEMO_MAP_ID',
            });

            new (window as any).google.maps.marker.AdvancedMarkerElement({
              map,
              position: userLocation,
              title: 'Your location',
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
  }, []);

  return <div id="map" style={{ height: '100vh', width: '100%' }}></div>;
};

export default GoogleMap;

export {};
