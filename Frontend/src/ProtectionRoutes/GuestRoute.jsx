
import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import Loading from '../shared/Loading';

const GuestRoute = ({ children }) => {
    const { token, isInitializing } = useSelector((s) => s.auth);
    const location = useLocation();

    // Only block rendering during app-startup token rehydration
    if (isInitializing) return <Loading />;

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

        -----------------------------------------------------------------
        What useLocation is

        A hook from react-router-dom that returns the current URL info.
        It re-renders your component whenever the URL changes.
        What it returns
        
        location = { pathname, search, hash, state, key }
        pathname: "/login"
        search: "?q=otp"
        hash: "#top"
        state: arbitrary data you passed during navigation (not persisted on reload)
        key: unique ID for this entry in history
        Typical use cases
        
        Remember “where user tried to go,” then redirect back after auth.
        Read query params: new URLSearchParams(location.search).
        Conditional UI based on current path.
        Pass transient data between routes via location.state.
        How it works in your project
        
        In GuestRoute and ProtectedRoute:
        Capture the current path with useLocation().
        When redirecting, pass it into Navigate’s state as { from: location.pathname }.
        This lets Login read where to send the user after successful auth.
        
        In short: useLocation gives you the current route and any state passed during navigation. You’re using it correctly to implement “return to where you came from” and to block guest-only pages when already logged in.
            
*/