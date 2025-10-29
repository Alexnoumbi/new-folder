# Représentations Visuelles de l'Architecture TrackImpact Monitor

## 🏗️ 1. Architecture Générale 3-Tiers

```mermaid
graph TB
    subgraph "Client Layer - Frontend"
        A[React 19.1.1 App]
        B[Material-UI Components]
        C[Redux Store]
        D[Socket.io Client]
        E[TypeScript Types]
    end
    
    subgraph "API Gateway Layer"
        F[Express.js Server]
        G[CORS Middleware]
        H[JWT Authentication]
        I[Rate Limiting]
        J[Helmet Security]
    end
    
    subgraph "Business Logic Layer"
        K[Controllers]
        L[Services]
        M[Middleware]
        N[Validation]
        O[AI Services]
    end
    
    subgraph "Data Layer"
        P[MongoDB Atlas]
        Q[Mongoose ODM]
        R[File Storage]
        S[Redis Cache]
    end
    
    subgraph "External Services"
        T[Hugging Face AI]
        U[Email Service]
        V[OCR Service]
        W[PDF Generation]
    end
    
    A --> F
    B --> F
    C --> F
    D --> F
    E --> F
    
    F --> K
    G --> F
    H --> F
    I --> F
    J --> F
    
    K --> L
    L --> Q
    Q --> P
    L --> O
    O --> T
    L --> U
    L --> V
    L --> W
```

## 🎯 2. Architecture Frontend Détaillée

```mermaid
graph TB
    subgraph "Frontend Architecture"
        A[App.tsx - Root Component]
        B[React Router 6]
        C[Pages Components]
        D[UI Components]
        E[Services Layer]
        F[Redux Store]
        G[TypeScript Types]
        H[Utils & Helpers]
    end
    
    subgraph "Pages"
        I[LandingPage]
        J[Login/Register]
        K[AdminDashboard]
        L[EnterpriseDashboard]
        M[Reports]
        N[Settings]
    end
    
    subgraph "Components"
        O[Forms]
        P[Charts]
        Q[Tables]
        R[Modals]
        S[Assistant IA]
    end
    
    subgraph "Services"
        T[API Service]
        U[Auth Service]
        V[Socket Service]
        W[AI Service]
    end
    
    A --> B
    B --> C
    C --> D
    C --> E
    E --> F
    D --> G
    E --> H
    
    C --> I
    C --> J
    C --> K
    C --> L
    C --> M
    C --> N
    
    D --> O
    D --> P
    D --> Q
    D --> R
    D --> S
    
    E --> T
    E --> U
    E --> V
    E --> W
```

## 🔧 3. Architecture Backend Détaillée

```mermaid
graph TB
    subgraph "Backend Architecture"
        A[server.js - Entry Point]
        B[Express App]
        C[Middleware Stack]
        D[Routes]
        E[Controllers]
        F[Services]
        G[Models]
        H[Utils]
    end
    
    subgraph "Middleware"
        I[CORS]
        J[Helmet]
        K[Rate Limiting]
        L[Auth Middleware]
        M[Validation]
        N[Logging]
    end
    
    subgraph "Routes"
        O[/api/auth]
        P[/api/admin]
        Q[/api/entreprises]
        R[/api/reports]
        S[/api/ai-chat]
        T[/api/enhanced-assistant]
    end
    
    subgraph "Controllers"
        U[AuthController]
        V[AdminController]
        W[EntrepriseController]
        X[ReportController]
        Y[AIController]
    end
    
    subgraph "Services"
        Z[DatabaseService]
        AA[EmailService]
        BB[AI Service]
        CC[PDFService]
        DD[OCRService]
    end
    
    A --> B
    B --> C
    C --> D
    D --> E
    E --> F
    F --> G
    F --> H
    
    C --> I
    C --> J
    C --> K
    C --> L
    C --> M
    C --> N
    
    D --> O
    D --> P
    D --> Q
    D --> R
    D --> S
    D --> T
    
    E --> U
    E --> V
    E --> W
    E --> X
    E --> Y
    
    F --> Z
    F --> AA
    F --> BB
    F --> CC
    F --> DD
```

## 🗄️ 4. Modèle de Données - Relations

```mermaid
erDiagram
    User ||--o{ Entreprise : "manages"
    User ||--o{ Report : "creates"
    User ||--o{ AuditLog : "generates"
    
    Entreprise ||--o{ Document : "has"
    Entreprise ||--o{ Convention : "signs"
    Entreprise ||--o{ Control : "undergoes"
    Entreprise ||--o{ KPI : "tracks"
    Entreprise ||--o{ Indicator : "measures"
    
    Convention ||--o{ Advantage : "contains"
    Convention ||--o{ Obligation : "contains"
    
    Control ||--o{ NonConformite : "identifies"
    
    Indicator ||--o{ IndicatorValue : "has_values"
    
    Report ||--|| ReportTemplate : "uses"
    Report ||--o{ ReportSchedule : "scheduled_by"
    
    AIAssistant ||--o{ KnowledgeBase : "uses"
    AIAssistant ||--o{ AIResponse : "generates"
    
    User {
        ObjectId _id PK
        string nom
        string prenom
        string email UK
        string motDePasse
        string typeCompte
        string role
        ObjectId entrepriseId FK
        string status
        date dateCreation
    }
    
    Entreprise {
        ObjectId _id PK
        object identification
        object performanceEconomique
        object investissementEmploi
        object impactSocial
        object impactEnvironnemental
        string statut
        string conformite
        date dateCreation
        object contact
    }
    
    Document {
        ObjectId _id PK
        ObjectId enterpriseId FK
        string name
        string type
        boolean required
        date dueDate
        string status
        array files
        string ocrText
    }
    
    Convention {
        ObjectId _id PK
        ObjectId enterpriseId FK
        date signedDate
        date startDate
        date endDate
        string status
        string type
        array advantages
        array obligations
    }
    
    KPI {
        ObjectId _id PK
        ObjectId entrepriseId FK
        string nom
        string type
        number valeur
        string unite
        date dateMesure
        string statut
    }
```

## 🔄 5. Flux de Données - Authentification

```mermaid
sequenceDiagram
    participant C as Client
    participant F as Frontend
    participant A as API Gateway
    participant M as Middleware
    participant S as Auth Service
    participant DB as Database
    participant J as JWT Service
    
    C->>F: Login Request
    F->>A: POST /api/auth/login
    A->>M: Validate Request
    M->>S: Authenticate User
    S->>DB: Query User Data
    DB-->>S: User Info
    S->>J: Generate JWT Token
    J-->>S: Token + Refresh Token
    S-->>M: Auth Success
    M-->>A: Authorized Request
    A-->>F: Success + Tokens
    F-->>C: Login Success + Redirect
```

## 📊 6. Flux de Données - Gestion Entreprise

```mermaid
sequenceDiagram
    participant A as Admin
    participant F as Frontend
    participant B as Backend
    participant DB as MongoDB
    participant AI as AI Service
    participant K as KPI Service
    participant N as Notification Service
    
    A->>F: Create Entreprise
    F->>B: POST /api/entreprises
    B->>DB: Save Entreprise Data
    DB-->>B: Confirmation
    B->>AI: Analyze Entreprise Data
    AI-->>B: Analysis Results
    B->>K: Calculate Initial KPIs
    K-->>B: KPI Values
    B->>N: Send Notification
    N-->>A: Email Notification
    B-->>F: Success + KPIs
    F-->>A: Entreprise Created
```

## 🤖 7. Architecture Intelligence Artificielle

```mermaid
graph TB
    subgraph "AI Architecture"
        A[User Question]
        B[NLP Processing]
        C[Intent Recognition]
        D[Knowledge Base Search]
        E[Context Analysis]
        F[Response Generation]
        G[Quality Validation]
        H[Response Delivery]
    end
    
    subgraph "AI Services"
        I[Hugging Face Models]
        J[LangChain Framework]
        K[Vector Database]
        L[Embedding Service]
        M[Similarity Search]
    end
    
    subgraph "Knowledge Base"
        N[Admin Knowledge]
        O[Enterprise Data]
        P[System Documentation]
        Q[FAQ Database]
        R[Best Practices]
    end
    
    A --> B
    B --> C
    C --> D
    D --> E
    E --> F
    F --> G
    G --> H
    
    B --> I
    C --> J
    D --> K
    E --> L
    F --> M
    
    D --> N
    D --> O
    D --> P
    D --> Q
    D --> R
```

## 🔐 8. Architecture de Sécurité

```mermaid
graph TB
    subgraph "Security Layers"
        A[HTTPS/TLS 1.3]
        B[CORS Policy]
        C[Helmet Security Headers]
        D[JWT Authentication]
        E[2FA Verification]
        F[Rate Limiting]
        G[Input Validation]
        H[XSS Protection]
        I[SQL Injection Prevention]
        J[CSRF Protection]
    end
    
    subgraph "Authentication Flow"
        K[Login Request]
        L[Credential Validation]
        M[2FA Challenge]
        N[Token Generation]
        O[Session Management]
        P[Token Refresh]
        Q[Logout]
    end
    
    subgraph "Authorization"
        R[Role-Based Access]
        S[Permission Matrix]
        T[Resource Protection]
        U[API Endpoint Security]
        V[Data Access Control]
    end
    
    A --> B
    B --> C
    C --> D
    D --> E
    E --> F
    F --> G
    G --> H
    H --> I
    I --> J
    
    K --> L
    L --> M
    M --> N
    N --> O
    O --> P
    P --> Q
    
    D --> R
    R --> S
    S --> T
    T --> U
    U --> V
```

## 📈 9. Architecture de Monitoring

```mermaid
graph TB
    subgraph "Monitoring Stack"
        A[Application Metrics]
        B[System Metrics]
        C[Business Metrics]
        D[Security Metrics]
        E[Performance Metrics]
        F[User Analytics]
    end
    
    subgraph "Data Collection"
        G[Real-time Collection]
        H[Batch Processing]
        I[Event Streaming]
        J[Log Aggregation]
        K[Error Tracking]
    end
    
    subgraph "Analysis & Alerting"
        L[Threshold Monitoring]
        M[Anomaly Detection]
        N[Trend Analysis]
        O[Predictive Analytics]
        P[Alert Generation]
        Q[Notification System]
    end
    
    subgraph "Visualization"
        R[Dashboard]
        S[Reports]
        T[Charts]
        U[Alerts]
        V[KPIs]
    end
    
    A --> G
    B --> H
    C --> I
    D --> J
    E --> K
    F --> G
    
    G --> L
    H --> M
    I --> N
    J --> O
    K --> P
    L --> Q
    
    L --> R
    M --> S
    N --> T
    O --> U
    P --> V
```

## 🚀 10. Architecture de Déploiement

```mermaid
graph TB
    subgraph "Production Environment"
        A[Vercel Frontend]
        B[Vercel Backend]
        C[MongoDB Atlas]
        D[Cloud Storage]
        E[CDN Global]
        F[Load Balancer]
    end
    
    subgraph "Development Environment"
        G[Local Development]
        H[Git Repository]
        I[CI/CD Pipeline]
        J[Testing Environment]
        K[Staging Environment]
    end
    
    subgraph "Monitoring & Logging"
        L[Application Logs]
        M[Error Tracking]
        N[Performance Monitoring]
        O[Security Monitoring]
        P[Business Analytics]
    end
    
    subgraph "Backup & Recovery"
        Q[Database Backup]
        R[File Backup]
        S[Configuration Backup]
        T[Disaster Recovery]
    end
    
    A --> E
    B --> C
    B --> D
    F --> A
    F --> B
    
    G --> H
    H --> I
    I --> J
    J --> K
    K --> A
    K --> B
    
    A --> L
    B --> M
    C --> N
    D --> O
    E --> P
    
    C --> Q
    D --> R
    B --> S
    Q --> T
    R --> T
    S --> T
```

## 🔄 11. Flux de Communication Temps Réel

```mermaid
graph TB
    subgraph "Real-time Communication"
        A[Client Browser]
        B[Socket.io Client]
        C[WebSocket Connection]
        D[Socket.io Server]
        E[Event Processing]
        F[Database Updates]
        G[Notification Service]
    end
    
    subgraph "Event Types"
        H[User Actions]
        I[System Updates]
        J[AI Responses]
        K[Notifications]
        L[Status Changes]
        M[Data Updates]
    end
    
    subgraph "Broadcasting"
        N[Room Management]
        O[User Groups]
        P[Targeted Messages]
        Q[Global Broadcasts]
        R[Private Messages]
    end
    
    A --> B
    B --> C
    C --> D
    D --> E
    E --> F
    F --> G
    
    H --> E
    I --> E
    J --> E
    K --> E
    L --> E
    M --> E
    
    E --> N
    N --> O
    O --> P
    P --> Q
    Q --> R
```

## 📋 12. Architecture des Rapports

```mermaid
graph TB
    subgraph "Report Generation"
        A[Report Request]
        B[Parameter Validation]
        C[Data Collection]
        D[AI Processing]
        E[Content Generation]
        F[Format Selection]
        G[Document Creation]
        H[Quality Check]
        I[Delivery]
    end
    
    subgraph "Data Sources"
        J[Enterprise Data]
        K[KPI Metrics]
        L[User Activities]
        M[System Logs]
        N[External APIs]
    end
    
    subgraph "Output Formats"
        O[PDF Reports]
        P[Excel Spreadsheets]
        Q[CSV Data]
        R[JSON Data]
        S[Interactive Dashboards]
    end
    
    subgraph "Distribution"
        T[Email Delivery]
        U[File Download]
        V[Cloud Storage]
        W[API Access]
        X[Real-time Updates]
    end
    
    A --> B
    B --> C
    C --> D
    D --> E
    E --> F
    F --> G
    G --> H
    H --> I
    
    C --> J
    C --> K
    C --> L
    C --> M
    C --> N
    
    G --> O
    G --> P
    G --> Q
    G --> R
    G --> S
    
    I --> T
    I --> U
    I --> V
    I --> W
    I --> X
```

Ces diagrammes visuels offrent une représentation complète et détaillée de l'architecture technique de TrackImpact Monitor, couvrant tous les aspects de l'infrastructure, des flux de données, de la sécurité, du monitoring et des fonctionnalités avancées.
