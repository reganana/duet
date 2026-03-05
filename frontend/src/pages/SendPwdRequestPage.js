// Import React and any other dependencies
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthShell from '../components/AuthShell';


function SendPwdRequestPage() {
  const [username, setUsername] = useState('');

  // Handle the change in the input field
  const handleInputChange = (event) => {
    setUsername(event.target.value);
  };
  
  const handleSubmit = async (event) => {
    event.preventDefault();
    const response = await fetch(`http://localhost:8000/accounts/password/`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            // 'Authorization': `Bearer ${userToken}`, // Example token usage
        },
        body: JSON.stringify({ username: username }),
    });

    if (response.ok) {
      // Handle successful update
      console.log('Email sent to user.');
      alert('Request link sent! Please check your email to reset your password.');
    } else if (response.status === 404) {
      alert('Invalid username.');
      console.error('Invalid username.');
    }
  };

  return (
    <AuthShell
      title="Forgot password?"
      subtitle="Enter your username and we'll send a reset link to your registered email."
    >
      <form id="pwd-sendRequestForm" className="duet-form" onSubmit={handleSubmit}>
        <div>
          <label className="duet-label" htmlFor="username">
            Username
          </label>
          <input
            className="duet-input"
            type="text"
            id="username"
            name="username"
            required
            value={username}
            onChange={handleInputChange}
            autoComplete="username"
          />
        </div>

        <button type="submit" id="send" className="duet-button-primary">
          Send request link
        </button>
      </form>

      <footer className="duet-helper-links">
        <p>
          Go back to{' '}
          <Link to="/Login" className="duet-link">
            login
          </Link>
        </p>
      </footer>
    </AuthShell>
  );
}

export default SendPwdRequestPage;
