import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthShell from '../components/AuthShell';

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
    <AuthShell
      title="Reset password"
      subtitle="Use a strong password with at least 8 characters and one number."
    >
      <form id="resetPasswordForm" className="duet-form" onSubmit={handleSubmit}>
        <div>
          <label className="duet-label" htmlFor="new-pwd">
            New password
          </label>
          <input
            className="duet-input"
            type="password"
            id="new-pwd"
            name="new-pwd"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
          />
        </div>

        <div>
          <label className="duet-label" htmlFor="confirm-pwd">
            Confirm new password
          </label>
          <input
            className="duet-input"
            type="password"
            id="confirm-pwd"
            name="confirm-pwd"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
          />
        </div>

        <button type="submit" id="send" className="duet-button-primary">
          Reset password
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

export default ResetPwdPage;
