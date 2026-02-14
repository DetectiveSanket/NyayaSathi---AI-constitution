import React from 'react';
import { lazy , Suspense } from 'react';
import { ThemeProvider } from './components/ThemeProvider';
import Loading from '../shared/Loading';

//* components..
// import Header from './components/Header';
// import Hero from './components/Hero';
// import Features from './components/Features';
// import Technology from './components/Technology';
// import HowItWorks from './components/HowItWorks';
// import Dashboard from './components/Dashboard';
// import Impact from './components/Impact';
// import Stats from './components/Stats';
// import About from './components/About';
// import Contact from './components/Contact';
// import Footer from './components/Footer';
// import AdminsDetails from './components/AdminsDetails';

//* let use lazy loading / code spliting for the above components in future to improve performance
const Header = lazy(() => import('./components/Header'));
const Hero = lazy(() => import('./components/Hero'));
const Features = lazy(() => import('./components/Features'));
const Technology = lazy(() => import('./components/Technology'));
const HowItWorks = lazy(() => import('./components/HowItWorks'));
const Dashboard = lazy(() => import('./components/Dashboard'));
const Impact = lazy(() => import('./components/Impact'));
const Stats = lazy(() => import('./components/Stats'));
const About = lazy(() => import('./components/About'));
const Contact = lazy(() => import('./components/Contact'));
const Footer = lazy(() => import('./components/Footer'));
// const AdminsDetails = lazy(() => import('./components/AdminsDetails'));




function WebIntro() {
  return (
        <ThemeProvider>

        {/* ^ COmponents without lazy loading           
            <div className="min-h-screen bg-primary text-text-primary transition-colors duration-300">+
                <Hero />
                <Header />
                <Dashboard />
                <Features />
                <Technology />
                <HowItWorks />
                <Impact />
                <Stats />
                <About />
                <AdminsDetails /> 
                <Contact />
                <Footer />
            </div>
         */}

        <div className="min-h-screen bg-primary text-text-primary transition-colors duration-300">
            <Suspense fallback={<Loading />}>
                <Hero />
            </Suspense>

            <Suspense fallback={<Loading />}>
                <Header />
            </Suspense>

            <Suspense fallback={<Loading />}>
               <Dashboard /> 
            </Suspense>

            <Suspense fallback={<Loading />}>
                <Features />
            </Suspense>

            <Suspense fallback={<Loading />}>
                <Technology />    
            </Suspense>

            <Suspense fallback={<Loading />}>
                <HowItWorks />
            </Suspense>

            <Suspense fallback={<Loading />}>
                <Impact />
            </Suspense>

            <Suspense fallback={<Loading />}>
                <Stats />
            </Suspense>

            <Suspense fallback={<Loading />}>
               <About /> 
            </Suspense>

            <Suspense fallback={<Loading />}>
                <Contact />
            </Suspense>

            <Suspense fallback={<Loading />}>
                <Footer />
            </Suspense>
            
        </div>
            
        </ThemeProvider>
    );
}

export default WebIntro;