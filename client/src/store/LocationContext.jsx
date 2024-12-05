import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const LocationContext = createContext();

const LocationProvider = ({ children }) => {
  const [locationDetails, setLocationDetails] = useState({
    city: '',
    locality: '',
    principalSubdivision: '',
    latitude: null,
    longitude: null,
  });

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await axios.get(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
          console.log('API Response:', response.data);

          const city = response.data.city || '';
          const locality = response.data.locality || '';
          const principalSubdivision = response.data.principalSubdivision || '';
          
          setLocationDetails({
            city,
            locality,
            principalSubdivision,
            latitude,
            longitude
          });

        } catch (error) {
          console.error('Error fetching the location details:', error);
          setLocationDetails({
            city: '',
            locality: '',
            principalSubdivision: '',
            latitude,
            longitude
          });
        }
      }, (error) => {
        console.error('Error getting geolocation:', error);
        setLocationDetails({
          city: 'Geolocation not supported or permission denied',
          locality: '',
          principalSubdivision: '',
          latitude: 0,
          longitude: 0,
        });
      });
    } else {
      setLocationDetails({
        city: 'Geolocation not supported',
        locality: '',
        principalSubdivision: '',
        latitude: 0,
        longitude: 0,
      });
    }
  }, []);

  return (
    <LocationContext.Provider value={locationDetails}>
      {children}
    </LocationContext.Provider>
  );
};

export { LocationContext, LocationProvider };
