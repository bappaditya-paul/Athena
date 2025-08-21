# Athena API Reference

## Base URL
```
https://api.athena.example.com/v1
```

## Authentication
All API requests require an API key in the `Authorization` header:
```
Authorization: Bearer YOUR_API_KEY
```

## Endpoints

### 1. Authentication

#### Login
```
POST /auth/login
```
**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "access_token": "jwt_token_here",
  "token_type": "bearer",
  "expires_in": 3600
}
```

### 2. Content Analysis

#### Analyze Text
```
POST /analyze/text
```

**Request Body:**
```json
{
  "text": "Sample text to analyze for misinformation",
  "language": "en",
  "include_sources": true
}
```

**Response:**
```json
{
  "id": "analysis_123",
  "is_misinformation": false,
  "confidence": 0.87,
  "explanation": "The content appears to be factual based on our analysis.",
  "sources": [
    {
      "title": "Trusted Source 1",
      "url": "https://trusted.source/1",
      "reliability_score": 0.95
    }
  ],
  "created_at": "2023-01-15T12:00:00Z"
}
```

### 3. Educational Content

#### Get All Content
```
GET /education/content
```

**Query Parameters:**
- `category`: Filter by category (optional)
- `difficulty`: Filter by difficulty level (beginner, intermediate, advanced)
- `limit`: Number of items to return (default: 10)
- `offset`: Pagination offset (default: 0)

**Response:**
```json
{
  "items": [
    {
      "id": "edu_123",
      "title": "Understanding Misinformation",
      "description": "Learn how to identify and combat misinformation.",
      "category": "basics",
      "difficulty": "beginner",
      "duration_minutes": 10,
      "tags": ["misinformation", "media-literacy"]
    }
  ],
  "total": 1,
  "limit": 10,
  "offset": 0
}
```

### 4. User Submissions

#### Submit Content for Analysis
```
POST /submissions
```

**Request Body:**
```json
{
  "content": "Text content to analyze",
  "content_type": "text/plain",
  "context": {
    "url": "https://source.url",
    "author": "Author Name"
  }
}
```

**Response:**
```json
{
  "submission_id": "sub_123",
  "status": "pending",
  "estimated_completion_time": 30,
  "check_url": "/submissions/sub_123/status"
}
```

## Error Responses

### 400 Bad Request
```json
{
  "error": "invalid_request",
  "error_description": "The request is missing required parameters"
}
```

### 401 Unauthorized
```json
{
  "error": "invalid_token",
  "error_description": "The access token is invalid or has expired"
}
```

### 500 Internal Server Error
```json
{
  "error": "server_error",
  "error_description": "An unexpected error occurred"
}
```

## Rate Limiting
- 100 requests per minute per API key
- 1000 requests per day per user (authenticated)

## Webhooks

### Events
- `analysis.completed`: Triggered when content analysis is complete
- `verification.failed`: Triggered when content fails verification

### Payload Example
```json
{
  "event": "analysis.completed",
  "data": {
    "submission_id": "sub_123",
    "status": "completed",
    "result": {
      "is_misinformation": true,
      "confidence": 0.92,
      "explanation": "Content contains known misinformation patterns."
    },
    "timestamp": "2023-01-15T12:05:00Z"
  }
}
```
