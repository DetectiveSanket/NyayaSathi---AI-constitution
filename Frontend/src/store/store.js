
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import storage from 'redux-persist/lib/storage';
import authSlice from "./authSlice"; // ✅ Make sure this matches slice name
import ragSlice from "./ragSlice"; // RAG state management

import {
    persistReducer,
    FLUSH,
    REHYDRATE,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER,
} from 'redux-persist';

// ✅ Only persist the auth slice (user / token / isAuthenticated).
// The rag slice (conversations, messages) must NOT be persisted because:
//  1. Conversations are fetched from the backend on every login, so there
//     is no need for local persistence.
//  2. Persisting it causes cross-user data bleed: user B logging in from
//     the same browser would briefly see user A's cached conversations
//     until the API call completes.
const authPersistConfig = {
    key: 'auth',
    version: 1,
    storage,
};

const persistedAuthReducer = persistReducer(authPersistConfig, authSlice);

const rootReducer = combineReducers({
    auth: persistedAuthReducer, // ✅ persisted
    rag: ragSlice,              // ✅ ephemeral — always loaded from DB
});

export const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }),
});

export default store;
