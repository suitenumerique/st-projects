<p align="center">
  <a href="https://github.com/suitenumerique/st-projects">
    <img width="100%" alt="Projets" src="https://github.com/user-attachments/assets/0a0d0741-9bf1-4ce6-ab8a-9adebbabbdf0" />
  </a>
</p>
<p align="center">
  <img alt="Node" src="https://img.shields.io/badge/node-22-green" />
  <img alt="Docker" src="https://img.shields.io/badge/docker-required-blue" />
</p>

# Projets

Projets is the project management tool for [La Suite territoriale](https://suiteterritoriale.anct.gouv.fr/).

Built on [Planka](https://github.com/plankanban/planka), it provides a customized Kanban-style interface designed specifically for teams managing territorial and digital transformation projects.

[![Deploy to Scalingo](https://cdn.scalingo.com/deploy/button.svg)](https://my.scalingo.com/deploy?source=https://github.com/suitenumerique/st-projects#main)

<p align="center">
  <img width="100%" alt="Projets" src="https://github.com/user-attachments/assets/f2ed0705-1016-4465-879c-c28fdc2480f7" />
</p>

## 🎯 Features

- 📊 **Project Management**: Create projects, boards, lists, cards, labels, and tasks
- 🤝 **Collaboration**: Add card members, track time, set due dates, add attachments, write comments
- ✍️ **Rich Content**: Markdown support in card descriptions and comments
- 🔍 **Filtering**: Filter by members and labels
- ⚡ **Real-time Updates**: Live synchronization across all clients
- 🔔 **Notifications**: Internal notification system
- 🌍 **Internationalization**: Multiple interface languages (French, English)
- 🔐 **Single Sign-On**: OpenID Connect (OIDC) authentication via Keycloak
- 🎨 **Modern UI**: Built with React and modern design components

## 🏗️ Architecture

Projets is a full-stack application with the following components:

### Frontend (`client/`)

- **Framework**: React 19 with Redux for state management
- **UI Libraries**:
  - @gouvfr-lasuite/ui-kit
  - @openfun/cunningham-react
- **Key Features**:
  - Redux-Saga for side effects
  - Redux-ORM for data modeling
  - React Router for navigation
  - Socket.io client for real-time updates
  - i18next for internationalization

### Backend (`server/`)

- **Framework**: Sails.js (Node.js MVC framework)
- **Database**: PostgreSQL with Knex.js query builder
- **Authentication**: OpenID Connect (OIDC) via Keycloak
- **Real-time**: Socket.io for WebSocket connections
- **File Storage**: AWS S3 compatible storage for attachments

### Infrastructure

- **Database**: PostgreSQL 16
- **Authentication Server**: Keycloak (OIDC provider)
- **Reverse Proxy**: Nginx
- **Containerization**: Docker & Docker Compose

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Docker** (version 20.10 or later)
- **Docker Compose** (version 2.0 or later)
- **Node.js** 22 (for local development without Docker)
- **npm** or **yarn** (for local development)

## 🚀 Quick Start

### Using Docker (Recommended)

The easiest way to get started is using the provided Makefile:

```bash
make bootstrap
```

This will:

1. Start all Docker services (PostgreSQL, Keycloak, Server, Client, Nginx)
2. Wait for services to be ready
3. Initialize the database with migrations and seeds
4. Create a default admin user

After setup completes, access the application at:

- **Application**: http://localhost:3000
- **Keycloak Admin Console**: http://localhost:8080 (admin/admin)

### Manual Docker Setup

If you prefer to use Docker Compose directly:

```bash
# Start all services
docker-compose -f docker-compose-dev.yml up -d

# Wait for services to be ready, then initialize database
make keycloak-wait
make init-db
```

### Local Development (Without Docker)

For local development without Docker:

```bash
# Install dependencies
npm install

# Set up environment variables
cp server/.env.sample server/.env
# Edit server/.env with your configuration

# Initialize database
npm run server:db:init

# Start development servers
npm start
```

This will start both the server (port 3000) and client (port 3001) concurrently.

## 🐳 Docker Services

The development environment includes:

- **postgres**: PostgreSQL 16 database (port 5433)
- **keycloak-db**: PostgreSQL database for Keycloak
- **keycloak**: Keycloak authentication server (port 8080)
- **server**: Sails.js backend server
- **client**: React development server
- **proxy**: Nginx reverse proxy (port 3000)
- **init-db**: One-time database initialization service

## 📚 Additional Resources

- [Planka Documentation](https://docs.planka.cloud/)
- [Sails.js Documentation](https://sailsjs.com/documentation)
- [React Documentation](https://react.dev/)
- [Keycloak Documentation](https://www.keycloak.org/documentation)

## 🤝 Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

For major changes, please open an issue first to discuss what you'd like to change.

## License 📝

This work is released under the AGPL-3.0 license.

## 📧 Contact

For questions or issues:

- **GitHub Issues**: Use the repository's issue tracker
- **Security Issues**: Please report security vulnerabilities privately

## Gov ❤️ open source

Projets is currently led by the French [ANCT](https://anct.gouv.fr/) for use in [La Suite territoriale](https://suiteterritoriale.anct.gouv.fr/).

We are welcoming new partners and contributors to join us in this effort! So please [get in touch](mailto:contact@suite.anct.gouv.fr) if you want to help!
