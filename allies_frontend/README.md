# Allies Frontend - Modern Angular Application

A beautiful, modern Angular frontend for the Allies messaging and video calling platform.

## 🚀 Features

### ✨ Modern UI/UX
- **Beautiful Design**: Clean, modern interface with gradient backgrounds
- **Responsive Layout**: Works perfectly on desktop, tablet, and mobile
- **Material Icons**: Consistent iconography throughout the app
- **Smooth Animations**: Polished user experience with CSS transitions

### 🔐 Authentication
- **Secure Login**: JWT-based authentication
- **User Registration**: Easy signup process
- **Session Management**: Persistent login sessions
- **Protected Routes**: Secure navigation

### 💬 Real-time Messaging
- **WebSocket Integration**: Real-time message delivery
- **Chat Interface**: Modern chat UI with message bubbles
- **Message History**: Persistent message storage
- **Online Status**: User presence indicators
- **Search**: Find conversations quickly

### 📹 Video Calling
- **WebRTC Integration**: High-quality video calls
- **Call Controls**: Mute, video toggle, end call
- **Incoming Call UI**: Beautiful call notification interface
- **Call History**: Track your call sessions
- **Screen Sharing**: Share your screen during calls

### 🎨 Design System
- **Color Palette**: Consistent color scheme
- **Typography**: Inter font family for readability
- **Spacing**: Systematic spacing using CSS custom properties
- **Components**: Reusable UI components
- **Dark Mode Ready**: Prepared for dark theme implementation

## 🛠️ Technology Stack

- **Angular 20**: Latest Angular framework
- **TypeScript**: Type-safe development
- **RxJS**: Reactive programming
- **WebSocket**: Real-time communication
- **WebRTC**: Video calling functionality
- **CSS3**: Modern styling with custom properties
- **Material Icons**: Icon system

## 📦 Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Install Additional Dependencies**
   ```bash
   npm install sockjs-client stompjs @types/sockjs-client @types/stompjs
   ```

3. **Start Development Server**
   ```bash
   npm start
   ```

4. **Build for Production**
   ```bash
   npm run build
   ```

## 🏗️ Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── login/           # Authentication components
│   │   ├── chat/            # Messaging components
│   │   ├── video-call/     # Video calling components
│   │   └── dashboard/       # Main dashboard
│   ├── services/
│   │   ├── auth.service.ts      # Authentication service
│   │   ├── chat.service.ts      # Chat functionality
│   │   └── websocket.service.ts # WebSocket communication
│   ├── models/
│   │   ├── user.model.ts        # User data models
│   │   ├── chat.model.ts        # Chat data models
│   │   └── call.model.ts        # Call data models
│   ├── app.routes.ts         # Application routing
│   ├── app.config.ts         # App configuration
│   └── app.ts               # Main app component
├── styles.css               # Global styles
└── index.html              # Main HTML file
```

## 🎯 Key Components

### Authentication
- **LoginComponent**: User login with form validation
- **Signup Integration**: User registration flow
- **JWT Token Management**: Secure token handling

### Messaging
- **ChatComponent**: Main chat interface
- **Message Bubbles**: Styled message display
- **Real-time Updates**: WebSocket message delivery
- **Chat Rooms**: Conversation management

### Video Calling
- **VideoCallComponent**: Video call interface
- **Call Controls**: Mute, video toggle, end call
- **Incoming Call UI**: Call notification modal
- **WebRTC Integration**: Peer-to-peer video

### Dashboard
- **DashboardComponent**: Main application shell
- **Navigation**: Tab-based navigation
- **User Profile**: User information display
- **Notifications**: Real-time notifications

## 🎨 Design Features

### Color Scheme
- **Primary**: Indigo (#6366f1)
- **Secondary**: Light gray (#f1f5f9)
- **Success**: Green (#10b981)
- **Warning**: Amber (#f59e0b)
- **Error**: Red (#ef4444)

### Typography
- **Font Family**: Inter (Google Fonts)
- **Weights**: 300, 400, 500, 600, 700
- **Responsive**: Scales with screen size

### Layout
- **Grid System**: CSS Grid and Flexbox
- **Responsive**: Mobile-first design
- **Spacing**: Consistent spacing system
- **Shadows**: Subtle depth with CSS shadows

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:
```
API_URL=http://localhost:8080
WS_URL=ws://localhost:8080/ws
```

### Backend Integration
The frontend connects to the Spring Boot backend:
- **API Base URL**: `http://localhost:8080/api`
- **WebSocket URL**: `ws://localhost:8080/ws`
- **Authentication**: JWT tokens

## 🚀 Development

### Running the Application
```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test
```

### Code Structure
- **Components**: Standalone Angular components
- **Services**: Injectable services for data management
- **Models**: TypeScript interfaces for type safety
- **Routing**: Angular Router for navigation

## 📱 Responsive Design

The application is fully responsive and works on:
- **Desktop**: Full-featured experience
- **Tablet**: Optimized layout
- **Mobile**: Touch-friendly interface

## 🔒 Security Features

- **JWT Authentication**: Secure token-based auth
- **Route Guards**: Protected routes
- **Input Validation**: Form validation
- **XSS Protection**: Angular's built-in security

## 🎉 Getting Started

1. **Clone the repository**
2. **Install dependencies**: `npm install`
3. **Start the backend**: Follow backend README
4. **Start the frontend**: `npm start`
5. **Open browser**: Navigate to `http://localhost:4200`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

**Allies Frontend** - Modern, beautiful, and functional messaging and video calling platform built with Angular 20.