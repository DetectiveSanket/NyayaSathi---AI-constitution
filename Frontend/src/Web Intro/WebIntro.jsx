import React from 'react';
import { ThemeProvider } from './components/ThemeProvider';
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import Technology from './components/Technology';
import HowItWorks from './components/HowItWorks';
import Dashboard from './components/Dashboard';
import Impact from './components/Impact';
import Stats from './components/Stats';
import About from './components/About';
import Contact from './components/Contact';
import Footer from './components/Footer';
import AdminsDetails from './components/AdminsDetails';




function WebIntro() {
  return (
        <ThemeProvider>
            <div className="min-h-screen bg-primary text-text-primary transition-colors duration-300">
                <Header />
                <Hero />
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
        </ThemeProvider>
    );
}

export default WebIntro;