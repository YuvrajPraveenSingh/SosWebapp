import React from 'react'
import { useState } from 'react';
import { useEffect } from 'react';
import { Link } from 'react-router-dom'
import EmergencyContacts from './EmergencyContact.jsx';
import Location from './Location.jsx';
import SosButton from './SosButton.jsx';
import { LocationProvider } from '../store/LocationContext.jsx';
import './Home.css'; 
import axios from 'axios';

function Home() {
const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    setIsLoggedIn(loggedIn);
  }, []);
  
  return( 
    <div className="container">
        
        <LocationProvider>
        {!isLoggedIn && <Link to="/login"><button className="login-button">Login</button></Link>}
        {isLoggedIn && (
            <div>
                <SosButton />
                <Location />
              
              <EmergencyContacts />
            </div>
        ) }
        </LocationProvider>
    </div>
  )
}

export default Home