# ⚡ FreelanceHub — Student Bid Portal

A full-stack **MERN** (MongoDB, Express, React, Node.js) marketplace that connects
**Clients** (people/companies who need work done) with **Students** (freelancers who
bid on and execute that work). Clients post projects, students bid on them, the
client picks a winner, both sides track progress through milestones, and payment
is collected milestone-by-milestone via a **scanner/QR-based payment confirmation
flow** — once a student is selected, both sides can also **chat directly** inside
the project page.

---

## 1. The Idea (Theory) 🧠

Think of the platform as a mini "Upwork/Fiverr for student freelancers":

1. **Client** posts a project — title, description, budget, deadline (in days),
   and required skills.
2. **Students** browse open projects and submit **bids** — their price,
   delivery time, and a proposal/pitch.
3. The **Client reviews all bids** for their project (with the bidder's profile,
   skills, rating, college, etc.) and **accepts one bid**.
   - Accepting a bid: marks that bid `accepted`, auto-rejects every other bid,
     sets `project.status = in_progress`, and stores `project.assignedTo`
     (the chosen student).
4. Once a student is assigned, the **Client breaks the work into milestones**
   (e.g. "UI Design — ₹2000", "Backend API — ₹3000").
5. The **Student marks a milestone as `completed`** once they finish that chunk
   of work, then **uploads their payment scanner / UPI QR code** so the client
   can pay the correct amount.
6. The **Client opens the "Pay & Approve" modal**, scans the QR code shown,
   transfers the exact milestone amount, and clicks **Confirm Payment & Approve**.
   - If the bidder has **not** uploaded a scanner yet, the client sees a
     "Payment Incomplete" warning and cannot approve until the scanner is provided.
7. When **all milestones are paid and approved**, the project automatically
   becomes `completed`, and the student's `completedProjects` counter increases.
8. Throughout this lifecycle, both sides get **in-app notifications** (new bid,
   bid accepted, milestone added/completed/approved, scanner uploaded, payment
   confirmed, new chat message, etc.).
9. **Chat**: as soon as a client selects ("accepts") a student for a project, a
   private **1-to-1 chat thread** unlocks on that project's page so the client
   and the selected student can coordinate directly.

### Milestone Payment Lifecycle

```
Student marks milestone "complete"
        │
        ▼
Student uploads payment scanner / UPI QR  ◀── "📤 Upload Scanner" button (bidder only)
        │
        ▼
Client clicks "Pay & Approve"
        │
        ├── Scanner NOT uploaded ──▶ Modal shows "⚠️ Payment Incomplete" — blocked
        │
        └── Scanner uploaded ──▶ Modal shows QR image + exact amount auto-filled
                │
                ▼
        Client scans QR, pays ₹{amount}, clicks "✅ Confirm Payment & Approve"
                │
                ▼
        Milestone → status: "approved", paymentStatus: "paid"
        Bidder notified: "Payment of ₹X confirmed! 💰"
                │
                ▼  (when ALL milestones approved)
        Project → status: "completed"
```

### Project Status Lifecycle

```
 open  ──(client accepts a bid)──▶  in_progress  ──(all milestones paid & approved)──▶  completed
   │                                     │
   │                                     └─▶ Chat thread unlocks (client ⇄ assigned student)
   └─▶ Students can submit bids
```

### Roles & Permissions

| Action | Client | Student |
|---|---|---|
| Post a project | ✅ | ❌ |
| Browse / search projects | ✅ | ✅ |
| Place a bid on a project | ❌ | ✅ |
| View bids on own project | ✅ | ❌ |
| Accept a bid | ✅ | ❌ |
| Create milestones | ✅ | ❌ |
| Mark milestone complete | ❌ | ✅ (assigned student only) |
| Upload payment scanner / QR | ❌ | ✅ (assigned student only) |
| Pay & approve milestone | ✅ | ❌ |
| Chat (once student selected) | ✅ (project owner) | ✅ (assigned student only) |
| Edit profile / portfolio | ✅ | ✅ |

---

## 2. Project Structure 📁

```
freelance-portal/
├── README.md
│
├── backend/                    ← Express + MongoDB REST API (port 5000)
│   ├── server.js               ← App entry point, mounts all routes
│   ├── .env                    ← PORT, MONGO_URI, JWT_SECRET
│   ├── config/
│   │   └── db.js               ← Mongoose connection to MongoDB
│   ├── models/                 ← Mongoose schemas
│   │   ├── User.js              (name, email, password hash, role, skills, college, rating...)
│   │   ├── Project.js           (title, description, budget, deadline, status, postedBy, assignedTo, acceptedBid)
│   │   ├── Bid.js                (projectId, studentId, bidAmount, proposal, deliveryTime, status)
│   │   ├── Milestone.js          (projectId, title, amount, status, paymentScanner,
│   │   │                          paymentStatus, paymentConfirmedAt, completedAt, approvedAt)
│   │   ├── Notification.js       (userId, message, type, read, link)
│   │   └── Message.js            (projectId, sender, text)
│   ├── controllers/             ← Business logic for each resource
│   │   ├── authController.js     (register, login, profile)
│   │   ├── projectController.js  (CRUD on projects, visibility rules)
│   │   ├── bidController.js      (place bid, list bids, accept bid)
│   │   ├── milestoneController.js(create, complete, uploadPaymentScanner, approve)
│   │   ├── notificationController.js (list / mark read)
│   │   └── messageController.js  (getProjectMessages, sendMessage)
│   ├── routes/                  ← Express routers, wire URLs → controllers
│   │   ├── authRoutes.js          /api/auth/*
│   │   ├── projectRoutes.js       /api/projects/*
│   │   ├── bidRoutes.js           /api/bids/*
│   │   ├── milestoneRoutes.js     /api/milestones/*  (includes /upload-scanner)
│   │   ├── notificationRoutes.js  /api/notifications/*
│   │   └── messageRoutes.js       /api/messages/*
│   └── middleware/
│       └── authMiddleware.js    ← protect (JWT auth), clientOnly, studentOnly, optionalAuth
│
└── frontend/                    ← React 18 + Vite UI (port 5173)
    ├── index.html
    ├── vite.config.js           ← dev server + proxy: /api → http://localhost:5000
    └── src/
        ├── main.jsx              ← React root
        ├── App.jsx               ← Router, routes, protected-route logic
        ├── index.css             ← global theme (CSS variables, dark UI)
        ├── context/
        │   └── AuthContext.jsx   ← login/register/logout, stores user+JWT in localStorage
        ├── services/
        │   └── api.js            ← Axios instance + every API call (incl. scanner upload & chat)
        ├── components/
        │   ├── Navbar.jsx/.css   ← nav bar + notification bell dropdown
        │   └── ChatBox.jsx/.css  ← project chat widget (polling-based)
        └── pages/
            ├── Home.jsx           ← landing page
            ├── Login.jsx / Register.jsx
            ├── Projects.jsx       ← browse/search all open projects
            ├── ProjectDetail.jsx  ← project info, bidding, milestones + payment flow, chat
            ├── PostProject.jsx    ← client: create a new project
            ├── Dashboard.jsx      ← "my projects" overview
            ├── MyBids.jsx         ← student: bid history
            └── Profile.jsx        ← view/edit profile & portfolio
```

---

## 3. How Data Flows (Working Flow) 🔄

### Authentication
- `POST /api/auth/register` and `POST /api/auth/login` return a **JWT** valid for 7 days.
- The frontend stores `{ ...user, token }` in `localStorage`.
- `src/services/api.js` is an Axios instance with a request interceptor that
  automatically attaches `Authorization: Bearer <token>` to every request.
- Backend `authMiddleware.protect` decodes the JWT, loads the user, and attaches
  it as `req.user`. `clientOnly` / `studentOnly` further restrict by role.

### Posting & Browsing Projects
1. Client fills the form on **Post Project** → `POST /api/projects` (clientOnly).
2. Anyone can browse **Projects** page → `GET /api/projects` (uses `optionalAuth`
   so it can personalize visibility: non-open projects are only shown to the
   poster, the assigned student, or anyone who placed a bid).

### Bidding & Selection
1. On **Project Detail**, a logged-in student sees a "Place Your Bid" form →
   `POST /api/bids`.
2. The client (project owner) sees a "Bids Received" list →
   `GET /api/bids/project/:id`.
3. Client clicks **Accept This Bid** → `PUT /api/bids/:id/accept`:
   - that bid → `accepted`, all other bids on the project → `rejected`
   - `project.status = in_progress`, `project.assignedTo = studentId`,
     `project.acceptedBid = bidId`
   - the student gets a notification "Your bid was accepted! 🎉"
   - **→ this is also the moment the chat unlocks** (see below).

### 💳 Milestone Payment Flow (New)

This is the core payment feature. Milestones go through a strict gate before
they can be marked approved — the client must actually pay via the bidder's
scanner, not just click a button.

#### Step-by-step

**Step 1 — Student marks milestone complete**
- Student clicks **"Mark Complete"** on a pending milestone →
  `PUT /api/milestones/:id/complete`
- Milestone status → `completed`
- Client gets a notification: *"Milestone X marked complete — please review & pay"*

**Step 2 — Student uploads their payment scanner / QR**
- A **"📤 Upload Scanner"** button appears on every `completed` milestone,
  visible only to the assigned student.
- Clicking it opens a modal where the student uploads their UPI QR code or any
  payment scanner image (PNG/JPG, max 2MB).
- The image is sent as base64 → `PUT /api/milestones/:id/upload-scanner`
  (studentOnly).
- Client gets a notification: *"Payment scanner uploaded for milestone X —
  please pay ₹{amount}"*
- If a scanner was previously uploaded, the button changes to
  **"🔄 Update Scanner"** so the student can replace it.

**Step 3 — Client pays via the modal**
- Client sees a **"⚠️ Payment Incomplete"** button (yellow) if scanner is missing,
  or a **"💳 Pay & Approve"** button (green) if scanner is ready.
- Clicking either opens the **Payment Modal**:
  - **Scanner missing** → modal shows a warning banner explaining the bidder
    has not uploaded a scanner yet. The client cannot proceed until the bidder
    does. The modal auto-fills the milestone amount for reference.
  - **Scanner present** → modal shows the bidder's QR/scanner image and the
    exact milestone amount (auto-filled from `milestone.amount`). The client
    scans the QR with their banking app, pays the displayed amount, then clicks
    **"✅ Confirm Payment & Approve"**.

**Step 4 — Backend validates & approves**
- `PUT /api/milestones/:id/approve` (clientOnly):
  - Returns `400` if milestone is not `completed` yet.
  - Returns `400` if `paymentScanner` is null — enforcing that payment
    details must exist before approval.
  - Otherwise sets `status = approved`, `paymentStatus = paid`,
    `paymentConfirmedAt = now`.
- If **all milestones** on the project are now `approved`, the backend
  automatically sets `project.status = completed` and increments the student's
  `completedProjects` count.
- Student gets a notification: *"Payment of ₹X confirmed for milestone Y! 💰"*

#### UI indicators on the milestone list

| Milestone state | Badge shown | Button (client) | Button (student) |
|---|---|---|---|
| `pending` | `pending` | — | "Mark Complete" |
| `completed`, no scanner | `🔄 Awaiting Payment` + `⚠️ Scanner Needed` | "⚠️ Payment Incomplete" (yellow) | "📤 Upload Scanner" (blue) |
| `completed`, scanner uploaded | `🔄 Awaiting Payment` + `🔍 Scanner Ready` | "💳 Pay & Approve" (green) | "🔄 Update Scanner" |
| `approved` | `✅ Paid & Approved` | — | — |

### 💬 Chat (Client ⇄ Selected Student)

**Backend**
- Model **`Message`**: `{ projectId, sender, text, createdAt }`.
- `GET /api/messages/project/:id` — returns the full conversation
  (sorted oldest→newest), with `sender` populated (`name`, `profilePic`, `role`).
- `POST /api/messages` — body `{ projectId, text }`, creates a message and
  sends a notification to the other participant.
- **Access control**: only allowed if `project.assignedTo` is set **and** the
  requester is either `project.postedBy` (the client) or `project.assignedTo`
  (the selected student).

**Frontend**
- Component **`ChatBox.jsx`** polls every 4 seconds for new messages (no
  WebSocket required). Messages render as chat bubbles — current user's on
  the right (accent colour), other person's on the left.
- **`ProjectDetail.jsx`** renders `<ChatBox />` only when `project.assignedTo`
  exists **and** the current user is client or assigned student.

---

## 4. Database Models 🗃️

- **User** — name, email, hashed password, role (`client`/`student`), skills,
  college, bio, github, portfolioLinks, rating, completedProjects
- **Project** — title, description, budget, deadline (days), skillsRequired,
  status (`open` / `in_progress` / `completed`), postedBy, assignedTo, acceptedBid
- **Bid** — projectId, studentId, bidAmount, proposal, deliveryTime, status
  (`pending` / `accepted` / `rejected`)
- **Milestone** — projectId, title, amount, status (`pending` / `completed` / `approved`),
  paymentScanner (base64 image), paymentScannerType (MIME), paymentStatus
  (`unpaid` / `paid`), paymentConfirmedAt, completedAt, approvedAt
- **Notification** — userId, message, type, read, link
- **Message** — projectId, sender, text, createdAt/updatedAt

---

## 5. Setup & Running ⚙️

### Prerequisites
- Node.js v18+
- MongoDB (local instance) or a free MongoDB Atlas cluster

### 1. Backend

```bash
cd backend
npm install
```

Configure `backend/.env`:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/freelance-portal
JWT_SECRET=change_this_to_a_random_secret_string
```
> For MongoDB Atlas, replace `MONGO_URI` with your Atlas connection string.

Run the API server:
```bash
npm run dev      # nodemon, auto-restarts on changes
# or
npm start        # plain node
```
Backend runs at: **http://localhost:5000**

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```
Frontend runs at: **http://localhost:5173**
(Vite dev server proxies any `/api/*` request to `http://localhost:5000`.)

### 3. Try it out
1. Open http://localhost:5173 and register two accounts — one as **client**,
   one as **student**.
2. As the client, post a project (`/post-project`).
3. As the student, go to `/projects`, open that project, and submit a bid.
4. As the client, open the project, view the bid, and click **Accept This Bid**.
5. The project is now `in_progress` and a Chat card appears.
6. As the client, add one or more milestones with a title and amount.
7. As the student, click **Mark Complete** on a milestone, then click
   **📤 Upload Scanner** and upload your UPI QR / payment scanner image.
8. As the client, click **💳 Pay & Approve** — the modal shows the scanner
   and the exact amount. Scan, pay, confirm.
9. The milestone is now marked **✅ Paid & Approved**. Once all milestones
   are approved the project moves to `completed`.

---

## 6. API Endpoints 🌐

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register | — | Register user |
| POST | /api/auth/login | — | Login |
| GET | /api/auth/profile | ✓ | Get own profile |
| PUT | /api/auth/profile | ✓ | Update profile |
| GET | /api/auth/user/:id | — | Public profile |
| GET | /api/projects | optional | List projects |
| POST | /api/projects | Client | Post project |
| GET | /api/projects/my | ✓ | My projects |
| GET | /api/projects/:id | — | Project detail |
| PUT | /api/projects/:id | Client | Update project |
| DELETE | /api/projects/:id | Client | Delete project |
| POST | /api/bids | Student | Place bid |
| GET | /api/bids/project/:id | ✓ | Get bids for a project |
| GET | /api/bids/my | Student | My bid history |
| PUT | /api/bids/:id/accept | Client | Accept a bid (selects the student) |
| POST | /api/milestones | Client | Add milestone |
| GET | /api/milestones/project/:id | ✓ | List milestones |
| PUT | /api/milestones/:id/complete | Student | Mark milestone complete |
| **PUT** | **/api/milestones/:id/upload-scanner** | **Student** | **Upload payment scanner / QR image `{ scannerData, scannerType }`** |
| PUT | /api/milestones/:id/approve | Client | Confirm payment & approve milestone (requires scanner) |
| GET | /api/notifications | ✓ | Get notifications |
| PUT | /api/notifications/:id/read | ✓ | Mark one read |
| PUT | /api/notifications/read-all | ✓ | Mark all read |
| GET | /api/messages/project/:id | ✓ (client or assigned student) | Get chat history for a project |
| POST | /api/messages | ✓ (client or assigned student) | Send a chat message `{ projectId, text }` |

---

## 7. Pages (Frontend Routes) 🖥️

| Route | Page | Access |
|-------|------|--------|
| / | Landing page | Public |
| /login | Login | Public |
| /register | Register | Public |
| /projects | Browse all projects | Public |
| /projects/:id | Project detail + bidding + milestones + payment flow + chat | Public / Auth |
| /post-project | Post new project | Client only |
| /dashboard | My projects overview | Auth |
| /my-bids | My bid history | Student only |
| /profile | Edit own profile | Auth |
| /profile/:id | View public profile | Public |

---

## 8. Security 🔐

- Passwords hashed with `bcryptjs` (salt rounds: 10)
- JWT tokens (7-day expiry), sent as `Authorization: Bearer <token>`
- Role-based route guards (`clientOnly` / `studentOnly` middleware)
- The `/upload-scanner` endpoint is `studentOnly` — clients cannot inject
  their own QR to manipulate payment details
- The `/approve` endpoint is `clientOnly` and additionally checks that a
  `paymentScanner` exists before allowing approval — so a milestone can never
  be marked paid without the bidder first providing their payment details
- Chat endpoints check that the requester is **either the project's client or
  its assigned student**, and that a student has actually been assigned
- Email uniqueness enforced at the database level
