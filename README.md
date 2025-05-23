# Dedi - Publish for creating namespaces and registries

## Environment Setup

To set up the application, you need to configure the API endpoint:

1. Create a `.env` file in the root directory of the project
2. Add the following environment variable:

```
VITE_ENDPOINT=dev.dedi.global
```

## API Endpoints

### Signup
- **Endpoint**: `https://{VITE_ENDPOINT}/dedi/register`
- **Method**: POST
- **Body**:
```json
{
  "username": "your_username",
  "firstname": "Your First Name",
  "lastname": "Your Last Name", 
  "email": "your.email@example.com",
  "password": "your_password"
}
```

### Success Response
```json
{
    "message": "Resource created successfully",
    "data": {
        "id": "66078eba-3e07-4c64-b2dd-1558f3d01440",
        "username": "your_username",
        "email": "your.email@example.com",
        "firstname": "Your First Name",
        "lastname": "Your Last Name",
        "email_verified": false,
        "realm_roles": ["default-roles-dhiway-test"]
    }
}
```

### Error Response
```json
{
    "message": "Resource already exists",
    "data": "User exists with same username"
}
```

## Authentication Flow

### Signup Process
1. **User Registration**: User fills signup form and submits
2. **Account Creation**: API creates account (email_verified: false)
3. **Email Verification**: User receives verification email (15-second timer shown)
4. **Manual Login**: After verification, user manually logs in with credentials
5. **Dashboard Access**: Only after successful login, user is redirected to dashboard

### Login Process
1. **User Login**: User enters verified credentials
2. **Authentication**: API validates credentials
3. **Dashboard Redirect**: Successful login redirects to namespace dashboard

## Features

- ✅ User signup with API integration
- ✅ Email verification workflow
- ✅ Login functionality with API integration  
- ✅ Form validation with real-time feedback
- ✅ Enhanced toast notifications with emojis and colors
- ✅ Loading states with progress indicators
- ✅ Error handling with API error messages
- ✅ Success notifications with proper user flow
- ✅ Responsive design and modern UI

## Toast Notifications 🎉

The application now includes comprehensive toast notifications:

### Success Messages
- 🎉 **Signup Success**: "Account created successfully! Please check your email for verification."
- 🎉 **Login Success**: "Welcome back!"

### Error Messages  
- ❌ **API Errors**: Shows actual error messages from your API
- ❌ **Network Errors**: Clear feedback for connection issues

### Loading States
- ⏳ **Signup**: "Creating your account..."
- ⏳ **Login**: "Signing you in..."

## Getting Started

1. **Install dependencies**: `npm install`
2. **Set up environment**: Run `node setup-env.js` or manually create `.env` file
3. **Start development**: `npm run dev`

### Quick Environment Setup
```bash
# Run the setup script
node setup-env.js

# Or manually create .env file with:
echo "VITE_ENDPOINT=dev.dedi.global" > .env
```
