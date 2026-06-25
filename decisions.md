# DECISIONS

Ce document explique les hypothèses, arbitrages et choix techniques retenus pour le module CRM demandé dans le take-home.

## Objectif

Le besoin métier est volontairement imprécis. J'ai donc transformé la demande en un petit produit cohérent, livrable rapidement, mais suffisamment propre pour être repris par une équipe. Le but n'est pas de sur-concevoir, mais de faire des choix explicites, stables et faciles à maintenir. 

## Périmètre retenu

Le module couvre deux entités principales : `Client` et `Opportunity`. Un client peut être une entreprise ou un particulier, et une opportunité appartient à un seul client. Le produit expose un CRUD d'opportunités, une liste filtrable/paginée, un endpoint d'agrégation pour le pipeline, et une interface Next.js pour naviguer entre liste, détail et formulaire. 

## Modèle client

J'ai choisi un modèle à table unique pour les clients, avec un champ discriminant `type` valant `COMPANY` ou `INDIVIDUAL`. Ce choix simplifie les requêtes, les relations Prisma, les filtres côté API, et l'affichage dans l'UI. Il évite aussi de multiplier les joins pour un périmètre aussi réduit. 

### Champs pour une entreprise

Pour une entreprise, je retiens les champs suivants :
- `companyName` — nom commercial, obligatoire pour les entreprises.
- `legalId` — identifiant légal (SIRET en France), optionnel mais spécifique aux entreprises. Ce champ est absent chez les particuliers, ce qui constitue la principale différence de modèle entre les deux types de clients.
- `email` — partagé avec les particuliers, il représente l'email de contact principal.
- `phone` — partagé, optionnel.
- `address` — partagé, optionnel.
- `notes` — partagé, optionnel.

### Champs pour un particulier

Pour un particulier, je retiens les champs suivants :
- `firstName` — obligatoire pour les particuliers.
- `lastName` — obligatoire pour les particuliers.
- `email` — partagé.
- `phone` — partagé, optionnel.
- `address` — partagé, optionnel.
- `notes` — partagé, optionnel.

### Champs communs

Les deux types partagent :
- `id`.
- `type`.
- `createdAt`.
- `updatedAt`.
- `deletedAt`.

### Justification du modèle à table unique

Les champs `companyName` et `legalId` sont `null` pour les particuliers, et `firstName`/`lastName` sont `null` pour les entreprises. La validation côté DTO enforce les champs obligatoires selon le type (`@ValidateIf`). Ce compromis est acceptable pour ce périmètre : si les deux types devaient avoir des comportements très différents (pipelines distincts, relations différentes), un modèle polymorphique avec tables séparées serait justifié.

## Modèle opportunité

Une opportunité contient :
- `id`.
- `clientId`.
- `title`.
- `amountCents`.
- `currency`.
- `expectedSignatureDate`.
- `stage`.
- `lastStageChangeAt`.
- `createdAt`.
- `updatedAt`.
- `deletedAt`.

Le montant est stocké en centimes entiers (`Int`) pour éviter les problèmes de précision des floats. La devise peut rester `EUR` par défaut. Note : `Int` (32 bits) est plafonné à ~21M EUR — suffisant pour un prototype, à remplacer par `BigInt` en production si nécessaire.

## Pipeline

J'utilise un pipeline simple mais lisible, composé des étapes suivantes :
- `LEAD`.
- `QUALIFIED`.
- `PROPOSAL`.
- `NEGOTIATION`.
- `WON`.
- `LOST`.

Ces étapes sont suffisantes pour un CRM interne minimal sans alourdir le modèle. Elles sont faciles à filtrer, à agréger, et à présenter dans l'UI. 

## Opportunités à problème

J'ai défini deux catégories de risque.

### Opportunité en retard

Une opportunité est considérée en retard si :
- `expectedSignatureDate` est passée.
- `stage` n'est ni `WON` ni `LOST`.

Cela signifie qu'un deal devait être signé mais n'a pas encore été clôturé. C'est un signal clair, simple à comprendre, et utile pour l'équipe commerciale. 

### Opportunité stagnante

Une opportunité est considérée stagnante si :
- `lastStageChangeAt` date de plus de `14 jours`.
- et l'opportunité n'est pas déjà clôturée.

Le seuil de 14 jours est configurable via `STAGNANT_THRESHOLD_DAYS` dans `.env`. 

### Priorité d'affichage

Si une opportunité est à la fois en retard et stagnante, le statut `late` prend la priorité. L'objectif est de rendre le tableau de bord immédiatement actionnable, sans multiplier les badges inutiles.

## Soft delete

J'ai choisi le **soft delete** pour `Client` et `Opportunity`. Une suppression applicative met donc `deletedAt` à la date courante au lieu de supprimer physiquement la ligne. Ce choix conserve l'historique métier, facilite la restauration future, et évite de casser des analyses ou relations existantes. 

### Conséquence technique

Tous les reads standards excluent les enregistrements supprimés via `deletedAt = null`. Les suppressions logiques sont donc cohérentes dans toute l'application. La structure laisse la porte ouverte à une action `restore` qui remettrait `deletedAt` à `null`.

## Agrégation pipeline

L'indicateur le plus utile à afficher est un résumé compact du pipeline, composé de :
- la valeur totale par étape.
- le nombre d'opportunités par étape.
- la valeur totale du pipeline actif (hors WON/LOST).
- la valeur "à risque" (`atRiskCents` / `atRiskCount`) : opportunités en retard.
- la valeur "stagnante" (`stagnantCents` / `stagnantCount`) : opportunités stagnantes (non-retard).

Les deux catégories de risque sont distinguées dans le résumé car elles appellent des actions différentes : une opportunité en retard doit être clôturée ou escaladée, une opportunité stagnante doit être relancée.

Ce format donne à la fois une vision business et une lecture opérationnelle rapide.

### Implémentation DB-level

L'agrégation s'effectue entièrement en base via trois requêtes parallèles :
- `groupBy('stage')` avec `_count` et `_sum` pour la répartition par étape.
- `aggregate` filtré sur `expectedSignatureDate < today` pour les opportunités en retard.
- `aggregate` filtré sur `lastStageChangeAt < stagnantCutoff` ET `expectedSignatureDate >= today` pour les opportunités stagnantes (le filtre `gte today` exclut les deals déjà en retard, cohérent avec la priorité `late > stagnant`).

Les trois requêtes sont lancées en parallèle via `Promise.all`. Aucun enregistrement n'est chargé en mémoire.

## API

### Liste des opportunités

L'endpoint de liste expose :
- filtrage par `stage`.
- filtrage par `clientType`.
- filtrage par `riskLabel` (multi-valeur : `?riskLabel=late&riskLabel=stagnant`) — chaque valeur génère un prédicat SQL distinct, les deux sont combinés en OR. La pagination reste cohérente car le filtre est en base, pas en mémoire.
- tri par `createdAt`, `amountCents`, `expectedSignatureDate`, ou `stage`.
- pagination côté serveur (`page/limit`, défaut 10 par page).

### Visibilité des opportunités à problème

Le filtre `riskLabel` seul ne suffit pas : il repose sur une action utilisateur, or quelqu'un qui ne connaît pas le filtre ne verra jamais les opportunités en retard (elles peuvent être page 5).

J'ai adopté une double approche :
1. **Barre d'alerte proactive** (`AtRiskBar`) — affichée en haut de la liste quand des opportunités à problème existent **et** qu'aucun filtre de risque n'est actif. Elle résume le nombre de deals en retard et stagnants avec des liens d'action directe. Disparaît dès qu'un filtre est appliqué (évite la redondance).
2. **Chips de filtre multi-sélection** — remplace le `<select>` unique. Les deux labels (`Overdue`, `Stagnant`) sont toggleables indépendamment, ce qui permet de voir les deux ensembles sans forcer un mode exclusif.

Je choisis une pagination `page/limit` pour la lisibilité dans un test take-home. Si le dataset grossit, une pagination par curseur pourra être ajoutée plus tard. 

### Détail

L'endpoint de détail renvoie l'opportunité et le client associé avec tous ses champs.

### Création et édition

Les DTOs sont validés côté backend avec `class-validator`. Les règles minimales sont :
- `amountCents > 0`.
- `stage` doit appartenir à l'enum.
- `expectedSignatureDate` doit être une date valide.
- `companyName` / `firstName` / `lastName` ne peuvent pas être des chaînes vides.
- `sortBy` et `order` sont validés avec `@IsIn()` pour rejeter les valeurs inconnues.

### Suppression

La suppression passe par un soft delete. La suppression d'un client est bloquée s'il possède des opportunités actives (retour `409 Conflict`).

## Validation

J'utilise TypeScript strict, `class-validator` et `class-transformer` pour les DTOs NestJS. L'objectif est d'obtenir des erreurs claires, cohérentes et exploitables côté frontend. 

## Gestion des erreurs

Je centralise la gestion des erreurs avec un filtre global NestJS. Les erreurs de validation et les erreurs Prisma connues (P2002, P2003, P2025) sont converties en réponses JSON lisibles avec des codes HTTP cohérents.

La détection des erreurs Prisma utilise `instanceof Prisma.PrismaClientKnownRequestError` (importé depuis `@prisma/client`), ce qui est plus fiable qu'une vérification par `constructor.name` — cette dernière peut silencieusement échouer après minification ou en présence de plusieurs instances Prisma.

## Frontend

L'interface Next.js suit une structure App Router :
- une page liste avec filtres, tri, pagination et récap pipeline.
- une page détail pour une opportunité avec la fiche client complète.
- un formulaire commun de création / édition avec création inline de client.

Les opportunités à problème sont mises en évidence visuellement avec un badge coloré et une alerte contextuelle. Les états de chargement sont gérés par un skeleton screen (`loading.tsx`), les erreurs par `error.tsx`, et les ressources inexistantes par `not-found.tsx`.

## Design du code

Le backend est organisé de manière modulaire :
- `clients` — CRUD clients.
- `opportunities` — CRUD opportunités avec filtres, pagination et labels de risque.
- `pipeline` — agrégation du pipeline.
- `common` — filtres d'exception, types paginés, utilitaires de risque.

Le module `common/utils/opportunity-risk.util.ts` est testé unitairement. Le service `opportunities.service.ts` est testé avec le module de test NestJS et un mock de PrismaService.

## Index et performance

Des index sont définis sur :
- `client.type`.
- `client.deletedAt`.
- `client.email`.
- `opportunity.clientId`.
- `opportunity.stage`.
- `opportunity.expectedSignatureDate`.
- `opportunity.deletedAt`.
- `opportunity.clientId + stage` (composite).
- `opportunity.stage + expectedSignatureDate` (composite).

Ces index couvrent les filtres et tris les plus probables.

## Ce que je ne fais pas

Pour rester dans le périmètre du test, je ne rajoute pas :
- d'authentification complète.
- de rôles complexes.
- de workflow de tâches ou d'activités.
- de reporting avancé.
- de suppression physique dans le flux normal.

## Hypothèses de livraison

- NestJS pour le backend.
- Next.js App Router pour le frontend.
- Prisma + PostgreSQL pour la persistance.
- un dépôt unique pour tout le code.
- un README de démarrage rapide.
- des commits atomiques et descriptifs.

## Synchronisation Frontend/Backend en développement

Afin d'éviter des erreurs de type `ECONNREFUSED` lors du rendu côté serveur (SSR) par Next.js (qui démarre souvent plus vite que NestJS), j'ai ajouté `wait-on` dans les scripts de développement. Le script `dev:frontend` attend que le backend écoute sur le port 3001 (`tcp:3001`) avant de lancer le serveur Next.js. Cela garantit un démarrage propre et sans erreurs lors du lancement de l'application en mode développement.

## Résumé des choix

Structure simple, lecture métier claire, modèle à table unique avec `legalId` pour différencier les entreprises, soft delete, pagination serveur, règles explicites pour les opportunités à problème, et tests unitaires + service pour valider la logique critique.
