
import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';

const GuestRoute = ({ children }) => {
  const { token, loading } = useSelector((s) => s.auth);
  const location = useLocation();

  // While auth is initializing, render nothing to avoid flicker
  if (loading) return null;

  // If we have any session (token), keep user on the app (chatbot)
  if (token) {
    return <Navigate to="/chatbot" replace state={{ from: location.pathname }} />;
  }

  // No session → allow access to guest page (login/register)
  return children;
};

export default GuestRoute;

/* 

    * You need a “guest-only” route guard. Right now, /login is always renderable, even if a session exists. Add a GuestRoute that blocks public pages when a token/session is present, and wrap /login (and optionally /register, forgot-password, etc.) with it.

    ⁡⁣⁣⁢Why this fixes it⁡
        - Browser will navigate to /login, but your guard immediately redirects back to /chatbot with replace, so the UI doesn’t flicker and history won’t keep /login (feels like “don’t react anything”).
        - Treat “has token” as logged-in for guest pages, so even if user isn’t hydrated yet, login won’t show.

    ⁡⁢⁣⁣𝗡𝗼𝘁𝗲𝘀⁡
        - ProtectedRoute keeps blocking unauthenticated access to /chatbot (token && user).
        - GuestRoute blocks authenticated users from seeing /login (token present → redirect).
        - Using replace prevents history pollution, so typing /login while on /chatbot “does nothing,” like ChatGPT.


        ^ The children prop is “whatever you wrap inside a component.” React automatically passes that content as props.children.

        When you write:
            ⁡⁢⁢⁢<GuestRoute>
              <LogIn />
            </GuestRoute> ⁡ 

        - inside GuestRoute, children equals <LogIn />. Your guard decides whether to render it or block/redirect.    
            
*/