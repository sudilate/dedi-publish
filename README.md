# DeDi - Decentralized Data Registry

<div align="center">

![DeDi Logo](public/favicon.ico)

**A modern web application for creating and managing decentralized data registries**

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

</div>

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Setup](#environment-setup)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Usage Guide](#usage-guide)
- [Authentication Flow](#authentication-flow)
- [Contributing](#contributing)
- [License](#license)

## 🌟 Overview

DeDi (Decentralized Data Registry) is a comprehensive web application that enables users to create, manage, and organize data in a decentralized manner. Users can create namespaces to organize their projects, define registries with custom schemas, and manage records within those registries.

**Turn your data into trusted, tamper-proof services in 3 clicks. From folders to revenue — DeDi makes your data speak for itself.**

## ✨ Features

### 🔐 Authentication & User Management
- **Secure Signup/Login** - Complete authentication flow with email verification
- **JWT Token Management** - Secure token-based authentication
- **User Profile Management** - Manage user information and preferences

### 🏢 Namespace Management
- **Create Namespaces** - Organize projects in dedicated namespaces
- **DNS Verification** - Generate and verify DNS TXT records
- **Namespace Updates** - Modify namespace details and metadata
- **Access Control** - Manage namespace permissions

### 📁 Registry Management
- **Custom Schemas** - Define data structures with multiple field types (string, integer, float, boolean)
- **Registry Operations** - Create, update, archive, restore, revoke, and reinstate registries
- **Bulk Operations** - Upload multiple files to create registries in bulk
- **Delegation System** - Share registry access with other users

### 📊 Record Management
- **Schema-Validated Records** - Add records that conform to registry schemas
- **Type-Safe Operations** - Automatic type conversion based on schema definitions
- **Record Operations** - Create, update, archive, restore, revoke, and reinstate records
- **Version Control** - Track record versions and changes
- **Metadata Support** - Add custom metadata to records

### 🚀 Advanced Features
- **Real-time Progress Tracking** - Live updates during bulk operations
- **Smart Type Conversion** - Automatic data type handling based on schemas
- **Responsive Design** - Mobile-friendly interface
- **Toast Notifications** - Rich feedback system with emojis and colors
- **Error Handling** - Comprehensive error management with API integration

## 🛠 Tech Stack

### Frontend
- **React 18** - Modern React with hooks and functional components
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and development server
- **React Router** - Client-side routing

### UI/UX
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality, accessible UI components
- **Lucide React** - Beautiful, customizable icons
- **Radix UI** - Low-level UI primitives

### State Management & Forms
- **React Hook Form** - Performant forms with validation
- **Zod** - TypeScript-first schema validation
- **Context API** - Global state management for authentication

### Development Tools
- **ESLint** - Code linting
- **TypeScript ESLint** - TypeScript-specific linting rules
- **PostCSS** - CSS processing
- **Autoprefixer** - Automatic vendor prefixing

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Git**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/dedi-publish.git
   cd dedi-publish
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   # Create .env file
   cp .env.example .env
   
   # Or run the setup script
   node setup-env.js
   ```

4. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   ```
   http://localhost:5173
   ```

## ⚙️ Environment Setup

Create a `.env` file in the root directory:

```env
VITE_ENDPOINT=https://dev.dedi.global
```

### Quick Setup Script

Run the automated setup:
```bash
node setup-env.js
```

## 📡 API Documentation

### Base URL
```
https://dev.dedi.global
```

### Authentication Endpoints

#### Signup
```http
POST /dedi/register
Content-Type: application/json

{
  "username": "your_username",
  "firstname": "Your First Name",
  "lastname": "Your Last Name",
  "email": "your.email@example.com",
  "password": "your_password"
}
```

**Success Response:**
```json
{
  "message": "Resource created successfully",
  "data": {
    "id": "user-id",
    "username": "your_username",
    "email": "your.email@example.com",
    "firstname": "Your First Name",
    "lastname": "Your Last Name",
    "email_verified": false,
    "realm_roles": ["default-roles-dhiway-test"]
  }
}
```

#### Login
```http
POST /dedi/login
Content-Type: application/json

{
  "email": "your.email@example.com",
  "password": "your_password"
}
```

**Success Response:**
```json
{
  "message": "Login successful",
  "data": {
    "access_token": "jwt-token",
    "token_type": "Bearer",
    "refresh_token": "refresh-token",
    "creator_id": "creator-id"
  }
}
```

### Data Management Endpoints

#### Namespaces
- `GET /dedi/{creator_id}/get-namepace-by-creator` - Get user namespaces
- `POST /dedi/create-namespace` - Create new namespace
- `POST /dedi/{namespace_id}/update-namespace` - Update namespace

#### Registries
- `GET /dedi/query/{namespace_id}` - Get registries in namespace
- `POST /dedi/{namespace_id}/create-registry` - Create new registry
- `POST /dedi/{namespace_id}/{registry_name}/update-registry` - Update registry
- `POST /dedi/{namespace_id}/{registry_name}/archive-registry` - Archive registry
- `POST /dedi/{namespace_id}/{registry_name}/restore-registry` - Restore registry

#### Records
- `GET /dedi/query/{namespace_id}/{registry_name}` - Get records in registry
- `POST /dedi/{namespace_id}/{registry_name}/add-record` - Add new record
- `GET /dedi/lookup/{namespace_id}/{registry_name}/{record_name}` - Get record details
- `POST /dedi/{namespace_id}/{registry_name}/{record_name}/update-record` - Update record

#### Bulk Operations
- `POST /dedi/upload` - Bulk upload files

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── auth/           # Authentication components
│   ├── layout/         # Layout components (Header, Footer)
│   └── ui/             # shadcn/ui components
├── hooks/              # Custom React hooks
├── lib/                # Utilities and configurations
│   ├── api.ts          # API client setup
│   ├── auth-context.tsx # Authentication context
│   └── utils.ts        # Utility functions
├── pages/              # Page components
│   ├── Dashboard.tsx   # Main dashboard
│   ├── Home.tsx        # Landing page
│   ├── Login.tsx       # Login page
│   ├── Signup.tsx      # Signup page
│   ├── NamespaceDetails.tsx # Namespace management
│   ├── Records.tsx     # Records listing
│   └── RecordDetails.tsx # Record details and editing
├── App.tsx             # Main App component
├── main.tsx            # Application entry point
└── index.css           # Global styles
```

## 📖 Usage Guide

### 1. **Getting Started**
- Create an account using the signup form
- Verify your email address
- Log in with your credentials

### 2. **Managing Namespaces**
- Create namespaces to organize your projects
- Generate DNS TXT records for verification
- Update namespace details and metadata

### 3. **Creating Registries**
- Define custom schemas with various field types
- Set up data validation rules
- Configure query permissions

### 4. **Managing Records**
- Add records that conform to your schema
- Update existing records with type validation
- Use bulk upload for large datasets

### 5. **Advanced Features**
- Delegate registry access to team members
- Archive/restore registries and records
- Track version history and changes

## 🔐 Authentication Flow

### Signup Process
1. **User Registration** → Account creation with email verification
2. **Email Verification** → User receives verification email
3. **Manual Login** → User logs in after verification
4. **Dashboard Access** → Redirect to main dashboard

### Login Process
1. **Credential Validation** → API validates user credentials
2. **Token Generation** → JWT tokens are issued
3. **Context Update** → User state is updated globally
4. **Dashboard Redirect** → Automatic navigation to dashboard

## 🎨 UI/UX Features

### Design System
- **Modern Interface** - Clean, professional design
- **Responsive Layout** - Mobile-first approach
- **Accessible Components** - WCAG compliant UI elements
- **Consistent Styling** - Unified design language

### User Experience
- **Loading States** - Visual feedback during operations
- **Error Handling** - Clear error messages and guidance
- **Toast Notifications** - Rich feedback with emojis
- **Progress Tracking** - Real-time operation updates

## 🧪 Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

### Code Quality

- **TypeScript** - Strict type checking enabled
- **ESLint** - Comprehensive linting rules
- **Prettier** - Code formatting (recommended)
- **Husky** - Pre-commit hooks (optional)

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add some amazing feature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Contribution Guidelines

- Follow the existing code style
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass
- Write clear commit messages

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. **Check the documentation** - Most common issues are covered here
2. **Search existing issues** - Someone might have already reported it
3. **Create a new issue** - Provide detailed information about the problem
4. **Join our community** - Connect with other developers

## 🙏 Acknowledgments

- [React](https://reactjs.org/) - The web framework used
- [TypeScript](https://www.typescriptlang.org/) - Language and type system
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [shadcn/ui](https://ui.shadcn.com/) - UI component library
- [Vite](https://vitejs.dev/) - Build tool and development server

---

<div align="center">

**Made with ❤️ by the DeDi Team**

[Website](https://dedi.global) • [Documentation](https://docs.dedi.global) • [API Reference](https://api.dedi.global/docs)

</div>
