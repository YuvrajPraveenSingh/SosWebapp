import React, { useState, useEffect } from 'react';
import axios from 'axios';

function EmergencyContacts() {
    const [isEditing, setIsEditing] = useState(false);
    const [contacts, setContacts] = useState({
        emergencyEmail1: '',
        emergencyEmail2: '',
        emergencyEmail3: '',   
        emergencyEmail4: '',
        emergencyEmail5: ''
    });
    const [refresh, setRefresh] = useState(false); 

    useEffect(() => {
        let isMounted = true; // Track if the component is mounted
        async function fetchUserDetails() {
            try {
                const response = await axios.get('http://localhost:3000/api/v1/users/user-details', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('accessToken')} `  }
                });
                if (isMounted) {
                    const userDetails = response.data.data;
                    setContacts({
                        emergencyEmail1: userDetails.emergencyEmail1 || '',
                        emergencyEmail2: userDetails.emergencyEmail2 || '',
                        emergencyEmail3: userDetails.emergencyEmail3 || '',
                        emergencyEmail4: userDetails.emergencyEmail4 || '',
                        emergencyEmail5: userDetails.emergencyEmail5 || ''
                    });
                }
            } catch (error) {
                if (isMounted) {
                    console.error('Error fetching user details:', error);
                }
            }
        }
    
        fetchUserDetails();
        return () => {
            isMounted = false;
        };
    }, [refresh]); 

    function handleChange(event) {
        const { name, value } = event.target;
        setContacts(prevContacts => ({
            ...prevContacts,
            [name]: value
        }));
    }

    async function handleSave() {
        try {
            const response = await axios.post('http://localhost:3000/api/v1/users/updatecontacts', contacts, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                }
            });
            if (response.status === 200) {
                setIsEditing(false);
                alert('Emergency contacts updated successfully');
                setRefresh(!refresh);
            }
        } catch (error) {
            console.error(error);
            alert('An error occurred while updating emergency contacts');
        }
    }
  
    function handleEdit() {
        setIsEditing(true);
    }

    return (
        <div>
            <h2>Emergency Contacts</h2>
            <ul>
                {Object.entries(contacts).map(([key, value], index) => (
                    <li key={key}>
                        Emergency Email {index + 1}:
                        <input
                            type="email"
                            name={key}
                            value={value}
                            onChange={handleChange}
                            disabled={!isEditing}
                        />
                    </li>
                ))}
            </ul>
            <button onClick={isEditing ? handleSave : handleEdit}>
                {isEditing ? 'Save' : 'Edit'}
            </button>
        </div>
    );
}

export default EmergencyContacts;
