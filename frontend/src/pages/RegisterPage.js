import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthShell from '../components/AuthShell';

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
    <AuthShell
      title="Create your account"
      subtitle="Set up your profile and start scheduling meetings in minutes."
    >
      <form className="duet-form" onSubmit={handleSubmit}>
        <section aria-label="Profile details" className="duet-form-grid">
          <div>
            <label className="duet-label" htmlFor="firstName">
              First name
            </label>
            <input
              className="duet-input"
              type="text"
              id="firstName"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              autoComplete="given-name"
            />
          </div>

          <div>
            <label className="duet-label" htmlFor="lastName">
              Last name
            </label>
            <input
              className="duet-input"
              type="text"
              id="lastName"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              autoComplete="family-name"
            />
          </div>
        </section>

        <div>
          <label className="duet-label" htmlFor="userName">
            Username
          </label>
          <input
            className="duet-input"
            type="text"
            id="userName"
            name="username"
            value={formData.username}
            onChange={handleChange}
            autoComplete="username"
          />
        </div>

        <div>
          <label className="duet-label" htmlFor="email">
            Email
          </label>
          <input
            className="duet-input"
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            autoComplete="email"
          />
        </div>

        <section aria-label="Password setup" className="duet-form-grid">
          <div>
            <label className="duet-label" htmlFor="password">
              Password
            </label>
            <div className="space-y-2">
              <input
                className="duet-input"
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="duet-inline-action"
                onClick={handleTogglePasswordVisibility}
              >
                {showPassword ? 'Hide password' : 'Show password'}
              </button>
            </div>
          </div>

          <div>
            <label className="duet-label" htmlFor="password2">
              Confirm password
            </label>
            <div className="space-y-2">
              <input
                className="duet-input"
                type={showConfirmPassword ? 'text' : 'password'}
                id="password2"
                name="password2"
                value={formData.password2}
                onChange={handleChange}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="duet-inline-action"
                onClick={handleToggleConfirmPasswordVisibility}
              >
                {showConfirmPassword ? 'Hide password' : 'Show password'}
              </button>
            </div>
          </div>
        </section>

        <button className="duet-button-primary" type="submit">
          Register
        </button>
      </form>

      <footer className="duet-helper-links">
        <p>
          Already have an account?{' '}
          <Link to="/Login" className="duet-link">
            Log in
          </Link>
        </p>
      </footer>
    </AuthShell>
  );
}

export default RegistrationForm;
