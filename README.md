# MotionPine ClientOS

[cloudflarebutton]

A premium, minimalist client management operating system featuring bento-grid dashboards, real-time messaging, and project tracking.

MotionPine ClientOS is a premium, single-page application (SPA) designed as a comprehensive operating system for agency-client management. It serves two distinct user roles: Admins (Agency) and Clients. The application features a distinct 'Bento-grid' dashboard interface characterized by soft shadows, rounded corners, and a minimalist Apple-esque aesthetic.

Core capabilities include a centralized Admin Dashboard for managing clients, projects, intake forms, and revenue tracking, alongside a Client Dashboard for tracking project status, credit usage ('Pines'), and accessing assets. The system includes a robust Chat module supporting rich media, an Expenses/Subscription tracker, and a Project management suite.

## Key Features

-   **Dual Dashboards**: Separate, bento-grid style dashboards for Admins and Clients.
-   **Role-Based Access**: Distinct views and permissions for agency administrators and their clients.
-   **Client Management**: A complete module for admins to manage client information, status, and projects.
-   **Project Tracking**: A Kanban-style or list view for projects with status filtering.
-   **Integrated Chat**: A real-time messaging module for seamless communication between admins and clients.
-   **Expense & Team Management**: Modules for tracking infrastructure costs, subscriptions, and managing team members.
-   **Scalable Architecture**: Built on Cloudflare Workers and Durable Objects for global, low-latency performance.
-   **Modern UI/UX**: A clean, minimal, and premium design focused on simplicity and speed.

## Technology Stack

-   **Frontend**: React, Vite, React Router, TypeScript
-   **State Management**: Zustand
-   **UI**: Tailwind CSS, shadcn/ui, Framer Motion
-   **Backend**: Cloudflare Workers, Hono
-   **Persistence**: Cloudflare Durable Objects
-   **Tooling**: Bun, ESLint, TypeScript

## Project Structure

The codebase is organized into a clean, enterprise-grade structure to enforce separation of concerns and scalability.

```
/src
  /app
    /admin      # Admin-specific routes and views
    /client     # Client-specific routes and views
  /components   # Reusable React components (UI, layout, forms)
  /services     # API clients and business logic
  /hooks        # Custom React hooks
  /lib          # Utility functions and libraries
  /types        # Shared TypeScript types (deprecated, use /shared)
/worker         # Cloudflare Worker backend code (Hono routes, entities)
/shared         # Shared types between frontend and worker
```

## Getting Started

Follow these instructions to get the project up and running on your local machine for development and testing purposes.

### Prerequisites

-   [Node.js](https://nodejs.org/) (v18 or later)
-   [Bun](https://bun.sh/)
-   [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) - Cloudflare's command-line tool for Workers.

### Installation & Local Development

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd motionpine-client-os
    ```

2.  **Install dependencies:**
    This project uses Bun for package management.
    ```bash
    bun install
    ```

3.  **Run the development server:**
    This command starts the Vite frontend development server and the Wrangler development server for the backend worker simultaneously.
    ```bash
    bun dev
    ```
    The application will be available at `http://localhost:3000`.

## Deployment

This project is designed for seamless deployment to the Cloudflare network.

1.  **Login to Wrangler:**
    Ensure you are logged into your Cloudflare account.
    ```bash
    wrangler login
    ```

2.  **Deploy the application:**
    The `deploy` script in `package.json` handles building the frontend assets and deploying them along with the worker to Cloudflare.
    ```bash
    bun run deploy
    ```
    Wrangler will provide you with the URL of your deployed application.

Alternatively, you can deploy directly from your GitHub repository using the button below.

[cloudflarebutton]