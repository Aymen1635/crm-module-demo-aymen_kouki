# Module CRM

Un module CRM minimal orienté production, construit avec **NestJS 11**, **Next.js 15 (App Router)**, **Prisma 7**, et **PostgreSQL**.

---

## Stack Technique

| Couche | Technologie |
|---|---|
| Backend | NestJS 11 + TypeScript strict |
| Frontend | Next.js 15 (App Router) + TypeScript strict |
| ORM | Prisma 7 |
| Base de données | PostgreSQL 15+ |
| Validation | class-validator + class-transformer |

---

## Prérequis

- Node.js ≥ 20
- npm ≥ 10
- Docker (recommandé pour lancer PostgreSQL facilement) ou PostgreSQL 15+ en local

---

## Démarrage Rapide (Lancement en - de 5 min)

Suivez ces étapes simples pour lancer le projet :

### 1 — Installer les dépendances

```bash
# À la racine du projet, installez toutes les dépendances (backend et frontend)
npm install
```

> **VS Code :** Le client Prisma est généré automatiquement pendant `npm install`. Si vous voyez des erreurs TypeScript dans l'éditeur, faites `Ctrl+Shift+P` → **"Developer: Reload Window"** pour que le serveur TypeScript prenne en compte les types générés.

### 2 — Configurer l'environnement

Les variables d'environnement sont nécessaires pour connecter la base de données et l'API.

**Backend (`Backend/.env`) :**
Créez un fichier `.env` dans le dossier `Backend/` avec ce contenu :
```env
DATABASE_URL="postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/crm_dev"
PORT=3001
STAGNANT_THRESHOLD_DAYS=14
```

**Frontend (`Frontend/.env.local`) :**
Créez un fichier `.env.local` dans le dossier `Frontend/` avec ce contenu :
```env
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

### 3 — Lancer la base de données (PostgreSQL)

```bash
# Démarre une instance PostgreSQL via Docker en arrière-plan
docker compose up -d
```
*(Si vous avez déjà PostgreSQL d'installé en local, assurez-vous juste que l'URL dans `Backend/.env` est correcte).*

### 4 — Initialiser la base de données

Cette étape va créer les tables et ajouter des données de test (clients et opportunités) :
```bash
npm run db:migrate   # Applique les migrations Prisma (génère aussi le client Prisma)
npm run db:seed      # Injecte les fausses données
```

> **Note :** Le client Prisma est aussi généré automatiquement lors du `npm install` (script `postinstall`), ce qui garantit que les types TypeScript sont disponibles dès l'ouverture du projet dans votre IDE.

### 5 — Démarrer l'application

```bash
# Lance le backend (port 3001) et le frontend (port 3000) en même temps
npm run dev
```

> **Note :** Le frontend utilisera automatiquement `wait-on` pour attendre que le backend soit prêt avant de démarrer, évitant ainsi les erreurs au premier lancement.

Ouvrez ensuite [http://localhost:3000](http://localhost:3000) dans votre navigateur ! 🎉

---

## Commandes Utiles

Si vous souhaitez lancer les environnements séparément :

```bash
# Backend uniquement
npm run dev:backend       # Lance NestJS sur :3001
npm run db:studio         # Ouvre Prisma Studio pour explorer la base de données

# Frontend uniquement
npm run dev:frontend      # Lance Next.js sur :3000 (attend le backend)
```

---

## Structure du projet

```text
crm-module-demo-aymen/
├── Backend/              # API NestJS
│   ├── prisma/           # Schéma Prisma, migrations et seed
│   └── src/
│       ├── clients/      # Gestion des clients
│       ├── opportunities/# Gestion des opportunités
│       ├── pipeline/     # Agrégation des données
│       ├── prisma/       # Service Prisma
│       └── common/       # Filtres, types et utilitaires partagés
└── Frontend/             # Interface Next.js (App Router)
    └── src/
        ├── app/          # Pages et layouts de l'application
        ├── components/   # Composants réutilisables (UI)
        ├── lib/          # Client API
        └── hooks/        # Hooks React personnalisés
```

---

## Décisions Techniques

Consultez le fichier [decisions.md](./decisions.md) pour lire en détail les choix d'architecture. Voici un résumé :

- **Clients (Table unique)** — Une seule table `clients` avec un champ discriminant `type` (`COMPANY` ou `INDIVIDUAL`).
- **Suppression logique (Soft delete)** — Un horodatage `deletedAt` est utilisé ; rien n'est physiquement supprimé de la base de données.
- **Montants en centimes** — Le champ `amountCents` (entier) évite les erreurs de précision liées aux nombres flottants.
- **Indicateurs de risque** — Les états "En retard" (`late`) ou "Stagnant" (`stagnant` > 14 jours) sont calculés dynamiquement par le service.
- **Agrégation Pipeline** — `GET /api/pipeline/summary` retourne les totaux par étape et la valeur à risque.

---

## Limitations Connues (Périmètre Prototype)

- Aucune authentification / gestion des autorisations.
- Le champ `amountCents` est un entier 32-bit (suffisant pour le test, prévoir un `BigInt` pour la production).
- Le délai de stagnation (14 jours) n'est pas modifiable depuis l'interface utilisateur.
- Aucune suppression physique n'est exposée via l'API.
