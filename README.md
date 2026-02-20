# 🏢 Plateforme GRH — Gestion des Ressources Humaines

Plateforme complète de gestion des ressources humaines développée avec **React**, **Node.js**, **PostgreSQL** et **Docker**.

## ✨ Fonctionnalités

- 👥 Gestion des employés (CRUD complet, recherche, filtrage)
- 💰 Gestion de la paie (calcul automatisé conforme à la législation tunisienne)
- 📄 Gestion des contrats (CDI, CDD, Stage, Freelance)
- 🎯 Gestion du recrutement (offres + pipeline de candidats)
- 📅 Gestion des absences (demandes, approbation, solde)
- 📊 Tableau de bord avec 10+ graphiques de monitoring (KPIs, charts interactifs)
- 📈 Module de rapports & analyses
- 🔒 Authentification JWT sécurisée avec contrôle d'accès par rôles

## 🚀 Démarrage Rapide

```bash
# Avec Docker
docker-compose up --build

# Frontend : http://localhost:5173
# Backend  : http://localhost:5000
```

**Identifiants par défaut** : `admin@grh.tn` / `Admin@2026`

## 📋 Documentation

Consultez le fichier [RAPPORT.md](RAPPORT.md) pour la documentation complète :
- Architecture & Stack technique
- Guide d'installation détaillé
- Guide d'utilisation
- Documentation API REST
- Schéma de base de données

## 🛠️ Technologies

**Frontend** : React 18, Vite, Tailwind CSS, Recharts  
**Backend** : Node.js, Express.js, JWT, PostgreSQL  
**DevOps** : Docker, Docker Compose  
**Sécurité** : Helmet, CORS, bcrypt, Rate Limiting
