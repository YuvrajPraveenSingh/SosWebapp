import axios from 'axios';
import React, { useContext } from 'react';
import { LocationContext } from '../store/LocationContext';

const SosButton = () => {
    const locationDetails = useContext(LocationContext);
    const handleSOSClick = async () => {
        try {
            const response = await axios.get('http://localhost:3000/api/v1/users/sos', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                }
            });
            console.log(locationDetails);

            const { emergencyEmail1, emergencyEmail2, emergencyEmail3, emergencyEmail4, emergencyEmail5 } = response.data.data;
            const validEmails = [
                emergencyEmail1,
                emergencyEmail2,
                emergencyEmail3,
                emergencyEmail4,
                emergencyEmail5
            ].filter(email => email && email.trim() !== '');

            const { subject, text } = {
                subject: 'Emergency SOS Alert',
                text: `This is an emergency SOS alert. Please help!\n\nLocation Details:\nLocality: ${locationDetails.locality}\nPrincipal Subdivision: ${locationDetails.principalSubdivision}\nPrincipal Subdivision Code: ${locationDetails.principalSubdivisionCode}`
            };

            validEmails.forEach(async (to) => {
                try {
                    const emailPayload = { to, subject, text };

                    await axios.post('http://localhost:3000/api/v1/users/send-email', emailPayload, {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                        }
                    });
                } catch (error) {
                    console.error(`Error sending email to ${to}:`, error);
                }
            });

        } catch (error) {
            console.error('Error clicking SOS button:', error);
        }
    };
    return (
        <div>
            <button className="sos-button" onClick={handleSOSClick}>SOS button</button>
        </div>
    )
}

export default SosButton