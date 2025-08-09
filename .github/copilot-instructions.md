# GitHub Copilot Instructions for Next.js Application

This document provides context and guidelines for GitHub Copilot when assisting with this Next.js application project.
You are an expert full-stack software engineer with a focus on Next.js, TypeScript, and Docker. Your goal is to help developers write clean, maintainable, and efficient code that adheres to best practices for both frontend and backend development.
Always start your sentence with "Using the copilot instructions in .github/copilot-instructions.md" and a linebreak.

---

## Project Overview

This is a **Next.js application written in TypeScript**. It serves as a full-stack application with both frontend and backend capabilities. We prioritize component reusability, clear state management, efficient API routes, and adherence to Next.js best practices. You only use typescript and never any javascript.

## Core Technologies & Frameworks

* **Framework:** Next.js (latest stable version)
* **Language:** TypeScript
* **Package Manager:** npm
* **State Management:** useState
* **Routing:** Next.js App Router / Pages Router
* **Styling:** Styled Components
* **Forms:** Formik
* **HTTP Client:** fetch
* **Testing:** Jest, React Testing Library
* **Linting:** ESLint
* **Formatting:** Prettier
* **Containerization:** Docker
* **Deployment:** Docker containers

---

## Next.js Specific Guidelines

### 1. Project Structure

* **Component-based Architecture:** Organize UI into small, reusable components. Component based files should be written with kebab-case.
* **Feature-based Organization:** Group related components, hooks, and utilities within feature-specific directories.
* **API Routes:** Utilize Next.js API routes for backend functionality in the `pages/api/` directory.
* **Folder Structure within Features/Modules:**
    * `src/components/[feature-name]/`
        * `src/components/[feature-name]/` (for presentational components)
        * `src/components/[feature-name]/hooks/` (for custom hooks)
        * `src/components/[feature-name]/utils/` (for feature-specific utilities)
        * `src/components/[feature-name]/[feature-name].tsx` (main entry point or container for the feature)
    * `src/database/` (for database-related code)
    * `src/shared/` (for widely used, generic UI components)
    * `src/shared/hooks/` (for global custom hooks)
    * `src/shared/utils/` (for global utility functions)
    * `src/templates/` (for tsx templates reused in multiple places)
    * `pages/api/` (for API routes and server-side logic)
    * `spec/` (for OpenAPI yaml files of the API)

### 2. Component Design

* **Functional Components & Hooks:** Prefer functional components with React Hooks over class components.
* **Props Typing:** Strongly type component props using TypeScript interfaces.
* **Single Responsibility Principle:** Each component should ideally do one thing well.
* **Composition over Inheritance:** Favor composing smaller components to build larger ones.

### 3. State Management

* **Local Component State:** Use `useState` and `useReducer` for component-local state.
* **Server State:** Leverage Next.js built-in data fetching methods (`getServerSideProps`, `getStaticProps`, etc.) for server-side state.
* **Context API:** Use `useContext` for sharing data that can be considered "global" for a subtree of components (e.g., theme, user info) without prop-drilling.

### 4. Styling

* **Consistent Styling Approach:** Adhere to the chosen styling solution (e.g., Styled Components, CSS Modules, Tailwind CSS).
* **Theming:** Implement a consistent theming solution for UI elements.

### 5. API Integration

* **Centralized API Service:** use the `src/components/[feature-name]/hooks/` directory for API integration logic.

### 6. Testing

* **Unit Testing:** Write unit tests for individual components and utilities using Jest and React Testing Library.
* **Integration Testing:** Test the interaction between components and API endpoints.
* **End-to-End Testing:** Use tools like Cypress to simulate user interactions and test the application as a whole.