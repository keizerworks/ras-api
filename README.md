# RAS-API

A Node.js/Express REST API for managing educational exams, supporting both Prelims and Mains examination formats with secure teacher authentication and AWS S3 integration for file storage.

## Features

- **Authentication & Authorization**: Secure teacher signup/signin with JWT
- **Exam Management**: Support for both Prelims (MCQ-based) and Mains (file-based) examinations
- **File Handling**: AWS S3 integration for storing Mains exam documents
- **Data Validation**: Request validation using Zod schemas
- **Database**: Prisma ORM with structured data models
- **Security**: Password hashing with bcrypt, protected routes

## Prerequisites

- Node.js (v14 or higher)
- AWS Account with S3 bucket access
- PostgreSQL database
- npm or yarn package manager

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
PORT=3000
JWT_SECRET=your_jwt_secret
AWS_REGION=your_aws_region
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_BUCKET_NAME=your_bucket_name
DATABASE_URL=your_database_url
```

## API Endpoints

### Teacher Authentication

| Method | Endpoint           | Description                | Access  |
|--------|-------------------|----------------------------|---------|
| POST   | `/api/teacher/signup` | Register new teacher      | Public  |
| POST   | `/api/teacher/signin` | Teacher login            | Public  |
| GET    | `/api/teacher/profile` | Get teacher profile      | Private |

### Prelims Exam Management

| Method | Endpoint           | Description                | Access  |
|--------|-------------------|----------------------------|---------|
| POST   | `/api/exam/prelims` | Create new prelims exam   | Private |
| GET    | `/api/exam/prelims` | Get all prelims exams     | Private |
| GET    | `/api/exam/prelims/:id` | Get prelims exam by ID   | Private |
| DELETE | `/api/exam/prelims/:id` | Delete prelims exam      | Private |

### Mains Exam Management

| Method | Endpoint           | Description                | Access  |
|--------|-------------------|----------------------------|---------|
| POST   | `/api/exam/mains` | Create new mains exam     | Private |
| GET    | `/api/exam/mains` | Get all mains exams       | Private |
| GET    | `/api/exam/mains/:id` | Get mains exam by ID     | Private |
| DELETE | `/api/exam/mains/:id` | Delete mains exam        | Private |

## Request & Response Examples

### Teacher Signup

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

### Create Prelims Exam

```http
POST /api/exam/prelims
Content-Type: application/json
Authorization: Bearer <token>

{
  "title": "Sample Prelims Exam",
  "type": "Free",
  "duration": 120,
  "totalMarks": 100,
  "questionData": [
    {
      "question": "Sample question?",
      "answers": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "image": "optional_base64_image"
    }
  ]
}
```

### Create Mains Exam

```http
POST /api/exam/mains
Content-Type: multipart/form-data
Authorization: Bearer <token>

file: <PDF/PPT file>
title: "Sample Mains Exam"
type: "Paid"
duration: 180
totalMarks: 100
```

## File Upload Specifications

### Supported File Types
- PDF (application/pdf)
- PowerPoint (.ppt, .pptx)

### File Size Limits
- Maximum file size: 10MB

## Security Features

- JWT-based authentication
- Password hashing using bcrypt
- Protected routes with middleware
- File type validation
- Request data validation using Zod schemas

## Error Handling

The API implements comprehensive error handling for:
- Validation errors (400)
- Authentication errors (401)
- Authorization errors (403)
- Not found errors (404)
- Server errors (500)
