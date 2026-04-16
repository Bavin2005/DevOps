# Mini Enterprise Portal – Project Summary

## Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| **Node.js** | Runtime |
| **Express 5** | Web framework, REST API |
| **MongoDB** | Database |
| **Mongoose** | ODM for MongoDB |
| **JWT (jsonwebtoken)** | Authentication tokens |
| **bcryptjs** | Password hashing |
| **cors** | Cross-origin requests |
| **dotenv** | Environment variables |
| **OpenAI** | AI chatbot (optional, with API key) |

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 18** | UI library |
| **Vite 6** | Build tool, dev server |
| **React Router DOM 7** | Client-side routing |
| **Axios** | HTTP client for API calls |
| **Tailwind CSS** | Styling (utility-first) |
| **Framer Motion** | Animations / transitions |
| **React Hot Toast** | Toast notifications |

### Database
| Technology | Purpose |
|------------|---------|
| **MongoDB** | Primary data store (e.g. `mongodb://127.0.0.1:27017/mini_enterprise_portal`) |
| **Mongoose** | Schemas, validation, queries |

---

## Backend Features

### Authentication & Users
- **Register** – Company email only (`@company.com`), password, role (Employee / IT / Admin), department
- **Login** – JWT issued; role-based access
- **Protected routes** – `protect` middleware validates JWT
- **User management** – List users, profile, leave balance

### Core Modules (API Routes)
| Route | Features |
|-------|----------|
| `/api/auth` | Register, Login |
| `/api/tickets` | CRUD tickets, assign (IT/Admin), SLA, status (Open → Closed) |
| `/api/leaves` | Apply leave, approve/reject (Admin), balance |
| `/api/announcements` | Create, list, pin, filter by department |
| `/api/notifications` | List, mark read; created for ticket/leave/chat events |
| `/api/users` | Directory, profile, list (Admin) |
| `/api/chat` | Employee-to-employee messages, conversations, read receipts |
| `/api/ai` | Portal chatbot (RAG + optional OpenAI) |
| `/api/knowledge-base` | CRUD KB articles (IT), categories (Network, Software, Hardware, Other) |
| `/api/policies` | CRUD policies, categories (HR, IT, Finance, Security, General) |
| `/api/events` | CRUD events, calendar (meetings, holidays, team events) |
| `/api/meeting-rooms` | CRUD rooms, capacity, amenities, room bookings |
| `/api/cafeteria` | Daily menu, items, veg/non-veg, price |
| `/api/transport` | Shuttle routes, pickup points, timings; cab booking (book, view, confirm/cancel) |
| `/api/emergency-contacts` | Security, HR, IT, Medical contacts |
| `/api/upcoming` | Upcoming features, updates, maintenance |
| `/api/company-info` | Key-value company info |
| `/api/analytics` | Dashboard stats (tickets, leaves, etc.) for Admin |

### Backend Models (MongoDB Collections)
- **User** – name, email, password, role, department, leaveBalance, birthDate, joiningDate  
- **Ticket** – title, description, category, priority, status, createdBy, assignedTo, SLA  
- **Leave** – userId, type, startDate, endDate, reason, status, approvedBy  
- **Announcement** – title, content, createdBy, pinned, department  
- **Message** – sender, receiver, content, readAt (employee chat)  
- **Notification** – user, message, type (INFO, WARNING, SLA, CHAT), isRead  
- **KnowledgeBase** – title, category, keywords, solution, createdBy  
- **Policy** – title, content, category, createdBy  
- **Event** – title, description, startDate, endDate, type, location, createdBy  
- **MeetingRoom** – name, capacity, floor, amenities  
- **RoomBooking** – room, user, start, end  
- **CafeteriaMenu** – date, items (name, type, price)  
- **TransportRoute** – name, pickupPoints, timings  
- **CabBooking** – user, pickupLocation, dropLocation, pickupDate, pickupTime, cabType, passengerCount, purpose, status (Pending/Confirmed/Completed/Cancelled), driverName, driverPhone, cabNumber, notes, confirmedBy, confirmedAt  
- **EmergencyContact** – name, role, phone, email  
- **Upcoming** – title, description, category, targetDate, status  
- **CompanyInfo** – key, value  
- **AuditLog** – (optional) audit trail  

---

## Frontend Features

### Layout & Navigation
- **Layout** – Sidebar (role-based menu), topbar (search, notifications, user)
- **Theme** – Dark / light mode
- **Routing** – Role-based (Employee, IT, Admin); Unauthorized page for wrong role

### Pages by Role
- **Employee** – Dashboard, My Tickets, Create Ticket, My Leaves, Apply Leave, Announcements, Directory, Calendar, Policies, Knowledge Base, Meeting Rooms, Cafeteria, Transport, Emergency Contacts, Chat, What’s New (Upcoming)
- **IT** – IT Dashboard, ticket assignment, Knowledge Base management, ticket resolution, cab booking management
- **Admin** – Admin Dashboard, Analytics, ticket/leave oversight, announcements, policies, approvals, cab booking management

### Auth & UX
- **Login / Register** – Company email only, JWT stored (e.g. localStorage), redirect by role
- **Toasts** – Success/error feedback (react-hot-toast)
- **Animations** – Page transitions (Framer Motion)
- **Portal Assistant** – Floating chatbot widget on all pages

### Key Frontend Behaviour
- API base URL via Vite proxy: `/api` → `http://localhost:5000`
- Auth: token sent in `Authorization: Bearer <token>`
- Notifications: bell icon, dropdown, mark as read
- Chat: conversation list, messages, new chat from directory; receiver gets notification

---

## Database Usage

- **MongoDB** – Single database: `mini_enterprise_portal`
- **Collections** – One per model (users, tickets, leaves, announcements, messages, notifications, knowledgebases, policies, events, meetingrooms, roombookings, cafeteriamenus, transportroutes, emergencycontacts, upcomings, companyinfos, auditlogs, etc.)
- **Relations** – References via `ObjectId` (e.g. `createdBy`, `assignedTo`, `user`, `sender`, `receiver`)
- **Seeding** – `backend/seedAll.js` clears and seeds users (@company.com), tickets, leaves, announcements, policies, KB, rooms, cafeteria, transport, emergency contacts, events, upcoming

---

## How the Chatbot Works

### Purpose
Portal-only assistant: tickets, leave, announcements, directory, knowledge base, company policies, meeting rooms, cafeteria, transport (shuttle routes + cab booking), calendar, navigation. Non-portal questions are politely redirected.

### Flow

1. **User** – Types a message in the Portal Assistant widget (floating button → slide-out panel).
2. **Frontend** – `AIChatWidget.jsx` sends `POST /api/ai/chat` with `{ message }` and JWT.
3. **Backend** – `aiRoutes.js`:
   - Validates `message` and uses `protect` middleware.
   - **If no `OPENAI_API_KEY`:**  
     Uses **fallback**: keyword-based rules (ticket, leave, announcement, directory, policy, meeting room, cafeteria, transport, calendar, emergency, hello, etc.) and returns a fixed, portal-focused reply.
   - **If `OPENAI_API_KEY` is set:**
     - **RAG (Retrieval):** `buildRAGContext(message)`:
       - Fetches all Knowledge Base articles and Policies.
       - Scores them by keyword overlap (title, keywords/solution or content).
       - Takes top KB articles and top policies, builds two text blocks (kbContext, policyContext).
     - **Prompt:** System prompt = portal-only instructions + kbContext + policyContext. User message = current question.
     - **LLM:** Calls OpenAI `gpt-3.5-turbo` with that system + user message; `max_tokens: 400`, `temperature: 0.6`.
     - **Response:** Returns `{ reply, source: "openai" }`. On API error, falls back to same keyword-based reply.
4. **Frontend** – Appends assistant reply to the chat UI; user sees answer in the widget.

### Summary
- **With API key:** RAG (Knowledge Base + Policies) + GPT-3.5-turbo, portal-only answers.  
- **Without API key:** Keyword fallback only; no external API.  
- **Scope:** Portal and company only; other questions get a short redirect message.

---

## Running the Project

1. **MongoDB** – Run locally (e.g. port 27017).
2. **Backend** – `cd backend && node server.js` (port 5000). Optional: create `backend/.env` with `OPENAI_API_KEY` for AI chatbot.
3. **Frontend** – `cd frontend && npm run dev` (port 3000). Proxies `/api` to backend.
4. **Seed data** – `node backend/seedAll.js` for users (e.g. john@company.com / password123) and sample data.

---

*Mini Enterprise Portal – Tech stack, features, and chatbot behaviour.*
