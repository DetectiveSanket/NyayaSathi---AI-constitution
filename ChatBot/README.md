# ChatBot - React + Vite + TypeScript + Tailwind CSS

A modern React application built with Vite, TypeScript, and Tailwind CSS v4.

## 🚀 Features

- ⚡️ **Vite** - Fast build tool and development server
- ⚛️ **React 19** - Latest React with hooks
- 🔷 **TypeScript** - Type safety and better developer experience
- 🎨 **Tailwind CSS v4** - Latest utility-first CSS framework
- 📦 **ESLint** - Code linting and formatting

## 🛠️ Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

## 📁 Project Structure

```text
src/
├── assets/          # Static assets (React logo, etc.)
├── App.tsx          # Main application component with Tailwind styling
├── index.css        # Global styles with Tailwind directives
└── main.tsx         # Application entry point
```

## 🎨 Tailwind CSS v4

This project uses the latest Tailwind CSS v4 with:

- `@tailwindcss/postcss` plugin for PostCSS integration
- Simplified configuration in `tailwind.config.js`
- Utility classes for responsive design and animations
- Custom component styling in `App.tsx`

## 🔧 Development

The development server runs on `http://localhost:5173` with:

- Hot Module Replacement (HMR)
- TypeScript checking
- Tailwind CSS v4 compilation
- ESLint integration

## 📦 Build

The production build creates optimized static files in the `dist/` directory with automatic Tailwind CSS purging for smaller bundle sizes.
