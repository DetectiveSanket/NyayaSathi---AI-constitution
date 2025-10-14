import { Toaster } from 'sonner';

import ForgetPassword from "./auth/ForgetPassword";
import OTPVerification from "./auth/OTPVerification";
import ResetPassword from "./auth/ResetPassword";
import ResetPasswordOTP from "./auth/ResetPasswordOTP";
import LogIn from "./shared/LogIn";
import Register from "./shared/Register";
import WebIntro from "./Web Intro/WebIntro";
import Doc from "./Documentation/app";
import Chatbot from "./RAG Model/chatBot";
import Error from "./ProtectionRoutes/Error";
import ProtectedRoute from "./components/ProtectedRoute";

import {
    createBrowserRouter,
    RouterProvider,
} from "react-router-dom";

const router = createBrowserRouter([

    {
      path: "/",
      element: <WebIntro />,
    },

    {
        path:"/login",
        element:<LogIn/>
    },

    {
        path:"/register",
        element:<Register/>
    },

    {
        path:"/otpverification",
        element:<OTPVerification/>
    },

    {
        path:"/forgot-password",
        element:<ForgetPassword/>
    },

    {
        path:"/reset-password-otp",
        element:<ResetPasswordOTP/>
    },

    {
        path:"/resetpassword",
        element:<ResetPassword/>
    },

    {
        path:"/doc",
        element:<Doc/>
    },

    // chatbot - protected route
    {
        path:"/chatbot",
        element: (
            <ProtectedRoute>
                <Chatbot />
            </ProtectedRoute>
        ),
    },

    // Catch-all route for undefined paths and display Error component
    {
        path:"*",
        element:<Error/>
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