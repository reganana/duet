// Import React and any other dependencies
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import '../assets/css/reset_pwd.css';


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
    <div>
      <Helmet>
        <body className="reset-pwd-page" />
      </Helmet>
      <main>
        <div className="pwd-main">
          <div className="pwd-form-container">
            <h1>Forgot Password?</h1>

            <form id="pwd-sendRequestForm" onSubmit={handleSubmit}>

              <div className="pwd-container">
                <label htmlFor="username"><b>Username</b></label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  required
                  value={username}
                  onChange={handleInputChange}
                />
                    
                <button type="submit" id="send" className="pwd-button">Send Request Link</button>
              </div>

              <div className="pwd-login">Go back to <a href="/login">login</a></div>
            </form>
          </div>
        </div>
      </main>
      
    </div>
  );
}

export default SendPwdRequestPage;
