import React from 'react';
import { lazy, Suspense } from 'react';
import { ThemeProvider, useTheme } from './components/ThemeProvider';
import Loading from '../shared/Loading';

//* Lazy-loaded section components
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

// Inner component so it can consume useTheme inside ThemeProvider
function WebIntroContent() {
  const { effectiveTheme } = useTheme();

  return (
    <div className={`intro-page ${effectiveTheme} min-h-screen ip-bg-primary ip-text-primary transition-colors duration-300`}>
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
  );
}

function WebIntro() {
  return (
    <ThemeProvider>
      <WebIntroContent />
    </ThemeProvider>
  );
}

export default WebIntro;