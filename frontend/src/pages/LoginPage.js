import React, { useState } from 'react';
import '../assets/css/LoginPage.css';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';

function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
    remember: true,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCredentials(prevCredentials => ({
      ...prevCredentials,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Attempting login with:', credentials);

    fetch('http://localhost:8000/api/token/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            username: credentials.username,
            password: credentials.password,
        }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Login failed: Wrong username or password.');
        }
        return response.json();
    })
    .then(data => {
        console.log('Login successful:', data);
        localStorage.setItem('accessToken', data.access);
        localStorage.setItem('refreshToken', data.refresh);
        alert('Login successful! Redirecting to your calendar.');
        navigate('/'); // redirect to user's main calendar page here
    })
    .catch((error) => {
        console.error('Login error:', error);
        alert(error.message);
    });
  };

  return (
    <div>
      <Helmet>
        <body className="login-page" />
      </Helmet>
      <main className='login-main'>
        <div className="login-form-container">
          <h1>Welcome to Duet!</h1>
          <h2>Login</h2>

          <form onSubmit={handleSubmit}>
            <div className="login-container">
              <label className='login-label' htmlFor="username"><b>Username</b></label>
              <input 
                type="text" 
                name="username" 
                value={credentials.username} 
                onChange={handleChange} 
                required 
              />

          <label htmlFor="psw"><b>Password</b></label>
            <div className="login-password-container">
              <input 
                type={showPassword ? "text" : "password"} 
                name="password" 
                value={credentials.password} 
                onChange={handleChange} 
                required 
              />
              <span className="login-password-toggle-icon" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? 'Hide Password' : 'Show Password'}
              </span>
            </div>

              <label>
                <div className="login-checkbox-container">
                  <input 
                    type="checkbox" 
                    name="remember" 
                    checked={credentials.remember} 
                    onChange={handleChange} 
                  /> Remember me
                </div>
              </label>

              <button className='login-button' type="submit">Login</button>
            </div>

            <div className="register">New user? <a href="/register">Register</a></div>
            <div className="psw">Forgot <a href="/ResetPwdRequest">password?</a></div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default LoginPage;
