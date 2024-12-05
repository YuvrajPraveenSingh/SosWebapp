import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Register() {
    const [formDetails, setFormDetails] = useState({
        firstName: '',
        lastName: '',
        contactNumber: '',
        email: '',
        password: '',
        emergencyEmail1: '',
        emergencyEmail2: '',
        emergencyEmail3: '',
        emergencyEmail4: '',
        emergencyEmail5: '',
    });
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    function handleChange(event) {
        const { name, value } = event.target;
        setFormDetails(prevDetails => ({
            ...prevDetails,
            [name]: value,
        }));
    }

    function clearForm() {
        setFormDetails({
            firstName: '',
            lastName: '',
            contactNumber: '',
            email: '',
            password: '',
            emergencyEmail1: '',
            emergencyEmail2: '',
            emergencyEmail3: '',
            emergencyEmail4: '',
            emergencyEmail5: '',
        });
    }

    async function handleRegister(event) {
        event.preventDefault();

        if (!formDetails.firstName || !formDetails.lastName || !formDetails.email || !formDetails.password) {
            setErrorMessage('Please fill in all required fields');
            return;
        }
                try {
            const response = await axios.post('http://localhost:3000/api/v1/users/register', formDetails);
            const { accessToken } = response.data.data;
            localStorage.setItem("accessToken", accessToken);
            localStorage.setItem('isLoggedIn', 'true');
            navigate("/");
        } catch (error) {
            if (error.response && error.response.status === 500 && error.response.data.includes('E11000 duplicate key error')) {
                setErrorMessage("Registration failed. The first name is already taken.");
            } else {
                console.error("Registration failed:", error);
                setErrorMessage("Registration failed. Please try again.");
            }
        }
    };

    return (
        <div>
            <form onSubmit={handleRegister}>
                <label htmlFor="firstName">First Name
                    <input type="text" name="firstName" onChange={handleChange} value={formDetails.firstName} />
                </label>
                <label htmlFor="lastName">Last Name
                    <input type="text" name="lastName" onChange={handleChange} value={formDetails.lastName} />
                </label>
                <label htmlFor="email">Email
                    <input type="email" name="email" onChange={handleChange} value={formDetails.email} />
                </label>
                <label htmlFor="password">Password
                    <input type="password" name="password" onChange={handleChange} value={formDetails.password} />
                </label>
                <label htmlFor="contactNumber">Your Contact Number
                    <input type="tel" name="contactNumber" onChange={handleChange} value={formDetails.contactNumber} />
                </label>
                <h2>Emergency Contacts ~</h2>
                <label htmlFor="emergencyEmail1">Emergency Email 1
                    <input type="email" name="emergencyEmail1" onChange={handleChange} value={formDetails.emergencyEmail1} />
                </label>
                <label htmlFor="emergencyEmail2">Emergency Email 2
                    <input type="email" name="emergencyEmail2" onChange={handleChange} value={formDetails.emergencyEmail2} />
                </label>
                <label htmlFor="emergencyEmail3">Emergency Email 3
                    <input type="email" name="emergencyEmail3" onChange={handleChange} value={formDetails.emergencyEmail3} />
                </label>
                <label htmlFor="emergencyEmail4">Emergency Email 4
                    <input type="email" name="emergencyEmail4" onChange={handleChange} value={formDetails.emergencyEmail4} />
                </label>
                <label htmlFor="emergencyEmail5">Emergency Email 5
                    <input type="email" name="emergencyEmail5" onChange={handleChange} value={formDetails.emergencyEmail5} />
                </label>
                {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
                <button type="submit">Submit</button>
                
            </form>
        </div>
    );
}

export default Register;
