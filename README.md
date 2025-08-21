# Athena - Misinformation Detection Platform

Athena is an advanced platform designed to detect, analyze, and combat misinformation using state-of-the-art machine learning techniques and knowledge graphs.

## Features

- **Misinformation Detection**: Identify potentially false or misleading content using ML models
- **Source Verification**: Verify the credibility of information sources with knowledge graphs
- **Educational Content**: Access resources to improve media literacy and critical thinking
- **Real-time Analysis**: Get instant feedback on content authenticity via API
- **Cross-platform Mobile App**: React Native app for iOS, Android, and web
- **RESTful API**: FastAPI backend with comprehensive endpoints

## Project Structure

```
.
├── backend/               # Python FastAPI backend
│   ├── main.py           # FastAPI application entry point
│   ├── requirements.txt   # Python dependencies
│   └── src/
│       ├── api/          # API route handlers
│       │   ├── misinformation.py  # Misinformation analysis endpoints
│       │   └── education.py       # Educational content endpoints
│       ├── models/       # ML models and data models
│       └── utils/        # Utility functions
├── datasets/              # Sample datasets for training and testing
├── docs/                  # Documentation
├── frontend/              # React Native mobile application
│   ├── app/              # Expo Router screens and navigation
│   │   ├── (tabs)/       # Tab-based navigation
│   │   │   ├── index.tsx # Home screen
│   │   │   ├── analyze.tsx # Text analysis screen
│   │   │   ├── learn.tsx # Educational content screen
│   │   │   └── explore.tsx # Explore features screen
│   │   └── content/      # Content detail screens
│   ├── components/       # Reusable UI components
│   ├── services/         # API client and services
│   └── package.json      # Node.js dependencies
├── gcp_integration/       # Google Cloud Platform integration
└── README.md              # This file
```

## Getting Started

### Prerequisites

- Python 3.8+
- Node.js 18+ and npm
- Expo CLI (`npm install -g @expo/cli`)
- Google Cloud SDK (for GCP integration)
- Docker (optional, for containerization)

### Installation

1. **Backend Setup**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

2. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   ```

3. **Environment Variables**
   Set the API base URL for the frontend:
   ```bash
   # Windows PowerShell
   $env:EXPO_PUBLIC_API_BASE_URL="http://localhost:8000"
   
   # Windows Command Prompt
   set EXPO_PUBLIC_API_BASE_URL=http://localhost:8000
   
   # macOS/Linux
   export EXPO_PUBLIC_API_BASE_URL=http://localhost:8000
   ```

4. **Run the Backend**
   ```bash
   cd backend
   python main.py
   ```
   The backend will start on http://localhost:8000

5. **Run the Frontend**
   ```bash
   cd frontend
   npm start
   ```
   This will open the Expo development server. You can:
   - Press `w` to open in web browser
   - Scan QR code with Expo Go app on mobile
   - Press `a` for Android emulator
   - Press `i` for iOS simulator

## API Endpoints

### Misinformation Analysis
- `POST /api/misinformation/analyze` - Analyze text for misinformation
  - Request: `{ "text": "string", "context": {} }`
  - Response: `{ "is_misinformation": boolean, "confidence": number, "explanation": "string", "sources": [] }`

### Educational Content
- `GET /api/education/content` - List educational content with optional filters
  - Query params: `category`, `difficulty`, `tags`
- `GET /api/education/content/{id}` - Get specific educational content by ID

## Frontend Features

### Screens
- **Home**: Welcome screen with app overview
- **Analyze**: Submit text for misinformation analysis
  - Large text input area
  - Real-time analysis results
  - Confidence scores and explanations
- **Learn**: Browse educational content
  - Filter by category and difficulty
  - Content cards with metadata
  - Detail view for each piece of content
- **Explore**: Discover app features and documentation

### Components
- **ResultCard**: Displays analysis results with color coding
- **ContentCard**: Shows educational content summaries
- **Loading**: Centered loading spinner

## API Documentation

Once the backend is running, access the interactive API documentation at:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Testing

Run the test suite with:
```bash
# Backend tests
cd backend
pytest

# Frontend tests (if configured)
cd frontend
npm test
```

## Deployment

### Docker

Build and run with Docker:
```bash
docker-compose up --build
```

### Google Cloud Platform

1. Set up a Google Cloud project and enable required APIs
2. Configure service account credentials
3. Deploy using Cloud Run:
   ```bash
   gcloud run deploy athena-backend --source .
   ```

### Frontend Deployment

Build the production app:
```bash
cd frontend
npm run build
```

For mobile app stores:
```bash
expo build:android  # Android APK
expo build:ios      # iOS build
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with FastAPI and React Native (Expo)
- Utilizes Google Cloud Platform services
- Inspired by the need for better misinformation detection tools
