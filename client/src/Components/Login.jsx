import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Login() {
    const navigate = useNavigate();
    
    const [loginDetails, setLoginDetails] = useState({
        email: '',
        password: ''
    });
    
    const [errors, setErrors] = useState({
        email: '',
        password: ''
    });

    function handleChange(event) {
        const { name, value } = event.target;
        setLoginDetails(prevDetails => ({
            ...prevDetails,
            [name]: value,
        }));
    }

    function validate() {
        let emailError = '';
        let passwordError = '';

        if (!loginDetails.email) {
            emailError = 'Email is required';
        }       
        // } else if (!/\S+@\S+\.\S+/.test(loginDetails.email)) {
        //     emailError = 'Email address is invalid';
        // }

        if (!loginDetails.password) {
            passwordError = 'Password is required';
        }
        if (emailError || passwordError) {
            setErrors({ email: emailError, password: passwordError });
            return false;
        }

        return true;
    }

    const handleLogin = () => {
        const isValid = validate();
        if (isValid) {
            axios.post('http://localhost:3000/api/v1/users/login', {
                email: loginDetails.email,
                password: loginDetails.password,
            }, {
                headers: { 'Content-Type': 'application/json' },
            })
            .then(response => {
                const { accessToken } = response.data.data;
                localStorage.setItem("accessToken", accessToken);
                localStorage.setItem('isLoggedIn', 'true');
                navigate("/");
            })
            .catch(error => {
                console.error('There was an error logging in!', error);
            });
        }
    }

    return (
        <div>
            <label htmlFor="email"> Email ID
                <input 
                    type="email" 
                    name="email" 
                    onChange={handleChange} 
                    value={loginDetails.email} 
                    required 
                />
                {errors.email && <div style={{ color: 'red' }}>{errors.email}</div>}
            </label>
            <label htmlFor="password"> Password
                <input 
                    type="password" 
                    name="password" 
                    onChange={handleChange} 
                    value={loginDetails.password} 
                    required 
                />
                {errors.password && <div style={{ color: 'red' }}>{errors.password}</div>}
            </label>
            <button onClick={handleLogin}>Login</button>
            <Link to="/register">Haven't registered? Register Now.</Link>
        </div>
    )
}

export default Login;
