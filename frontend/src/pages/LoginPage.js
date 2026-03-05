import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthShell from '../components/AuthShell';

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
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to coordinate meetings and keep your calendar clean."
    >
      <form className="duet-form" onSubmit={handleSubmit}>
        <section aria-label="Account credentials" className="space-y-4">
          <div>
            <label className="duet-label" htmlFor="username">
              Username
            </label>
            <input
              className="duet-input"
              id="username"
              type="text"
              name="username"
              value={credentials.username}
              onChange={handleChange}
              autoComplete="username"
              required
            />
          </div>

          <div>
            <label className="duet-label" htmlFor="password">
              Password
            </label>
            <div className="space-y-2">
              <input
                className="duet-input"
                id="password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={credentials.password}
                onChange={handleChange}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="duet-inline-action"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? 'Hide password' : 'Show password'}
              </button>
            </div>
          </div>
        </section>

        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input
            className="duet-checkbox"
            type="checkbox"
            name="remember"
            checked={credentials.remember}
            onChange={handleChange}
          />
          Remember me
        </label>

        <button className="duet-button-primary" type="submit">
          Login
        </button>
      </form>

      <footer className="duet-helper-links">
        <p>
          New user?{' '}
          <Link to="/Register" className="duet-link">
            Register
          </Link>
        </p>
        <p>
          <Link to="/ResetPwdRequest" className="duet-link">
            Forgot password?
          </Link>
        </p>
      </footer>
    </AuthShell>
  );
}

export default LoginPage;
