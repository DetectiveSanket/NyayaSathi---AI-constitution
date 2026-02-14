import { lazy, Suspense } from 'react';
import { Toaster } from 'sonner';

//* Loading component for Suspense fallback
import Loading from './shared/Loading';

//* Auth pages - can also be lazy loaded
const ForgetPassword = lazy(() => import('./auth/ForgetPassword'));
const OTPVerification = lazy(() => import('./auth/OTPVerification'));
const ResetPassword = lazy(() => import('./auth/ResetPassword'));
const ResetPasswordOTP = lazy(() => import('./auth/ResetPasswordOTP'));

//* Route protection components - NOT lazy loaded (needed immediately for routing logic)
import ProtectedRoute from './ProtectionRoutes/ProtectedRoute';
import GuestRoute from './ProtectionRoutes/GuestRoute';

//* Page components - Lazy loaded (only loads when route is visited)
const LogIn = lazy(() => import('./shared/LogIn'));
const Register = lazy(() => import('./shared/Register'));
const WebIntro = lazy(() => import('./Web Intro/WebIntro'));
const Doc = lazy(() => import('./Documentation/app'));
const Chatbot = lazy(() => import('./RAG Model/chatBot'));
const Error = lazy(() => import('./ProtectionRoutes/Error'));

import {
    createBrowserRouter,
    RouterProvider,
} from "react-router-dom";

const router = createBrowserRouter([

    {
      path: "/",
      element: (
        <Suspense fallback={<Loading />}>
          <WebIntro />
        </Suspense>
      ),
    },

    {
        path: "/login",
        element: (
          <GuestRoute>
            <Suspense fallback={<Loading />}>
              <LogIn />
            </Suspense>
          </GuestRoute>
        ),
    },
    
    {
        path: "/register",
        element: (
            <GuestRoute>
              <Suspense fallback={<Loading />}>
                <Register />
              </Suspense>
            </GuestRoute>
        ),
    },

    {
        path:"/otpverification",
        element: (
          <Suspense fallback={<Loading />}>
            <OTPVerification/>
          </Suspense>
        ),
    },

    {
        path: "/forgot-password",
        element: (
          <GuestRoute>
            <Suspense fallback={<Loading />}>
              <ForgetPassword />
            </Suspense>
          </GuestRoute>
        ),
    },

    {
        path: "/reset-password-otp",
        element: (
            <GuestRoute>
              <Suspense fallback={<Loading />}>
                <ResetPasswordOTP />
              </Suspense>
            </GuestRoute>
        ),
    },

    {
        path: "/resetpassword",
        element: (
            <GuestRoute>
              <Suspense fallback={<Loading />}>
                <ResetPassword />
              </Suspense>
            </GuestRoute>
        ),
    },

    {
        path:"/doc",
        element: (
          <Suspense fallback={<Loading />}>
            <Doc/>
          </Suspense>
        ),
    },

    // chatbot - protected route
    {
        path:"/chatbot",
        element: (
            <ProtectedRoute>
              <Suspense fallback={<Loading />}>
                <Chatbot />
              </Suspense>
            </ProtectedRoute>
        ),
    },

    // Catch-all route for undefined paths and display Error component
    {
        path:"*",
        element: (
          <Suspense fallback={<Loading />}>
            <Error/>
          </Suspense>
        ),
    }
    
]);


function App() {
    return (
        <>

            <RouterProvider router={router} />
            <Toaster /> {/*//* used for showing toast notifications , if you not import here then it will not work because it create a context for the whole app ,  this is install npm i sonner or*/}
             
        </>
    );
}

export default App;