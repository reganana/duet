import React from 'react';

function AuthShell({ title, subtitle, children }) {
  return (
    <main className="auth-shell">
      <div
        aria-hidden="true"
        className="auth-orb -left-20 top-12 h-48 w-48 bg-cyan-300/60 sm:h-64 sm:w-64"
      />
      <div
        aria-hidden="true"
        className="auth-orb -right-20 bottom-12 h-56 w-56 bg-amber-200/60 sm:h-72 sm:w-72"
      />

      <section className="auth-card" aria-labelledby="auth-title">
        <header className="auth-header">
          <p className="auth-eyebrow">Duet Scheduler</p>
          <h1 id="auth-title" className="auth-title">
            {title}
          </h1>
          {subtitle ? <p className="auth-subtitle">{subtitle}</p> : null}
        </header>
        {children}
      </section>
    </main>
  );
}

export default AuthShell;
