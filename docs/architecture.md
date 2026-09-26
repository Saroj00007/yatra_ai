# YatraAI — System Architecture

## 1. Project Overview

YatraAI is an AI-powered tourism platform designed to help tourists:

1. **Choose safer and more suitable destinations**
2. **Stay protected during their journey**
3. **Understand and explore cultural destinations**
4. **Connect with verified guides**
5. **Request emergency assistance through SOS**

The system is built as a **Next.js application with REST APIs**, using Supabase/PostgreSQL for persistent data and external services for maps, weather, AI, and other live information.

---

# 2. High-Level Architecture

```text
                         ┌──────────────────────┐
                         │       TOURIST        │
                         │   Web / PWA Client   │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │      NEXT.JS APP     │
                         │      Frontend        │
                         └──────────┬───────────┘
                                    │
                              REST API
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │       YATRAAI BACKEND         │
                    │       Next.js API Routes      │
                    └───────────────┬───────────────┘
                                    │
              ┌─────────────────────┼─────────────────────┐
              │                     │                     │
              ▼                     ▼                     ▼
       ┌────────────┐        ┌────────────┐       ┌────────────┐
       │ AI / FLOW  │        │   SAFETY   │       │  VISION /  │
       │   ENGINE   │        │   ENGINE   │       │ CULTURAL AI│
       └─────┬──────┘        └─────┬──────┘       └─────┬──────┘
             │                     │                     │
             └─────────────────────┼─────────────────────┘
                                   │
                                   ▼
                         ┌──────────────────────┐
                         │  SUPABASE / POSTGRES │
                         │       DATABASE       │
                         └──────────────────────┘
                                   │
                ┌──────────────────┼──────────────────┐
                │                  │                  │
                ▼                  ▼                  ▼
           Weather API         Maps API           AI API
```

---

# 3. Main System Modules

YatraAI consists of three primary engines.

```text
                    YATRAAI
                       │
       ┌───────────────┼────────────────┐
       │               │                │
       ▼               ▼                ▼
  FLOW ENGINE     SAFETY ENGINE    VISION ENGINE
       │               │                │
       ▼               ▼                ▼
Destination       Live Safety       AI Scan
Recommendation    Monitoring        Identification
Alternative       Risk Zones        Cultural Context
Scoring           Check-ins         Ask AI
Crowd Analysis    SOS               Nearby
Safety Analysis   Guide Status      Experiences
```

---

# 4. Frontend Architecture

Frontend is implemented using **Next.js / React**.

```text
app/
│
├── page.tsx                    # Landing page
│
├── dashboard/
│   └── page.tsx                # Tourist dashboard
│
├── trip/
│   ├── page.tsx                # Trip setup
│   └── [id]/
│       └── page.tsx            # Active trip
│
├── safety/
│   └── page.tsx                # Safety dashboard
│
├── destinations/
│   ├── page.tsx                # Destination discovery
│   └── [id]/
│       └── page.tsx            # Destination details
│
├── scan/
│   └── page.tsx                # Vision / cultural guide
│
├── guide/
│   └── [id]/
│       └── page.tsx            # Guide information
│
├── sos/
│   └── page.tsx                # Emergency screen
│
└── api/
    ├── trips/
    ├── safety/
    ├── checkins/
    ├── sos/
    ├── guides/
    ├── destinations/
    ├── recommendations/
    └── vision/
```

---

# 5. Backend Architecture

The backend uses **Next.js Route Handlers** to expose REST APIs.

```text
Frontend
   │
   │ HTTP
   ▼
Next.js API Routes
   │
   ├── Authentication
   │
   ├── Validation
   │
   ├── Business Logic
   │
   ├── AI Processing
   │
   └── Database Operations
           │
           ▼
      Supabase/PostgreSQL
```

The backend should separate:

* API handling
* Business logic
* External API integration
* Database operations

This prevents the frontend from directly controlling critical safety logic.

---

# 6. REST API Structure

## Trips

```text
POST   /api/trips
GET    /api/trips
GET    /api/trips/:id
PATCH  /api/trips/:id
```

Responsibilities:

* Create trip
* Retrieve trip
* Start/end trip
* Associate tourist and guide
* Store destination and route

---

## Safety

```text
GET    /api/safety/:tripId
GET    /api/safety/risk-zones
GET    /api/safety/emergency-facilities
```

Responsibilities:

* Calculate safety information
* Retrieve risk zones
* Check connectivity areas
* Retrieve nearby emergency facilities

---

## Check-ins

```text
POST   /api/checkins
GET    /api/checkins/:tripId
```

Example:

```json
{
  "tripId": "trip_001",
  "latitude": 27.58,
  "longitude": 84.49,
  "status": "SAFE"
}
```

---

## SOS

```text
POST   /api/sos
GET    /api/sos/:id
PATCH  /api/sos/:id
```

Example:

```json
{
  "tripId": "trip_001",
  "reason": "WILDLIFE",
  "latitude": 27.58,
  "longitude": 84.49
}
```

SOS should store the tourist's latest known location and trip information.

---

## Guides

```text
GET    /api/guides/:id
GET    /api/guides/:id/tourists
POST   /api/guides/verify
```

Guide verification includes:

```text
Identity
Registration / Credential
Trip Association
Contact
Assigned Tourists
```

---

## Destinations

```text
GET    /api/destinations
GET    /api/destinations/:id
```

---

## Recommendations

```text
POST   /api/recommendations
```

Input:

```json
{
  "budget": 5000,
  "timeAvailable": 2,
  "interests": [
    "culture",
    "nature"
  ],
  "destination": "Chitwan"
}
```

Output:

```json
{
  "destination": "Sauraha",
  "score": 87,
  "reason": "Strong match for nature and culture interests."
}
```

---

## Vision

```text
POST   /api/vision
```

Input:

```text
Image
Location
Optional question
```

Output:

```json
{
  "name": "Tharu Cultural Museum",
  "description": "...",
  "culturalContext": "...",
  "nearby": []
}
```

---

# 7. AI Flow Engine

The Flow Engine combines tourist preferences with destination and live information.

```text
                 TOURIST DATA
                      │
       ┌──────────────┼──────────────┐
       ▼              ▼              ▼
    Budget         Interests       Time
       │              │              │
       └──────────────┼──────────────┘
                      ▼
               YATRAAI ENGINE
                      │
       ┌──────────────┼──────────────┐
       ▼              ▼              ▼
   Destination      Weather        Crowd
      Data            Data          Data
       │              │              │
       └──────────────┼──────────────┘
                      ▼
                FLOW SCORE
                      │
            ┌─────────┴─────────┐
            ▼                   ▼
     Recommended            Alternative
     Destination            Destination
            │                   │
            └─────────┬─────────┘
                      ▼
                Explanation
                      │
                      ▼
               TOURIST CHOICE
```

---

# 8. Flow Score

The prototype can use a weighted scoring model.

```text
Flow Score

Tourist Fit          35%
Safety               25%
Weather              15%
Crowd                10%
Travel Efficiency    10%
Local Opportunity     5%
```

Formula:

```text
Flow Score =
(Tourist Fit × 0.35)
+ (Safety × 0.25)
+ (Weather × 0.15)
+ (Crowd × 0.10)
+ (Travel Efficiency × 0.10)
+ (Local Opportunity × 0.05)
```

The scoring model should remain configurable so the weights can be changed later.

---

# 9. Safety Engine

The Safety Engine continuously evaluates the active trip.

```text
Tourist Location
       │
       ▼
Planned Route
       │
       ├──────────────┐
       ▼              ▼
Destination       Risk Zones
Conditions
       │              │
       ├──────────────┤
       ▼
    Weather
       │
       ▼
 Connectivity
       │
       ▼
  Time / Duration
       │
       ▼
  SAFETY ENGINE
       │
 ┌─────┼──────┐
 ▼     ▼      ▼
Normal Warning Critical
```

---

# 10. Risk Zone Detection

Risk zones can contain:

```text
risk_zones
──────────
id
name
latitude
longitude
radius
risk_type
severity
description
```

Possible risk types:

```text
LOW_CONNECTIVITY
WILDLIFE
WEATHER
FLOOD
LANDSLIDE
ACCIDENT_PRONE
OTHER
```

The system compares the tourist's current coordinates against predefined risk zones.

If the tourist enters a risk zone:

```text
Location
   │
   ▼
Risk Zone Check
   │
   ├── Outside → Continue
   │
   └── Inside
         │
         ▼
      Warning
         │
         ▼
   Safety Check-in
```

---

# 11. Safety Check-in

When a tourist enters a low-connectivity or elevated-risk area:

```text
⚠️ LOW CONNECTIVITY AREA

Would you like Safety Check-In
enabled for this route?

[ ENABLE ]
```

If enabled:

```text
Safety Check-In

Next Check-in:
12 minutes

[ I'M SAFE ]
```

If the tourist does not check in within the configured period:

```text
CHECK-IN OVERDUE
       │
       ▼
Increase Risk Status
       │
       ▼
Notify Guide
```

For the hackathon prototype, this can be simulated using timers.

---

# 12. SOS Architecture

SOS is designed for minimum interaction.

```text
              SOS
               │
               ▼
        I'M IN DANGER
               │
        ┌──────┴──────┐
        ▼             ▼
   Select Reason   Skip Reason
        │             │
        └──────┬──────┘
               ▼
          Create SOS
               │
       ┌───────┼────────┐
       ▼       ▼        ▼
    Location  Trip     Guide
       │       │        │
       └───────┼────────┘
               ▼
          SOS EVENT
```

SOS event:

```text
sos_events
──────────
id
trip_id
tourist_id
guide_id
latitude
longitude
reason
timestamp
status
```

Possible status:

```text
ACTIVE
ACKNOWLEDGED
RESOLVED
CANCELLED
```

---

# 13. Vision & Cultural Guide

```text
Tourist
   │
   ▼
Camera
   │
   ▼
Image
   │
   ▼
Vision AI
   │
   ▼
Object / Place Identification
   │
   ▼
Cultural Context
   │
   ├─────────────┐
   ▼             ▼
 Listen         Read
   │             │
   └──────┬──────┘
          ▼
       Ask AI
          │
          ▼
   Explore Nearby
          │
     ┌────┼────┐
     ▼    ▼    ▼
    Food Craft Experience
```

---

# 14. Guide Verification

Guide records:

```text
guides
──────
id
name
phone
registration_no
identity_verified
credential_verified
status
```

Verification status:

```text
PENDING
VERIFIED
REJECTED
```

A verified guide can be associated with a trip.

```text
Tourist
   │
   ▼
Trip
   │
   ▼
Guide
   │
   ├── Identity ✓
   ├── Credential ✓
   └── Trip Association ✓
```

---

# 15. Database Architecture

Primary database:

**Supabase PostgreSQL**

Core tables:

```text
users
tourists
guides
destinations
trips
risk_zones
checkins
sos_events
recommendations
weather_data
saved_places
feedback
```

Basic relationships:

```text
USER
 │
 ├── TOURIST
 │      │
 │      └── TRIPS
 │             │
 │             ├── DESTINATION
 │             ├── GUIDE
 │             ├── CHECKINS
 │             ├── SOS EVENTS
 │             └── RECOMMENDATIONS
 │
 └── GUIDE
        │
        └── TRIPS
```

---

# 16. External Services

The system may integrate with:

```text
Maps / Geolocation
       │
       ├── Route
       ├── Distance
       └── Location

Weather API
       │
       ├── Temperature
       ├── Rain
       ├── Wind
       └── Weather alerts

AI / Vision API
       │
       ├── Recommendation explanation
       ├── Cultural information
       └── Image identification
```

External services should be accessed from the backend whenever API keys or sensitive credentials are involved.

```text
Frontend
   │
   ▼
Next.js API
   │
   ▼
External API
```

Do not expose private API keys in client-side code.

---

# 17. Authentication

Authentication can be handled using **Supabase Auth**.

```text
User
 │
 ▼
Login / Signup
 │
 ▼
Supabase Auth
 │
 ▼
User Session
 │
 ▼
Application
```

Roles:

```text
TOURIST
GUIDE
ADMIN
```

Role-based access:

```text
TOURIST
 ├── Own trips
 ├── Safety
 ├── Check-in
 ├── SOS
 └── Vision Guide

GUIDE
 ├── Assigned trips
 ├── Assigned tourists
 ├── Check-in status
 └── SOS alerts

ADMIN
 ├── Guides
 ├── Destinations
 ├── Risk zones
 └── System data
```

---

# 18. Security Principles

The system handles sensitive tourist information.

Minimum requirements:

* Never expose API keys in frontend code.
* Validate API inputs.
* Authenticate protected API routes.
* Authorize users before accessing trip data.
* Do not allow tourists to modify another tourist's trip.
* Restrict guide access to assigned tourists.
* Store only necessary location information.
* Protect SOS information.
* Use environment variables for secrets.

Example:

```text
.env.local

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

AI_API_KEY=
WEATHER_API_KEY=
MAPS_API_KEY=
```

Never commit `.env.local` to Git.

---

# 19. Project Folder Structure

Recommended structure:

```text
yatra_ai/
│
├── app/
│   ├── api/
│   ├── dashboard/
│   ├── trip/
│   ├── safety/
│   ├── destinations/
│   ├── guide/
│   ├── scan/
│   └── sos/
│
├── components/
│   ├── map/
│   ├── safety/
│   ├── trip/
│   ├── guide/
│   ├── sos/
│   └── ui/
│
├── lib/
│   ├── supabase/
│   ├── ai/
│   ├── weather/
│   ├── maps/
│   ├── safety/
│   └── scoring/
│
├── types/
│
├── public/
│
├── supabase/
│   └── migrations/
│
├── .env.local
├── .env.example
├── architecture.md
├── package.json
└── README.md
```

---

# 20. Development Rules

## Git

Developers should **not work directly on `main`**.

Create feature branches:

```text
feature/safety-monitoring
feature/vision-guide
feature/guide-verification
feature/flow-engine
feature/sos
```

Workflow:

```text
main
 │
 └── feature branch
        │
        ├── development
        ├── commit
        └── push
              │
              ▼
        Pull Request
              │
              ▼
             main
```

---

# 21. Development Priorities

For the hackathon prototype:

### Priority 1 — Core Demo

```text
✓ Destination recommendation
✓ Safety score
✓ Route/risk detection
✓ Live trip simulation
✓ Low-connectivity warning
✓ Safety check-in
✓ SOS
```

### Priority 2

```text
✓ Guide verification
✓ Emergency facilities
✓ Vision / cultural guide
```

### Priority 3

```text
○ Real crowd prediction
○ Advanced ML
○ Government verification integration
○ Offline-first emergency communication
○ Large-scale tourist analytics
```

The prototype should prioritize a **working end-to-end journey** over implementing every possible feature.

---

# 22. End-to-End User Journey

```text
                    TOURIST
                       │
                       ▼
              Select Destination
                       │
                       ▼
                YATRAAI ANALYSIS
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
      Safety         Weather         Crowd
        │              │              │
        └──────────────┼──────────────┘
                       ▼
                FLOW SCORE
                       │
                       ▼
              Recommendation
                       │
                       ▼
                 Start Trip
                       │
                       ▼
              LIVE MONITORING
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
       Location      Risk       Connectivity
          │            │            │
          └────────────┼────────────┘
                       ▼
                Safety Check-in
                       │
                       ▼
                 Destination
                       │
                       ▼
                  AI Vision
                       │
                       ▼
              Cultural Discovery
                       │
                       ▼
                  Feedback
                       │
                       ▼
                 YATRAAI LEARNS
```

---

# 23. Hackathon Prototype Principle

YatraAI should demonstrate this complete loop:

```text
       CHOOSE
          ↓
       PREPARE
          ↓
        TRAVEL
          ↓
       MONITOR
          ↓
       EXPLORE
          ↓
       PROTECT
          ↓
       FEEDBACK
          ↓
        LEARN
```

The goal of the prototype is not to implement a complete nationwide tourism infrastructure.

The goal is to demonstrate that **one connected YatraAI system can understand a tourist's journey, recommend safer choices, monitor risk during travel, provide cultural assistance, and respond to emergencies.**
