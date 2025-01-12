import React, { useState } from 'react';
import '../assets/css/RegisterPage.css';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';

function RegistrationForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    password2: '',
    email: '',
    first_name: '',
    last_name: '',
  });

  const isPasswordValid = (password) => {
    return password.length >= 8 && /\d/.test(password);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleToggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleSubmit = (e) => {
    e.preventDefault(); 
    if (!isPasswordValid(formData.password.trim())) {
      alert("Password must be at least 8 characters long and contain a number.");
      return;
    }
    if (!formData.first_name.trim()) {
      alert('First name is required.');
    } else if (!formData.last_name.trim()) {
      alert('Last name is required.');
    } else if (!formData.username.trim()) {
      alert('Username is required.');
    } else if (!formData.email.trim()) {
      alert('Email is required.');
    } else if (!formData.password.trim()) {
      alert('Password is required.');
    } else if (!formData.password2.trim()) {
        alert('Confirm Password is required.');
    } else if (formData.password !== formData.password2) {
        alert('Passwords do not match.');
        return; // prevent form submission
    }

    fetch('http://localhost:8000/accounts/', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            first_name: formData.first_name, 
            last_name: formData.last_name,
            username: formData.username,
            password: formData.password,
            password2: formData.password2,
            email: formData.email,
        }),
     })
    .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        console.log(data); //  can redirect to another page here.
        alert('Registered successfully! Redirecting to login.');
        navigate('/login'); // redirect to user's main calendar page here
      })
      .catch(error => {
        console.error('Error during registration:', error);
        alert('There was a problem with your registration. Please check your information and try again.');
    });
};

  return (
    <div>
      <Helmet>
        <body className="register-page" />
      </Helmet>
      <main className='register-main'>
        <div className="register-container">
          <h1 className='register-h1'>Sign up for Duet</h1>

          <form className="register-meeting-form" onSubmit={handleSubmit}>
            <div className="register-form-group">
              <label htmlFor="firstName">First name: </label>
              <input type="text" id="firstName" name="first_name" value={formData.first_name} onChange={handleChange} />
            </div>

            <div className="register-form-group">
              <label htmlFor="lastName">Last name: </label>
              <input type="text" id="lastName" name="last_name" value={formData.last_name} onChange={handleChange} />
            </div>

            <div className="register-form-group">
              <label htmlFor="userName">User Name: </label>
              <input type="text" id="userName" name="username" value={formData.username} onChange={handleChange} />
            </div>

            <div className="register-form-group">
              <label htmlFor="password">Password: </label>
              <input type={showPassword ? "text" : "password"} id="password" name="password" value={formData.password} onChange={handleChange} />
              <span className="register-password-toggle-icon" onClick={handleTogglePasswordVisibility}>
                {showPassword ? 'Hide Password' : 'Show Password'}
              </span>
            </div>

            <div className="register-form-group">
              <label htmlFor="password2">Confirm Password: </label>
              <input type={showConfirmPassword ? "text" : "password"} id="password2" name="password2" value={formData.password2} onChange={handleChange} />
              <span className="register-password-toggle-icon" onClick={handleToggleConfirmPasswordVisibility}>
                {showConfirmPassword ? 'Hide Password' : 'Show Password'}
              </span>
            </div>

            <div className="register-form-group">
              <label htmlFor="email">Email: </label>
              <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} />
            </div>

            <div className="register-form-group">
              <button type="submit">Register</button>
            </div>
          </form>
          <div className="inline-container">
            <p>Already have an account?</p>
            <a href="/login">Log in</a>
          </div>
        </div>
      </main>
    </div>
  );
}

export default RegistrationForm;