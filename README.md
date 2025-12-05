# Voice-Enabled Task Tracker

A modern task management application that allows users to create and organize tasks using natural voice input or traditional manual forms. The system intelligently parses voice commands to extract task details including title, priority, due dates, and status.

## Features

- Voice-enabled task creation with intelligent NLP parsing
- Drag-and-drop Kanban board with multiple columns
- Manual task creation with date/time pickers
- Automatic priority and due date extraction from speech
- Real-time task updates across the board
- Overdue task management
- Responsive design for all devices

---

## Prerequisites

- **Node.js**: v18.x or higher
- **PostgreSQL**: v12 or higher
- **npm**: v9.x or higher
- **AssemblyAI API Key**: Sign up at [AssemblyAI](https://www.assemblyai.com/) (Free tier: 100 hours/month)

---

## Project Setup

### 1. Clone Repository
```bash
git clone <your-repo-url>
cd task-tracker
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create `.env` file:
```env
PORT=3000
NODE_ENV=development

DB_USER=postgres
DB_HOST=localhost
DB_NAME=task_tracker
DB_PASSWORD=your_postgres_password
DB_PORT=5432

ASSEMBLYAI_API_KEY=your_assemblyai_api_key
```

Initialize database:
```bash
psql -U postgres
CREATE DATABASE task_tracker;
\q

npm run migrate
```

Start backend:
```bash
npm run dev
```

Backend runs on `http://localhost:3000`

### 3. Frontend Setup
```bash
cd frontend
npm install
```

Create `.env` file:
```env
VITE_API_BASE_URL=http://localhost:3000/api
```

Start frontend:
```bash
npm run dev
```

Frontend runs on `http://localhost:5173`

## Tech Stack

### Frontend
- **Framework**: React 18.2.0
- **Build Tool**: Vite 4.x
- **HTTP Client**: Axios 1.6.0
- **Animations**: Framer Motion
- **Icons**: React Icons
- **Styling**: Custom CSS

### Backend
- **Runtime**: Node.js 18.x
- **Framework**: Express 4.18.2
- **Database**: PostgreSQL 12+
- **Database Client**: node-postgres (pg) 8.11.3
- **File Upload**: Multer 1.4.5
- **Environment**: dotenv 16.3.1

### AI & NLP
- **Speech-to-Text**: AssemblyAI API
- **Date Parsing**: Chrono-node 2.7.0
- **Custom NLP**: Regex-based priority and status extraction

### Key Dependencies

**Frontend:**
```json
{
  "react": "^18.2.0",
  "axios": "^1.6.0",
  "framer-motion": "^10.x",
  "react-icons": "^4.x"
}
```

**Backend:**
```json
{
  "express": "^4.18.2",
  "pg": "^8.11.3",
  "chrono-node": "^2.7.0",
  "multer": "^1.4.5-lts.1"
}
```

---

## API Documentation

### Base URL
```
http://localhost:3000/api
```

### Task Endpoints

#### Get All Tasks
```
GET /tasks?sortBy=due_date&order=ASC
```

**Response (200):**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "id": 1,
      "title": "Review pull request",
      "status": "To Do",
      "priority": "High",
      "due_date": "2024-12-04T18:00:00.000Z"
    }
  ]
}
```

#### Create Task
```
POST /tasks
Content-Type: application/json
```

**Request:**
```json
{
  "title": "Complete documentation",
  "description": "Write API docs",
  "status": "To Do",
  "priority": "High",
  "dueDate": "2024-12-10T17:00:00.000Z"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "id": 15,
    "title": "Complete documentation",
    "status": "To Do",
    "priority": "High"
  }
}
```

#### Update Task
```
PUT /tasks/:id
```

**Request:**
```json
{
  "status": "In Progress",
  "priority": "Critical"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Task updated successfully"
}
```

#### Delete Task
```
DELETE /tasks/:id
```

**Response (200):**
```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```

#### Search Tasks
```
GET /tasks/search/query?q=pull request
```

#### Filter by Status
```
GET /tasks/filter/status/To Do
```
Valid statuses: `To Do`, `In Progress`, `Done`

#### Filter by Priority
```
GET /tasks/filter/priority/High
```
Valid priorities: `Low`, `Medium`, `High`, `Critical`

#### Get Upcoming Tasks
```
GET /tasks/upcoming?days=7
```

#### Get Overdue Tasks
```
GET /tasks/overdue
```

### Voice Processing Endpoints

#### Parse Text
```
POST /tasks/parse
```

**Request:**
```json
{
  "transcript": "Create a high priority task to review the pull request by tomorrow evening"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "original": "Create a high priority task...",
    "parsed": {
      "title": "Review the pull request",
      "priority": "High",
      "status": "To Do",
      "dueDate": "2024-12-04T18:00:00.000Z"
    }
  }
}
```

#### Transcribe Audio
```
POST /tasks/transcribe
Content-Type: multipart/form-data
```

**Form Data:**
- `audio`: Audio file (WAV, MP3, M4A, OGG, WEBM, FLAC)
- Max size: 25MB

#### Transcribe and Parse
```
POST /tasks/transcribe-parse
Content-Type: multipart/form-data
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "transcript": "Create a high priority task...",
    "parsed": {
      "title": "Review the pull request",
      "priority": "High",
      "dueDate": "2024-12-04T18:00:00.000Z"
    }
  }
}
```

### Common Error Responses

**400 Bad Request:**
```json
{
  "success": false,
  "message": "Title is required"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "Task not found"
}
```

**500 Server Error:**
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## Design Decisions & Assumptions

### Key Design Decisions

#### 1. Database Architecture
- Single `tasks` table with flat structure for MVP simplicity
- CHECK constraints for status and priority validation
- Automatic timestamps using database triggers
- Indexes on status, priority, and due_date for query performance

#### 2. API Design
- RESTful endpoints with standard HTTP methods
- Consistent response format: `{ success, message?, data }`
- Partial updates allowed on PUT endpoint
- No authentication (single-user MVP)

#### 3. Voice Processing
- Two-stage process: transcription then parsing
- AssemblyAI for speech-to-text accuracy
- 3-second polling for transcription status
- In-memory audio storage (multer memoryStorage)

#### 4. NLP Strategy
- Regex patterns for priority/status keywords
- Chrono-node library for date parsing
- Title extraction removes common prefixes and date references
- Default values (Medium priority, To Do status)

#### 5. Frontend Architecture
- Centralized API layer with axios interceptors
- Optimistic UI updates with rollback on failure
- Separate modal components for reusability
- Framer Motion for smooth drag-and-drop

#### 6. Kanban Logic
- Four columns: Backlog, To Do, In Progress, Done
- Overdue tasks automatically move to Backlog
- Drag-and-drop triggers immediate API updates
- Status mapping between DB and UI columns

### Assumptions

#### Business Logic
- Single-user application (no multi-tenancy)
- No task relationships (subtasks, dependencies)
- Free status transitions (no enforced workflow)
- Unlimited task storage

#### Voice Processing
- English language only
- Clear audio quality expected
- One task per voice recording
- Recordings under 60 seconds

#### Data Management
- Hard deletes (no trash/archive)
- No change history tracking
- Text-only content (no file attachments)
- Browser microphone permission granted

---

## AI Tools Usage

### Tools Used
- **Claude (Anthropic)**: Primary AI assistant for development

### What AI Helped With

**1. Initial Setup (25%)**
- Used as brain storming tool for finding transcriptor for voice to word conversion.
- Used for debugging while writing code for NLPParser service.

**2. Documentation**
- Structured API endpoint documentation
- Created comprehensive README sections
- Generated example requests/responses

**3. Debugging Support**
- Fixed object-to-string conversion in transcription ID

### Key Learnings

**What Worked Well:**
- Comprehensive documentation templates

**Development Approach:**
- Manually refined business logic and error handling
- Iteratively improved based on testing

---

## Troubleshooting

### Backend Won't Start
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Solution:** Start PostgreSQL
```bash
# macOS: brew services start postgresql
# Linux: sudo systemctl start postgresql
# Windows: net start postgresql-x64-14
```

### Migration Fails
```
Error: relation "tasks" already exists
```
**Solution:** Drop and recreate
```bash
psql -U postgres
DROP DATABASE task_tracker;
CREATE DATABASE task_tracker;
\q
npm run migrate
```

### Voice Recording Fails
**Solution:** Check browser microphone permissions
- Chrome: Settings → Privacy → Microphone
- Firefox: Preferences → Privacy → Microphone

### Transcription Error
**Solution:** Verify:
1. AssemblyAI API key in `.env`
2. Audio format (WAV, MP3, M4A, etc.)
3. File size < 25MB

**Built by Deepak Avadhani**
