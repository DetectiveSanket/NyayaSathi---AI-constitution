// ...existing code...
import React from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { logoutUser } from '../features/auth/authThunks'
import { localLogout } from '../store/authSlice'

function ChatBot() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const logoutHandle = async () => {
    try {
      await dispatch(logoutUser()).unwrap();   // calls API, clears auth header
    } catch {
      dispatch(localLogout());                  // fallback: clear client state
    } finally {
      navigate('/login', { replace: true });    // go to login
    }
  };

  return (
    <div>
      <h1 className='text-2xl font-bold'>Chat Bot Page</h1>
      <button
        className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
        onClick={logoutHandle}
      >
        Logout
      </button>
    </div>
  )
}

export default ChatBot
// ...existing code...