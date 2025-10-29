# Architecture Technique - TrackImpact Monitor

## Vue d'ensemble de l'Architecture

L'application TrackImpact Monitor suit une architecture **3-tiers** moderne avec séparation claire des responsabilités :

### 🏗️ Architecture Générale

```mermaid
graph TB
    subgraph "Client Layer"
        A[React Frontend]
        B[Material-UI Components]
        C[Redux Store]
        D[Socket.io Client]
    end
    
    subgraph "API Gateway Layer"
        E[Express.js Server]
        F[CORS Middleware]
        G[Authentication]
        H[Rate Limiting]
    end
    
    subgraph "Business Logic Layer"
        I[Controllers]
        J[Services]
        K[Middleware]
        L[Validation]
    end
    
    subgraph "Data Layer"
        M[MongoDB Atlas]
        N[Mongoose ODM]
        O[File Storage]
        P[Cache Redis]
    end
    
    subgraph "External Services"
        Q[AI Services]
        R[Email Service]
        S[OCR Service]
        T[PDF Generation]
    end
    
    A --> E
    B --> E
    C --> E
    D --> E
    E --> I
    I --> J
    J --> N
    N --> M
    J --> Q
    J --> R
    J --> S
    J --> T
```

## 🎯 Architecture Détaillée par Couche

### 1. Frontend Layer (React/TypeScript)

```mermaid
graph TB
    subgraph "Frontend Architecture"
        A[App.tsx - Root Component]
        B[Routes - Navigation]
        C[Pages - Views]
        D[Components - UI]
        E[Services - API Calls]
        F[Store - State Management]
        G[Types - TypeScript]
        H[Utils - Helpers]
    end
    
    A --> B
    B --> C
    C --> D
    C --> E
    E --> F
    D --> G
    E --> H
```

**Technologies Frontend :**
- **React 19.1.1** : Framework principal
- **TypeScript** : Typage statique
- **Material-UI 7.x** : Composants UI
- **Redux Toolkit** : Gestion d'état
- **React Router 6** : Navigation
- **Axios** : Client HTTP
- **Socket.io** : Communication temps réel
- **Recharts** : Visualisations
- **Formik + Yup** : Gestion des formulaires

### 2. Backend Layer (Node.js/Express)

```mermaid
graph TB
    subgraph "Backend Architecture"
        A[server.js - Entry Point]
        B[Routes - API Endpoints]
        C[Controllers - Business Logic]
        D[Models - Data Schema]
        E[Middleware - Security & Auth]
        F[Utils - Helpers]
        G[Services - External APIs]
    end
    
    A --> B
    B --> C
    C --> D
    C --> E
    C --> F
    C --> G
```

**Technologies Backend :**
- **Node.js 18+** : Runtime
- **Express.js 4.18** : Framework web
- **MongoDB 8.18** : Base de données
- **Mongoose** : ODM
- **JWT** : Authentification
- **Helmet** : Sécurité
- **Socket.io** : WebSockets
- **Multer** : Upload de fichiers
- **PDFKit** : Génération PDF
- **ExcelJS** : Génération Excel
- **Tesseract.js** : OCR
- **LangChain** : IA/ML

### 3. Base de Données (MongoDB)

```mermaid
erDiagram
    User ||--o{ Entreprise : "manages"
    User {
        string _id PK
        string nom
        string prenom
        string email UK
        string motDePasse
        string typeCompte
        string role
        objectId entrepriseId FK
        string status
        date dateCreation
    }
    
    Entreprise ||--o{ Document : "has"
    Entreprise ||--o{ Convention : "signs"
    Entreprise ||--o{ Control : "undergoes"
    Entreprise ||--o{ KPI : "tracks"
    Entreprise {
        objectId _id PK
        object identification
        object performanceEconomique
        object investissementEmploi
        object impactSocial
        object impactEnvironnemental
        string statut
        string conformite
        date dateCreation
    }
    
    Document {
        objectId _id PK
        objectId enterpriseId FK
        string name
        string type
        boolean required
        date dueDate
        string status
        array files
        string ocrText
    }
    
    Convention {
        objectId _id PK
        objectId enterpriseId FK
        date signedDate
        date startDate
        date endDate
        string status
        string type
        array advantages
        array obligations
    }
    
    Control {
        objectId _id PK
        objectId entrepriseId FK
        string type
        string status
        date dateControl
        string responsable
        string description
        object resultats
    }
    
    KPI {
        objectId _id PK
        objectId entrepriseId FK
        string nom
        string type
        number valeur
        string unite
        date dateMesure
        string statut
    }
```

## 🔄 Flux de Données

### 1. Authentification et Autorisation

```mermaid
sequenceDiagram
    participant C as Client
    participant A as API Gateway
    participant M as Middleware
    participant S as Service
    participant DB as Database
    
    C->>A: POST /api/auth/login
    A->>M: Validate credentials
    M->>S: Authenticate user
    S->>DB: Query user data
    DB-->>S: User info
    S-->>M: JWT token
    M-->>A: Authorized request
    A-->>C: Success + token
```

### 2. Gestion des Entreprises

```mermaid
sequenceDiagram
    participant A as Admin
    participant F as Frontend
    participant B as Backend
    participant DB as MongoDB
    participant AI as AI Service
    
    A->>F: Créer entreprise
    F->>B: POST /api/entreprises
    B->>DB: Save entreprise
    DB-->>B: Confirmation
    B->>AI: Analyze data
    AI-->>B: KPIs calculated
    B-->>F: Success + KPIs
    F-->>A: Entreprise créée
```

### 3. Système de Rapports

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant R as Report Service
    participant P as PDF Service
    participant E as Email Service
    
    U->>F: Demander rapport
    F->>B: GET /api/reports/generate
    B->>R: Process data
    R->>P: Generate PDF
    P-->>R: PDF file
    R->>E: Send email
    E-->>U: Rapport envoyé
    B-->>F: Success
    F-->>U: Rapport disponible
```

## 🛡️ Sécurité et Performance

### Architecture de Sécurité

```mermaid
graph TB
    subgraph "Security Layers"
        A[HTTPS/TLS]
        B[CORS Policy]
        C[Helmet Security]
        D[JWT Authentication]
        E[Rate Limiting]
        F[Input Validation]
        G[SQL Injection Protection]
        H[XSS Protection]
    end
    
    A --> B
    B --> C
    C --> D
    D --> E
    E --> F
    F --> G
    G --> H
```

### Optimisations de Performance

```mermaid
graph TB
    subgraph "Performance Optimizations"
        A[React.memo]
        B[Code Splitting]
        C[Lazy Loading]
        D[Image Optimization]
        E[Bundle Optimization]
        F[CDN]
        G[Caching Strategy]
        H[Database Indexing]
    end
    
    A --> B
    B --> C
    C --> D
    D --> E
    E --> F
    F --> G
    G --> H
```

## 📊 Monitoring et Observabilité

### Architecture de Monitoring

```mermaid
graph TB
    subgraph "Monitoring Stack"
        A[Application Metrics]
        B[Performance Metrics]
        C[Error Tracking]
        D[User Analytics]
        E[System Health]
        F[Database Metrics]
        G[API Metrics]
        H[Security Events]
    end
    
    A --> I[Monitoring Dashboard]
    B --> I
    C --> I
    D --> I
    E --> I
    F --> I
    G --> I
    H --> I
```

## 🚀 Déploiement et Infrastructure

### Architecture de Déploiement

```mermaid
graph TB
    subgraph "Production Environment"
        A[Vercel - Frontend]
        B[Vercel - Backend]
        C[MongoDB Atlas]
        D[Cloud Storage]
        E[CDN]
        F[Load Balancer]
        G[Monitoring]
    end
    
    A --> E
    B --> C
    B --> D
    F --> A
    F --> B
    G --> A
    G --> B
```

Cette architecture garantit :
- **Scalabilité** : Séparation des couches
- **Maintenabilité** : Code modulaire et typé
- **Sécurité** : Multiples couches de protection
- **Performance** : Optimisations à tous les niveaux
- **Observabilité** : Monitoring complet
