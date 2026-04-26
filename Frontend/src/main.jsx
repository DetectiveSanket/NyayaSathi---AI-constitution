import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';

import { store } from './store/store.js';
import { Provider } from 'react-redux';

// Persist auth state (token, user) across page reloads
// NOTE: Only the auth slice is persisted (key: 'persist:auth').
// The rag slice (conversations) is loaded fresh from backend on login.
import { persistStore } from 'redux-persist';
import { PersistGate } from 'redux-persist/integration/react';

// setInitialized marks isInitializing=false once redux-persist rehydration completes.
// This prevents GuestRoute/ProtectedRoute from blocking page render during API calls.
import { setInitialized } from './store/authSlice.js';

const persistor = persistStore(store);

// ✅ Keep Axios Authorization header perfectly in sync with Redux auth state.
// Handles: initial page load rehydration, login (token → set), logout (token → null → clear).
import { setAuthHeader } from './services/api.js';
let lastToken = null;
store.subscribe(() => {
  const { token } = store.getState().auth;
  if (token !== lastToken) {
    lastToken = token;
    setAuthHeader(token || null); // sets or clears axios header
  }
});
// Restore immediately in case rehydration is synchronous (rare)
const { token: initialToken } = store.getState().auth;
if (initialToken) { lastToken = initialToken; setAuthHeader(initialToken); }

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <Provider store={store}>
            {/* onBeforeLift fires after rehydration is done — mark app as initialized */}
            <PersistGate loading={null} persistor={persistor} onBeforeLift={() => store.dispatch(setInitialized())}>
                <App />
            </PersistGate>
        </Provider>
    </StrictMode>,
);