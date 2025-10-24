# EPay Mobile App 💸

A professional React Native mobile application for EPay digital wallet system.

## 🚀 Features

- ✅ Professional authentication flow (Login & Registration)
- ✅ Role-based access (User & Agent)
- ✅ Redux Toolkit for state management
- ✅ React Navigation for routing
- ✅ TypeScript for type safety
- ✅ Form validation
- ✅ Secure token storage
- ✅ Beautiful, modern UI
- ✅ Industry-standard project structure

## 📦 Tech Stack

- **React Native CLI** - Mobile app framework
- **TypeScript** - Type safety
- **Redux Toolkit** - State management
- **React Navigation** - Navigation solution
- **Axios** - HTTP client
- **AsyncStorage** - Secure local storage
- **React Native Vector Icons** - Icon library
- **React Native Gesture Handler** - Gesture handling
- **React Native Safe Area Context** - Safe area handling

## 🛠️ Setup Instructions

### Prerequisites

- Node.js (>= 20)
- npm or yarn
- React Native development environment set up
  - For iOS: Xcode, CocoaPods
  - For Android: Android Studio, JDK

### Installation

1. **Clone and navigate to the project**
   ```bash
   cd EPay
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **iOS Setup (macOS only)**
   ```bash
   cd ios
   pod install
   cd ..
   ```

4. **Configure API endpoint** (Optional)
   - The app is already configured to use: `https://epay-backend.vercel.app/api/v1`
   - To change it, edit `src/constants/api.ts`

### Running the App

#### Android
```bash
npm run android
```

#### iOS (macOS only)
```bash
npm run ios
```

## 📁 Project Structure

```
EPay/
├── src/
│   ├── components/          # Reusable UI components
│   │   └── common/
│   │       ├── Button.tsx
│   │       └── Input.tsx
│   ├── constants/           # App constants and configurations
│   │   ├── api.ts          # API endpoints
│   │   └── colors.ts       # Color palette
│   ├── navigation/          # Navigation configuration
│   │   ├── AuthNavigator.tsx
│   │   ├── MainNavigator.tsx
│   │   └── RootNavigator.tsx
│   ├── screens/            # App screens
│   │   ├── auth/
│   │   │   ├── LoginScreen.tsx
│   │   │   └── RegisterScreen.tsx
│   │   └── main/
│   │       └── HomeScreen.tsx
│   ├── services/           # API services
│   │   ├── api.service.ts
│   │   └── auth.service.ts
│   ├── store/              # Redux store
│   │   ├── slices/
│   │   │   └── authSlice.ts
│   │   ├── hooks.ts
│   │   └── index.ts
│   ├── types/              # TypeScript types
│   │   └── auth.types.ts
│   └── utils/              # Utility functions
│       ├── storage.ts
│       └── validation.ts
├── android/                # Android native code
├── ios/                    # iOS native code
├── App.tsx                 # App entry point
└── package.json
```

## 🔐 Authentication Flow

### Login
- Email and password validation
- Secure token storage
- Auto-redirect to home on success
- Error handling with user-friendly messages

### Registration
- User/Agent role selection
- Full form validation (name, email, phone, password)
- Password confirmation
- Terms and conditions acknowledgment

## 🎨 Design System

### Colors
- **Primary**: `#6C63FF` - Modern purple
- **Secondary**: `#00D9FF` - Vibrant cyan
- **Success**: `#10B981` - Green
- **Error**: `#EF4444` - Red
- **Background**: `#F8F9FA` - Light gray

### Components
- **Button**: Multiple variants (primary, secondary, outline)
- **Input**: With icons, validation, password visibility toggle
- Consistent spacing and typography

## 📱 Screens

### Authentication
- **Login Screen**: Email/password login with Google OAuth option
- **Register Screen**: User/Agent registration with role selection

### Main App
- **Home Screen**: Dashboard (placeholder for wallet features)

## 🔄 State Management

Using Redux Toolkit with the following slices:
- **Auth Slice**: User authentication, login, register, logout

## 🌐 API Integration

Base URL: `https://epay-backend.vercel.app/api/v1`

### Endpoints Used
- `POST /auth/auth/login` - User login
- `POST /user/user/register` - User registration
- `POST /auth/auth/logout` - User logout
- `POST /auth/auth/refresh-token` - Token refresh

## 🚧 Next Steps

1. **Wallet Features**
   - View balance
   - Transaction history
   - Add money
   - Send money
   - Withdraw money

2. **Agent Features**
   - Cash-in operations
   - Cash-out operations
   - Commission tracking

3. **User Profile**
   - Edit profile
   - Change password
   - Manage settings

4. **Additional Features**
   - Push notifications
   - Biometric authentication
   - QR code scanning
   - Receipt generation

## 🐛 Troubleshooting

### Android Build Issues
```bash
cd android
./gradlew clean
cd ..
npm run android
```

### iOS Build Issues
```bash
cd ios
pod deintegrate
pod install
cd ..
npm run ios
```

### Clear Cache
```bash
npm start -- --reset-cache
```

## 📄 License

This project is part of the EPay digital wallet system.

## 🤝 Contributing

Follow the existing code structure and conventions when adding new features.

---

Built with ❤️ using React Native
