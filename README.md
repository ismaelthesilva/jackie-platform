# My Turborepo

This is a monorepo setup using Turborepo that includes two applications: a web application built with Vite and an admin application built with Next.js. Both applications utilize shared UI components and utilities, and they are configured to work with Supabase and Prisma for database management.

## Project Structure

```
my-turborepo
├── apps
│   ├── web          # Web application using Vite
│   └── admin        # Admin application using Next.js
├── packages
│   ├── database     # Database package with Prisma setup
│   ├── ui           # Shared UI components
│   └── eslint-config-custom # Custom ESLint configurations
├── turbo.json       # Turborepo configuration
├── package.json     # Root package configuration
└── README.md        # Project documentation
```

## Getting Started

To get started with the project, follow these steps:

1. **Clone the repository:**
   ```
   git clone <repository-url>
   cd my-turborepo
   ```

2. **Install dependencies:**
   ```
   npm install
   ```

3. **Run the applications:**
   - For the web application:
     ```
     cd apps/web
     npm run dev
     ```
   - For the admin application:
     ```
     cd apps/admin
     npm run dev
     ```

## Database Setup

This project uses Supabase and Prisma for database management. Make sure to set up your Supabase project and configure the database connection in the Prisma schema located at `packages/database/prisma/schema.prisma`.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or features you would like to add.

## License

This project is licensed under the MIT License.# jackie-platform
