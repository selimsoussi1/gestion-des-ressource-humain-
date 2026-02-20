# 📋 Rapport du Projet — Plateforme GRH (Gestion des Ressources Humaines)

---

## 📌 Table des matières

1. [Présentation du Projet](#1-présentation-du-projet)
2. [Architecture & Technologies](#2-architecture--technologies)
3. [Structure du Projet](#3-structure-du-projet)
4. [Modules Fonctionnels](#4-modules-fonctionnels)
5. [Base de Données](#5-base-de-données)
6. [Sécurité](#6-sécurité)
7. [Tableau de Bord & Monitoring](#7-tableau-de-bord--monitoring)
8. [Guide d'Installation](#8-guide-dinstallation)
9. [Guide d'Utilisation](#9-guide-dutilisation)
10. [API REST — Endpoints](#10-api-rest--endpoints)
11. [Identifiants par Défaut](#11-identifiants-par-défaut)
12. [Technologies Utilisées](#12-technologies-utilisées)

---

## 1. Présentation du Projet

La plateforme **GRH** est une solution complète de gestion des ressources humaines développée en architecture web moderne. Elle permet aux entreprises de gérer l'ensemble du cycle de vie de leurs employés : du recrutement à la gestion de la paie, en passant par les contrats, les absences et le suivi des performances.

### Objectifs principaux :
- **Centraliser** la gestion RH dans une plateforme unique
- **Automatiser** le calcul de la paie (conformément à la législation tunisienne)
- **Suivre** les contrats, absences et recrutements en temps réel
- **Visualiser** les indicateurs clés via des tableaux de bord interactifs
- **Sécuriser** les données sensibles des employés

---

## 2. Architecture & Technologies

### Architecture Globale

```
┌─────────────────────────────────────────────────┐
│                   FRONTEND                       │
│          React 18 + Vite + Tailwind CSS          │
│                  Port: 5173                       │
└──────────────────────┬──────────────────────────┘
                       │ API REST (JSON)
                       ▼
┌─────────────────────────────────────────────────┐
│                   BACKEND                        │
│       Node.js + Express.js + JWT Auth            │
│                  Port: 5000                       │
└──────────────────────┬──────────────────────────┘
                       │ SQL (pg driver)
                       ▼
┌─────────────────────────────────────────────────┐
│                 BASE DE DONNÉES                  │
│            PostgreSQL 16 (Alpine)                │
│                  Port: 5432                       │
└─────────────────────────────────────────────────┘
```

### Stack Technique

| Couche       | Technologie                          |
|-------------|--------------------------------------|
| Frontend    | React 18.2, Vite 5.0, Tailwind CSS 3.4 |
| Charts      | Recharts 2.10                        |
| Backend     | Node.js 20, Express.js 4.18          |
| Base de données | PostgreSQL 16                    |
| Auth        | JWT (jsonwebtoken 9.0)               |
| Conteneurisation | Docker & Docker Compose         |
| Sécurité    | Helmet, CORS, bcrypt, rate-limiting  |

---

## 3. Structure du Projet

```
GRH/
├── docker-compose.yml          # Orchestration Docker
├── .gitignore                  # Fichiers ignorés par Git
├── RAPPORT.md                  # Ce rapport
├── README.md                   # Présentation courte
│
├── backend/
│   ├── Dockerfile              # Image Docker backend
│   ├── package.json            # Dépendances Node.js
│   ├── .env                    # Variables d'environnement
│   ├── .env.example            # Exemple de configuration
│   └── src/
│       ├── index.js            # Point d'entrée serveur Express
│       ├── config/
│       │   ├── database.js     # Pool de connexion PostgreSQL
│       │   └── logger.js       # Logger Winston
│       ├── middleware/
│       │   ├── auth.js         # Middleware JWT + rôles
│       │   └── errorHandler.js # Gestion centralisée des erreurs
│       ├── database/
│       │   └── migrations/
│       │       └── 001_initial_schema.sql  # Schéma complet + données initiales
│       └── routes/
│           ├── auth.js         # Authentification (login/register)
│           ├── employees.js    # CRUD Employés
│           ├── departments.js  # CRUD Départements
│           ├── payroll.js      # Gestion de la Paie
│           ├── contracts.js    # Gestion des Contrats
│           ├── recruitment.js  # Recrutement + Candidats
│           ├── absences.js     # Gestion des Absences
│           └── dashboard.js    # Statistiques & KPIs
│
└── frontend/
    ├── Dockerfile              # Image Docker frontend
    ├── package.json            # Dépendances React
    ├── vite.config.js          # Configuration Vite
    ├── tailwind.config.js      # Configuration Tailwind CSS
    ├── postcss.config.js       # Configuration PostCSS
    ├── index.html              # Point d'entrée HTML
    └── src/
        ├── main.jsx            # Bootstrap React
        ├── index.css           # Styles globaux + utilitaires
        ├── App.jsx             # Routeur principal
        ├── api/
        │   └── axios.js        # Instance Axios configurée
        ├── context/
        │   └── AuthContext.jsx # Contexte d'authentification
        └── components/
            ├── Layout/
            │   ├── Sidebar.jsx     # Menu latéral
            │   ├── Header.jsx      # En-tête avec profil
            │   └── MainLayout.jsx  # Layout principal
            ├── Auth/
            │   └── LoginPage.jsx   # Page de connexion
            ├── Dashboard/
            │   ├── DashboardHome.jsx  # Tableau de bord avec graphiques
            │   └── StatCard.jsx       # Carte KPI réutilisable
            ├── Employees/
            │   ├── EmployeeList.jsx    # Liste des employés
            │   ├── EmployeeForm.jsx    # Formulaire ajout/modif
            │   └── EmployeeDetail.jsx  # Fiche employé
            ├── Payroll/
            │   ├── PayrollList.jsx         # Liste des bulletins
            │   ├── PayrollCalculation.jsx  # Calcul de la paie
            │   └── PayrollParams.jsx       # Paramètres de paie
            ├── Contracts/
            │   ├── ContractList.jsx    # Liste des contrats
            │   └── ContractForm.jsx    # Création de contrat
            ├── Recruitment/
            │   ├── RecruitmentList.jsx # Offres de recrutement
            │   └── RecruitmentForm.jsx # Création d'offre
            ├── Absences/
            │   ├── AbsenceList.jsx     # Liste des absences
            │   └── AbsenceForm.jsx     # Demande d'absence
            └── Reports/
                └── ReportsPage.jsx     # Rapports avec graphiques
```

---

## 4. Modules Fonctionnels

### 4.1 Gestion des Employés
- **Création** d'un nouvel employé avec toutes ses informations (personnelles, contact, professionnelles, bancaires)
- **Modification** des données d'un employé existant
- **Consultation** de la fiche détaillée d'un employé
- **Recherche** par nom, prénom ou numéro d'employé
- **Filtrage** par département et par statut (actif, en congé, suspendu, terminé)
- **Pagination** des résultats
- **Génération automatique** du numéro d'employé (EMP-XXXX)

### 4.2 Gestion de la Paie
- **Calcul automatisé** de la paie mensuelle conforme à la législation tunisienne :
  - CNSS salariale (9,18%) et patronale (16,57%)
  - IRPP selon les tranches fiscales tunisiennes
  - Heures supplémentaires (1,5x le taux horaire)
  - Primes de transport et de présence
- **Paramètres de paie** configurables (taux, primes, taxes)
- **Approbation** et **paiement** des bulletins
- **Historique** des bulletins de paie

### 4.3 Gestion des Contrats
- **Création** de contrats (CDI, CDD, Stage, Freelance)
- **Suivi de statut** (actif, expiré, résilié, suspendu)
- **Alerte** des contrats arrivant à expiration (dans les 30 jours)
- **Association** contrat-employé

### 4.4 Gestion du Recrutement
- **Publication** d'offres de recrutement avec descriptions de poste
- **Gestion des candidatures** (ajout, notation, changement de statut)
- **Pipeline de recrutement** : Nouveau → Présélectionné → Entretien → Offre → Embauché/Rejeté
- **Suivi** du nombre de candidats par offre

### 4.5 Gestion des Absences
- **Demande d'absence** pour différents types (congé annuel, maladie, maternité, etc.)
- **Calcul automatique** de la durée en jours
- **Approbation/Rejet** par les managers
- **Suivi du solde** de congés par employé et par année
- **8 types d'absences** préconfigurés avec soldes par défaut

### 4.6 Rapports & Analyses
- **Rapports visuels** avec graphiques interactifs (Recharts)
- Répartition des salaires par département
- Distribution des types de contrats
- Histogramme de distribution salariale
- Répartition des absences par type
- Tableau des contrats expirant bientôt

---

## 5. Base de Données

### Schéma Relationnel

Le schéma comprend **13 tables** :

| Table                 | Description                            |
|----------------------|----------------------------------------|
| `users`              | Comptes utilisateurs (auth)            |
| `departments`        | Départements de l'entreprise           |
| `positions`          | Postes/fonctions                       |
| `employees`          | Données complètes des employés (30+ colonnes) |
| `payroll_parameters` | Paramètres de calcul de la paie        |
| `payroll`            | Bulletins de paie calculés             |
| `contracts`          | Contrats de travail                    |
| `recruitment`        | Offres de recrutement                  |
| `candidates`         | Candidatures aux offres                |
| `promotions`         | Historique des promotions              |
| `absence_types`      | Types d'absences avec soldes           |
| `absences`           | Demandes d'absences                    |
| `audit_log`          | Journal d'audit des actions            |

### Données Pré-chargées
- **1 administrateur** par défaut
- **8 départements** (Direction Générale, RH, Finance, IT, etc.)
- **10 postes** (Directeur, Développeur, Comptable, etc.)
- **10 employés** échantillons avec données réalistes (noms tunisiens)
- **Paramètres de paie** tunisiens (CNSS, IRPP, SMIG)
- **8 types d'absences** (Congé annuel : 26j, Maladie : 15j, Maternité : 60j, etc.)

---

## 6. Sécurité

La plateforme implémente les bonnes pratiques de sécurité OWASP :

| Mesure                     | Implémentation                                  |
|---------------------------|--------------------------------------------------|
| **Authentification**       | JWT (JSON Web Tokens) avec expiration (24h)      |
| **Hachage des mots de passe** | bcrypt avec 12 rounds de salt                |
| **Contrôle d'accès**       | Middleware de rôles (admin, hr_manager, hr_officer, manager, user) |
| **En-têtes HTTP**          | Helmet.js (XSS, clickjacking, sniffing, etc.)   |
| **CORS**                   | Whitelist de domaines autorisés                  |
| **Rate Limiting**          | 200 requêtes / 15 minutes par IP                |
| **Injection SQL**          | Requêtes paramétrées (pg library)                |
| **Validation des entrées** | express-validator sur toutes les routes          |
| **Gestion des erreurs**    | Handler centralisé (pas de stack traces en prod) |
| **Audit**                  | Table audit_log pour traçabilité                 |

---

## 7. Tableau de Bord & Monitoring

### 7.1 KPIs Principaux
Le tableau de bord principal affiche 8 indicateurs clés en temps réel :

1. **Total Employés** — Nombre total et actifs
2. **Masse Salariale** — Coût mensuel total en TND
3. **Absences en attente** — Nombre de demandes à approuver
4. **Recrutements ouverts** — Postes à pourvoir
5. **Taux de Rotation** — Turnover sur 12 mois
6. **Ancienneté Moyenne** — Moyenne en années
7. **Taux d'Absentéisme** — Pourcentage mensuel
8. **Coût Moyen par Employé** — Salaire brut moyen

### 7.2 Graphiques de Monitoring (10 visualisations)

| Graphique                        | Type           | Données                         |
|---------------------------------|----------------|----------------------------------|
| Effectif par Département         | Bar Chart (H)  | Nombre d'employés/département    |
| Répartition par Genre            | Donut Chart    | Hommes vs Femmes                 |
| Évolution Masse Salariale        | Area Chart     | Brut, Net, Retenues par mois     |
| Distribution des Salaires        | Bar Chart      | Tranches salariales              |
| Absences par Type                | Donut Chart    | Jours d'absence par type         |
| Types de Contrats                | Pie Chart      | CDI, CDD, Stage, Freelance       |
| Ancienneté                       | Radar Chart    | Distribution par tranche         |
| Budget Salarial par Département  | Bar Chart      | Masse salariale par service      |
| Pipeline de Recrutement          | Bar Chart      | Étapes du processus              |
| Embauches Récentes               | Line Chart     | Trend sur 6 mois                 |

### 7.3 Alertes & Actions Rapides
- Contrats arrivant à expiration (30 jours)
- Liens rapides vers les actions courantes
- Indicateurs de tendance (hausse/baisse)

---

## 8. Guide d'Installation

### Prérequis
- **Docker** et **Docker Compose** installés
- **Node.js 20+** (pour développement local sans Docker)
- **PostgreSQL 16** (pour développement local sans Docker)
- **Git**

### Option A : Avec Docker (Recommandé) 🐳

```bash
# 1. Cloner le dépôt
git clone https://github.com/selimsoussi1/gestion-des-ressource-humain-.git
cd gestion-des-ressource-humain-

# 2. Lancer les containers
docker-compose up --build

# 3. Exécuter les migrations (première fois uniquement)
# Se connecter au conteneur backend :
docker exec -it grh-backend sh
# Puis exécuter :
node -e "
const fs = require('fs');
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const sql = fs.readFileSync('./src/database/migrations/001_initial_schema.sql', 'utf8');
pool.query(sql).then(() => { console.log('Migration OK'); pool.end(); }).catch(e => { console.error(e); pool.end(); });
"

# 4. Accéder à l'application
# Frontend : http://localhost:5173
# Backend  : http://localhost:5000
```

### Option B : Sans Docker (Développement Local)

```bash
# 1. Cloner le dépôt
git clone https://github.com/selimsoussi1/gestion-des-ressource-humain-.git
cd gestion-des-ressource-humain-

# 2. Installer PostgreSQL et créer la base
psql -U postgres
CREATE DATABASE grh_database;
CREATE USER grh_admin WITH PASSWORD 'grh_secure_password_2026';
GRANT ALL PRIVILEGES ON DATABASE grh_database TO grh_admin;
\q

# 3. Exécuter la migration
psql -U grh_admin -d grh_database -f backend/src/database/migrations/001_initial_schema.sql

# 4. Configurer le backend
cd backend
cp .env.example .env
# Modifier .env : DB_HOST=localhost
npm install
npm run dev    # Démarre sur http://localhost:5000

# 5. Configurer le frontend (dans un autre terminal)
cd frontend
npm install
npm run dev    # Démarre sur http://localhost:5173
```

---

## 9. Guide d'Utilisation

### 9.1 Connexion
1. Ouvrir `http://localhost:5173` dans le navigateur
2. Se connecter avec les identifiants par défaut (voir section 11)

### 9.2 Navigation
Le menu latéral (sidebar) permet d'accéder à tous les modules :
- 🏠 **Tableau de Bord** — Vue d'ensemble avec KPIs et graphiques
- 👥 **Employés** — Gestion complète des employés
- 💰 **Paie** — Calcul et gestion des bulletins de paie
- 📄 **Contrats** — Gestion des contrats de travail
- 🎯 **Recrutement** — Offres et candidatures
- 📅 **Absences** — Demandes et approbation des congés
- 📊 **Rapports** — Analyses visuelles détaillées

### 9.3 Workflows Principaux

#### Ajouter un Employé
1. Aller dans **Employés** → **Ajouter un employé**
2. Remplir les 4 sections du formulaire
3. Cliquer sur **Enregistrer**

#### Calculer la Paie
1. Aller dans **Paie** → **Calculer la paie**
2. Sélectionner l'employé, le mois et l'année
3. Saisir les heures supplémentaires et primes éventuelles
4. Cliquer sur **Calculer** → Le détail apparaît (brut, CNSS, IRPP, net)
5. Approuver puis marquer comme payé

#### Gérer les Absences
1. Un employé crée une demande via **Absences** → **Nouvelle demande**
2. Un manager ou RH peut **Approuver** ou **Rejeter** depuis la liste
3. Le solde de congés est mis à jour automatiquement

#### Gérer un Recrutement
1. Créer une offre dans **Recrutement** → **Nouvelle offre**
2. Ajouter des candidats à l'offre
3. Évaluer et changer le statut des candidats
4. Clôturer l'offre quand le poste est pourvu

---

## 10. API REST — Endpoints

### Authentification
| Méthode | Endpoint          | Description          |
|---------|-------------------|----------------------|
| POST    | `/api/auth/login` | Connexion            |
| POST    | `/api/auth/register` | Inscription       |
| GET     | `/api/auth/me`    | Profil connecté      |

### Employés
| Méthode | Endpoint              | Description             |
|---------|-----------------------|-------------------------|
| GET     | `/api/employees`      | Liste (pagination, filtres) |
| GET     | `/api/employees/:id`  | Détail d'un employé     |
| POST    | `/api/employees`      | Créer un employé        |
| PUT     | `/api/employees/:id`  | Modifier un employé     |
| DELETE  | `/api/employees/:id`  | Supprimer un employé    |

### Paie
| Méthode | Endpoint                  | Description               |
|---------|---------------------------|---------------------------|
| GET     | `/api/payroll`            | Liste des bulletins       |
| POST    | `/api/payroll/calculate`  | Calculer un bulletin      |
| GET     | `/api/payroll/parameters` | Paramètres de paie        |
| POST    | `/api/payroll/parameters` | Ajouter un paramètre      |
| PATCH   | `/api/payroll/:id/approve`| Approuver un bulletin     |
| PATCH   | `/api/payroll/:id/pay`    | Marquer comme payé        |

### Contrats
| Méthode | Endpoint              | Description             |
|---------|-----------------------|-------------------------|
| GET     | `/api/contracts`      | Liste des contrats      |
| POST    | `/api/contracts`      | Créer un contrat        |
| PUT     | `/api/contracts/:id`  | Modifier un contrat     |

### Recrutement
| Méthode | Endpoint                          | Description                |
|---------|-----------------------------------|----------------------------|
| GET     | `/api/recruitment`                | Liste des offres           |
| POST    | `/api/recruitment`                | Créer une offre            |
| PUT     | `/api/recruitment/:id`            | Modifier une offre         |
| POST    | `/api/recruitment/:id/candidates` | Ajouter un candidat        |
| PATCH   | `/api/recruitment/:rid/candidates/:cid` | Modifier un candidat |

### Absences
| Méthode | Endpoint                    | Description              |
|---------|-----------------------------|--------------------------|
| GET     | `/api/absences`             | Liste des absences       |
| POST    | `/api/absences`             | Demander une absence     |
| GET     | `/api/absences/types`       | Types d'absences         |
| GET     | `/api/absences/balance/:id` | Solde de congés          |
| PATCH   | `/api/absences/:id/approve` | Approuver une absence    |
| PATCH   | `/api/absences/:id/reject`  | Rejeter une absence      |

### Tableau de Bord
| Méthode | Endpoint              | Description           |
|---------|-----------------------|-----------------------|
| GET     | `/api/dashboard/stats`| Statistiques globales |
| GET     | `/api/dashboard/kpi`  | Indicateurs KPI       |

### Départements
| Méthode | Endpoint              | Description             |
|---------|-----------------------|-------------------------|
| GET     | `/api/departments`    | Liste des départements  |
| POST    | `/api/departments`    | Créer un département    |

---

## 11. Identifiants par Défaut

| Champ            | Valeur                  |
|-----------------|-------------------------|
| **Email**        | `admin@grh.tn`          |
| **Mot de passe** | `Admin@2026`            |
| **Rôle**         | Administrateur (admin)  |

> ⚠️ **Important** : Changez le mot de passe administrateur après la première connexion en production.

---

## 12. Technologies Utilisées

### Backend
| Technologie       | Version | Rôle                        |
|------------------|---------|-----------------------------|
| Node.js          | 20.x    | Runtime JavaScript          |
| Express.js       | 4.18    | Framework HTTP              |
| PostgreSQL       | 16      | Base de données relationnelle |
| pg               | 8.11    | Driver PostgreSQL           |
| jsonwebtoken     | 9.0     | Authentification JWT        |
| bcryptjs         | 2.4     | Hachage mots de passe       |
| helmet           | 7.1     | Sécurité HTTP               |
| cors             | 2.8     | Cross-Origin Requests       |
| express-rate-limit | 7.1   | Protection anti-brute force |
| express-validator | 7.0    | Validation des entrées      |
| morgan           | 1.10    | Logging HTTP                |
| winston          | 3.11    | Logging applicatif          |
| multer           | 1.4     | Upload de fichiers          |
| dotenv           | 16.3    | Variables d'environnement   |
| uuid             | 9.0     | Génération d'identifiants   |

### Frontend
| Technologie       | Version | Rôle                          |
|------------------|---------|-------------------------------|
| React            | 18.2    | Framework UI                  |
| Vite             | 5.0     | Build tool & dev server       |
| Tailwind CSS     | 3.4     | Framework CSS utilitaire      |
| Recharts         | 2.10    | Graphiques et visualisations  |
| React Router     | 6.21    | Routage SPA                   |
| Axios            | 1.6     | Client HTTP                   |
| React Icons      | 4.12    | Icônes                        |
| React Hot Toast  | 2.4     | Notifications                 |
| date-fns         | 3.2     | Manipulation de dates         |

### DevOps
| Technologie      | Rôle                          |
|-----------------|-------------------------------|
| Docker           | Conteneurisation              |
| Docker Compose   | Orchestration multi-conteneurs |
| Git              | Versionnement du code         |
| GitHub           | Hébergement du dépôt          |

---

## 📝 Notes Finales

- L'application est configurée pour le contexte **tunisien** (monnaie TND, paramètres CNSS/IRPP, SMIG)
- Le calcul de paie respecte les tranches d'imposition IRPP tunisiennes
- Les données de démonstration utilisent des noms et villes tunisiennes
- Le port frontend (5173) peut être changé dans `vite.config.js`
- Le port backend (5000) peut être changé dans `backend/.env`

---

*Rapport généré automatiquement — Projet GRH © 2025*
