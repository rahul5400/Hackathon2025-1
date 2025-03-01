import React from 'react';
import GoogleMap from './GoogleMap';

interface MapProps {
  disasterType: string;
}

const Map: React.FC<MapProps> = ({ disasterType }) => {
  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <GoogleMap disasterType={disasterType} />
    </div>
  );
};

export default Map;
