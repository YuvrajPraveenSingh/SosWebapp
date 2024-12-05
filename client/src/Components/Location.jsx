import React, { useContext } from 'react';
import { LocationContext } from '../store/LocationContext';

function Location() {
  const locationDetails = useContext(LocationContext);

  return (
    <div>
      <p>Your City: {locationDetails.city}</p>
      <p>Your Locality: {locationDetails.locality}</p>
      <p>Your Principal Subdivision: {locationDetails.principalSubdivision}</p>
      <p>Your Latitude: {locationDetails.latitude}</p>
      <p>Your Longitude: {locationDetails.longitude}</p>
    </div>
  );
}

export default Location;
