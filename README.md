# RAS-API

A Node.js/Express REST API for managing educational exams, supporting both Prelims and Mains examination formats with secure authentication and AWS S3 integration for file storage.

## Features

- **Authentication & Authorization**
  - Secure teacher and student signup/signin with JWT
  - Role-based access control
  - Protected routes with middleware authentication
  
- **Exam Management**
  - Support for both Prelims (MCQ-based) and Mains (file-based) examinations
  - Different exam types: Free, Paid
  - Test types: Sectional, Multi-sectional, Full-length
  - Automatic score tracking for Prelims exams
  - PDF submission and evaluation for Mains exams
  - Student engagement tracking with daily streaks

- **Syllabus Management**
  - Create, read, update and delete syllabus content
  - Teacher-specific syllabus management
  - Content validation and sanitization
  - Secure access control
  
- **File Handling**
  - AWS S3 integration for storing Mains exam documents
  - Secure file upload with type validation
  - Automatic file naming and organization
  
- **Data Validation & Security**
  - Request validation using Zod schemas
  - Password hashing with bcrypt
  - Input sanitization
  - File type and size validation
  
- **Database**
  - Prisma ORM with structured data models
  - PostgreSQL database
  - Efficient query optimization

## Prerequisites

- Node.js (v14 or higher)
- AWS Account with S3 bucket access
- PostgreSQL database
- npm or yarn package manager

## Setup Instructions

1. Clone the repository:```bash
git clone https://github.com/yourusername/ras-api.git
cd ras-api
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```env
PORT=3000
JWT_SECRET=your_jwt_secret
AWS_REGION=your_aws_region
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_BUCKET_NAME=your_bucket_name
DATABASE_URL="postgresql://username:password@localhost:5432/dbname"
```

4. Run Prisma migrations:
```bash
npx prisma migrate dev
```

5. Start the server:
```bash
npm run dev
```

## API Endpoints

### Authentication

#### Teacher Routes

| Method | Endpoint           | Description                | Access  |
|--------|-------------------|----------------------------|---------|
| POST   | `/api/teacher/signup` | Register new teacher      | Public  |
| POST   | `/api/teacher/signin` | Teacher login            | Public  |
| GET    | `/api/teacher/profile` | Get teacher profile      | Private |

#### Student Routes

| Method | Endpoint           | Description                | Access  |
|--------|-------------------|----------------------------|---------|
| POST   | `/api/student/signup` | Register new student      | Public  |
| POST   | `/api/student/signin` | Student login            | Public  |
| GET    | `/api/student/profile` | Get student profile      | Private |

### Exam Management

#### Prelims Exam Routes

| Method | Endpoint           | Description                | Access  |
|--------|-------------------|----------------------------|---------|
| POST   | `/api/exam/prelims` | Create new prelims exam   | Private (Teacher) |
| GET    | `/api/exam/prelims` | Get all prelims exams     | Private (Teacher) |
| GET    | `/api/exam/prelims/:id` | Get prelims exam by ID   | Private (Teacher) |
| DELETE | `/api/exam/prelims/:id` | Delete prelims exam      | Private (Teacher) |
| GET    | `/api/exam/prelims/free` | Get all free prelims exams | Public |
| POST   | `/api/exam/prelims/attempt` | Submit exam attempt score | Private (Student) |
| GET    | `/api/exam/prelims/scores` | Get student's exam scores | Private (Student) |

#### Mains Exam Routes

| Method | Endpoint           | Description                | Access  |
|--------|-------------------|----------------------------|---------|
| POST   | `/api/exam/mains` | Create new mains exam     | Private (Teacher) |
| GET    | `/api/exam/mains` | Get all mains exams       | Private (Teacher) |
| GET    | `/api/exam/mains/:id` | Get mains exam by ID     | Private (Teacher) |
| DELETE | `/api/exam/mains/:id` | Delete mains exam        | Private (Teacher) |
| POST   | `/api/exam/mains/attempt` | Submit exam attempt     | Private (Student) |
| GET    | `/api/exam/mains/attempts` | Get student's attempts  | Private (Student) |
| GET    | `/api/exam/mains/pending-attempts` | Get pending evaluations | Private (Teacher) |
| POST   | `/api/exam/mains/evaluate` | Evaluate student attempt | Private (Teacher) |

#### Student Streak Routes

| Method | Endpoint           | Description                | Access  |
|--------|-------------------|----------------------------|---------|
| POST   | `/api/exam/streak/update` | Update student's daily streak | Private (Student) |
| GET    | `/api/exam/streak` | Get student's current streak | Private (Student) |

### Syllabus Management

| Method | Endpoint           | Description                | Access  |
|--------|-------------------|----------------------------|---------|
| POST   | `/api/syllabus` | Create new syllabus       | Private (Teacher) |
| GET    | `/api/syllabus` | Get all syllabuses        | Private (Teacher) |
| GET    | `/api/syllabus/:id` | Get syllabus by ID       | Private (Teacher) |
| GET    | `/api/syllabus/teacher/:teacherId` | Get syllabuses by teacher ID | Private (Teacher) |
| PUT    | `/api/syllabus/:id` | Update syllabus          | Private (Teacher) |
| DELETE | `/api/syllabus/:id` | Delete syllabus          | Private (Teacher) |

### Request & Response Examples

#### Submit Prelims Score
```http
POST /api/exam/prelims/attempt
Content-Type: application/json
Authorization: Bearer <token>

{
  "examId": "exam-uuid",
  "score": 85,
  "accuracy": 0.85,
  "attempts": 1
}
```

Response:
```json
{
  "message": "Score submitted successfully",
  "attempt": {
    "id": "attempt-uuid",
    "examId": "exam-uuid",
    "studentId": "student-uuid",
    "score": 85,
    "accuracy": 0.85,
    "attempts": 1,
    "attemptDate": "2024-01-01T12:00:00Z"
  }
}
```

#### Get Student Streak
```http
GET /api/exam/streak
Authorization: Bearer <token>
```

Response:
```json
{
  "streak": {
    "id": "streak-uuid",
    "studentId": "student-uuid",
    "streakCount": 5,
    "lastVisit": "2024-01-01T12:00:00Z"
  }
}
```

#### Submit Mains Attempt
```http
POST /api/exam/mains/attempt
Content-Type: multipart/form-data
Authorization: Bearer <token>

file: <PDF file>
examId: "exam-uuid"
```

Response:
```json
{
  "message": "Mains exam attempt submitted successfully",
  "attempt": {
    "id": "attempt-uuid",
    "examId": "exam-uuid",
    "studentId": "student-uuid",
    "answerSheetUrl": "https://rasdb.s3.ap-south-1.amazonaws.com/mains-attempts/answer.pdf",
    "score": 0,
    "feedback": "",
    "attemptDate": "2024-01-01T12:00:00Z"
  }
}
```

#### Get Teacher's Pending Evaluations
```http
GET /api/exam/mains/pending-attempts
Authorization: Bearer <token>
```

Response:
```json
{
  "attempts": [
    {
      "id": "attempt-uuid",
      "answerSheetUrl": "https://rasdb.s3.ap-south-1.amazonaws.com/mains-attempts/answer.pdf",
      "score": 0,
      "feedback": "",
      "attemptDate": "2024-01-01T12:00:00Z",
      "student": {
        "name": "John Doe",
        "email": "john@example.com"
      },
      "exam": {
        "title": "Advanced Economics",
        "totalMarks": 100
      }
    }
  ]
}
```

#### Evaluate Mains Attempt
```http
POST /api/exam/mains/evaluate
Content-Type: multipart/form-data
Authorization: Bearer <token>

file: <PDF file with evaluation> (optional)
attemptId: "attempt-uuid"
score: 85
```

Response:
```json
{
  "message": "Attempt evaluated successfully",
  "attempt": {
    "id": "attempt-uuid",
    "answerSheetUrl": "https://rasdb.s3.ap-south-1.amazonaws.com/mains-attempts/evaluated.pdf",
    "score": 85,
    "feedback": "Evaluated",
    "attemptDate": "2024-01-01T12:00:00Z",
    "student": {
      "name": "John Doe",
      "email": "john@example.com"
    },
    "exam": {
      "title": "Advanced Economics",
      "totalMarks": 100
    }
  }
}
```

#### Get Student's Mains Attempts
```http
GET /api/exam/mains/attempts
Authorization: Bearer <token>
```

Response:
```json
{
  "attempts": [
    {
      "id": "attempt-uuid",
      "answerSheetUrl": "https://rasdb.s3.ap-south-1.amazonaws.com/mains-attempts/evaluated.pdf",
      "score": 85,
      "feedback": "Evaluated",
      "attemptDate": "2024-01-01T12:00:00Z",
      "exam": {
        "title": "Advanced Economics",
        "totalMarks": 100
      }
    }
  ]
}
```

### Streak Calculation Logic

The streak system works as follows:
- Increments streak if last visit was yesterday
- Resets to 1 if more than a day has passed since last visit
- Maintains current streak if visited on the same day
- Initializes streak at 1 for first-time users


## Request & Response Examples

### Authentication

#### Teacher Signup
```http
POST /api/teacher/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secure_password",
  "phoneNumber": "1234567890"
}
```

Response:
```json
{
  "message": "Teacher registered successfully",
  "teacher": {
    "id": "clh2x3y4z5",
    "name": "John Doe",
    "email": "john@example.com",
    "phoneNumber": "1234567890"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Exam Management

#### Create Prelims Exam
```http
POST /api/exam/prelims
Content-Type: application/json
Authorization: Bearer <token>

{
  "title": "General Knowledge Test",
  "type": "Free",
  "testType": "SECTIONAL",
  "duration": 120,
  "totalMarks": 100,
  "questionData": [
    {
      "question": "What is the capital of France?",
      "answers": ["London", "Paris", "Berlin", "Madrid"],
      "image": "optional_base64_image"
    }
  ],
  "answerKeyData": [
    {
      "correctAnswerIndex": 1,
      "reason": "Paris is the capital of France"
    }
  ],
  "subjects": {
    "subject": "General Knowledge",
    "subtopics": ["Geography", "Capitals"]
  }
}
```

#### Create Mains Exam
```http
POST /api/exam/mains
Content-Type: multipart/form-data
Authorization: Bearer <token>

file: <PDF/PPT file>
title: "Advanced Economics"
type: "Paid"
duration: 180
totalMarks: 100
```

## File Upload Specifications

### Supported File Types
- PDF (`application/pdf`)
- PowerPoint (`.ppt`, `.pptx`)
  - `application/vnd.ms-powerpoint`
  - `application/vnd.openxmlformats-officedocument.presentationml.presentation`

### File Size Limits
- Maximum file size: 10MB
- Minimum file size: 1KB

## Security Features

- **Authentication**
  - JWT-based token authentication
  - Token expiration and refresh mechanism
  - Role-based authorization
  
- **Password Security**
  - bcrypt password hashing
  - Minimum password strength requirements
  - Secure password reset flow
  
- **Request Validation**
  - Zod schema validation
  - Input sanitization
  - File type verification
  
- **Route Protection**
  - Role-based middleware
  - Token verification
  - Rate limiting

## Error Handling

The API implements comprehensive error handling with appropriate HTTP status codes:

### HTTP Status Codes
- 200: Success
- 201: Resource created
- 400: Bad request / Validation error
- 401: Unauthorized / Invalid credentials
- 403: Forbidden / Insufficient permissions
- 404: Resource not found
- 429: Too many requests
- 500: Internal server error

### Error Response Format
```json
{
  "error": "Error message",
  "details": ["Additional error details if any"]
}
```
