# Athena - Misinformation Detection Platform

Athena is an advanced platform designed to detect, analyze, and combat misinformation using state-of-the-art machine learning techniques and knowledge graphs.

## Features

- **Misinformation Detection**: Identify potentially false or misleading content
- **Source Verification**: Verify the credibility of information sources
- **Educational Content**: Access resources to improve media literacy
- **Real-time Analysis**: Get instant feedback on content authenticity
- **API Access**: Integrate Athena's capabilities into your applications

## Project Structure

```
.
├── backend/               # Python FastAPI backend
├── datasets/              # Sample datasets for training and testing
├── docs/                  # Documentation
├── gcp_integration/       # Google Cloud Platform integration
└── README.md              # This file
```

## Getting Started

### Prerequisites

- Python 3.8+
- Node.js 16+ (for frontend development)
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

2. **Environment Variables**
   Create a `.env` file in the backend directory:
   ```
   DATABASE_URL=sqlite:///./athena.db
   SECRET_KEY=your-secret-key
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   ```

3. **Run the Backend**
   ```bash
   cd backend
   uvicorn main:app --reload
   ```

4. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm start
   ```

## API Documentation

Once the backend is running, access the interactive API documentation at:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Testing

Run the test suite with:
```bash
cd backend
pytest
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

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with FastAPI and React Native
- Utilizes Google Cloud Platform services
- Inspired by the need for better misinformation detection tools
