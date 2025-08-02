# Neighbors Gem API

A modern, scalable Node.js web server built with TypeScript, Express, Socket.IO, and MongoDB. This project provides a robust foundation for building real-time applications with comprehensive security, logging, and error handling.

## 🚀 Features

- **TypeScript**: Full TypeScript support with strict type checking
- **Express.js**: Fast, unopinionated web framework
- **Socket.IO**: Real-time bidirectional communication
- **MongoDB**: NoSQL database with Mongoose ODM
- **Security**: Helmet, rate limiting, CORS, input validation
- **Logging**: Structured logging with file rotation
- **Error Handling**: Comprehensive error handling system
- **Authentication**: JWT-based authentication
- **File Upload**: Multer with image processing
- **Testing**: Jest testing framework
- **Code Quality**: ESLint and Prettier configuration

## 📋 Prerequisites

- Node.js >= 18.0.0
- npm >= 8.0.0
- MongoDB (local or cloud instance)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd nodejs_web_server-main
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   NODE_ENV=development
   PORT=3500
   MONGO_URI=mongodb://localhost:27017/NeighborsGem
   ACCESS_TOKEN_SECRET=your_access_token_secret_here
   REFRESH_TOKEN_SECRET=your_refresh_token_secret_here
   CORS_ORIGIN=http://localhost:3000
   ```

4. **Build the project**
   ```bash
   npm run build
   ```

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm run build
npm start
```

### HTTPS Development Mode
```bash
npm run dev:https
```

## 📁 Project Structure

```
├── config/                 # Configuration files
│   ├── environment.ts     # Environment configuration
│   └── corsOptions.ts     # CORS configuration
├── controllers/           # Route controllers
│   ├── auth/             # Authentication controllers
│   ├── posts/            # Post controllers
│   └── ...
├── database/             # Database configuration
│   └── connection.ts     # Database connection manager
├── middleware/           # Express middleware
│   ├── security.ts       # Security middleware
│   ├── verifyJWT.ts      # JWT verification
│   └── ...
├── model/               # Mongoose models
│   ├── user.ts          # User model
│   ├── post.ts          # Post model
│   └── ...
├── routes/              # API routes
│   └── api/             # API route definitions
├── sockets/             # Socket.IO handlers
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
│   ├── errors.ts        # Error handling utilities
│   ├── logger.ts        # Logging system
│   ├── response.ts      # Response utilities
│   └── ...
├── uploads/             # File uploads directory
├── logs/                # Application logs
├── dist/                # Compiled JavaScript
├── server.ts            # Main server file
└── socket.ts            # Socket.IO configuration
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `3500` |
| `MONGO_URI` | MongoDB connection string | Required |
| `ACCESS_TOKEN_SECRET` | JWT access token secret | Required |
| `REFRESH_TOKEN_SECRET` | JWT refresh token secret | Required |
| `CORS_ORIGIN` | Allowed CORS origin | `http://localhost:3000` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | `900000` (15 min) |
| `RATE_LIMIT_MAX` | Rate limit max requests | `100` |
| `UPLOAD_MAX_SIZE` | Max upload size | `5242880` (5MB) |
| `LOG_LEVEL` | Logging level | `info` |

## 🔒 Security Features

- **Helmet**: Security headers
- **Rate Limiting**: Request rate limiting
- **CORS**: Cross-origin resource sharing
- **Input Validation**: Request validation with Joi
- **JWT Authentication**: Secure token-based authentication
- **Request Size Limiting**: Protection against large payloads
- **IP Filtering**: Optional IP-based access control

## 📊 API Endpoints

### Health Check
- `GET /health` - Server health status

### API Status
- `GET /api` - API status information

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Token refresh

### User Management
- `GET /api/me` - Get current user profile
- `PUT /api/me` - Update user profile

### Posts
- `GET /api/posts` - Get posts
- `POST /api/posts` - Create post
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post

### Chat
- `GET /api/chats` - Get user chats
- `POST /api/chats` - Create chat
- `GET /api/chats/:id/messages` - Get chat messages

## 🧪 Testing

### Run Tests
```bash
npm test
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

### Watch Mode
```bash
npm run test:watch
```

## 📝 Logging

The application uses a structured logging system with the following features:

- **Multiple Log Levels**: error, warn, info, debug
- **File Rotation**: Daily log files
- **Request Logging**: Automatic request/response logging
- **Error Tracking**: Detailed error logging with stack traces
- **Performance Monitoring**: Response time tracking

Log files are stored in the `logs/` directory with the following naming convention:
- `error-YYYY-MM-DD.log`
- `warn-YYYY-MM-DD.log`
- `info-YYYY-MM-DD.log`
- `debug-YYYY-MM-DD.log`

## 🔧 Development

### Code Quality

#### Linting
```bash
npm run lint
npm run lint:fix
```

#### Type Checking
```bash
npx tsc --noEmit
```

### Building

#### Development Build
```bash
npm run build:watch
```

#### Production Build
```bash
npm run build
```

## 🚀 Deployment

### Docker (Recommended)

1. **Build the image**
   ```bash
   docker build -t neighbors-gem-api .
   ```

2. **Run the container**
   ```bash
   docker run -p 3500:3500 --env-file .env neighbors-gem-api
   ```

### Manual Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Set environment variables**
   ```bash
   export NODE_ENV=production
   export PORT=3500
   # ... other environment variables
   ```

3. **Start the application**
   ```bash
   npm start
   ```

## 📈 Monitoring

### Health Check
The application provides a health check endpoint at `/health` that returns:
- Server status
- Database connection status
- Uptime information
- Environment details

### Metrics
- Request/response times
- Error rates
- Database connection status
- Memory usage

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the logs for debugging information

## 🔄 Changelog

### v1.0.0
- Initial release
- Complete refactoring with TypeScript
- Enhanced security features
- Improved error handling
- Structured logging system
- Comprehensive testing setup
