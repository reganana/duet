import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../assets/css/reset_pwd.css';
import { Helmet } from 'react-helmet';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function ResetPwdPage() {
  const navigate = useNavigate();
  const query = useQuery();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const isPasswordValid = (password) => {
    return password.length >= 8 && /\d/.test(password);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!isPasswordValid(newPassword)) {
      alert("Password must be at least 8 characters long and contain a number.");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    const uid = query.get('uid');
    const token = query.get('token');

    try {
      const response = await fetch(`http://localhost:8000/accounts/password/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uid: Number(uid),
          token: token,
          new_password: newPassword,
          confirm_password: confirmPassword,
        }),
      });

      if (response.ok) {
        alert("Password has been reset successfully.");
        navigate('/login');
      } else {
        const errorResponse = await response.json();
        throw new Error(errorResponse.message);
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      alert('An error occurred while resetting password.');
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
            <h1>Reset Password</h1>
            <form id="resetPasswordForm" onSubmit={handleSubmit}>
              <div className="pwd-container">
                <label htmlFor="new-pwd"><b>New Password</b></label>
                <input
                  type="password"
                  id="new-pwd"
                  name="new-pwd"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />

                <label htmlFor="confirm-pwd"><b>Confirm New Password</b></label>
                <input
                  type="password"
                  id="confirm-pwd"
                  name="confirm-pwd"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />

                <button type="submit" id="send" className="pwd-button">Reset Password</button>
              </div>
            </form>
            <div className="pwd-login">Go back to <a href="/login">login</a></div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ResetPwdPage;
