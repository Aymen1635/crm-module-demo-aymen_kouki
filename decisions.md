# DECISIONS

Ce document explique les hypothèses, arbitrages et choix techniques retenus pour le module CRM demandé dans le take-home.

## Objectif

Le besoin métier est volontairement imprécis. J’ai donc transformé la demande en un petit produit cohérent, livrable rapidement, mais suffisamment propre pour être repris par une équipe. Le but n’est pas de sur-concevoir, mais de faire des choix explicites, stables et faciles à maintenir. 

## Périmètre retenu

Le module couvre deux entités principales : `Client` et `Opportunity`. Un client peut être une entreprise ou un particulier, et une opportunité appartient à un seul client. Le produit expose un CRUD d’opportunités, une liste filtrable/paginée, un endpoint d’agrégation pour le pipeline, et une interface Next.js pour naviguer entre liste, détail et formulaire. 

## Modèle client

J’ai choisi un modèle à table unique pour les clients, avec un champ discriminant `type` valant `company` ou `individual`. Ce choix simplifie les requêtes, les relations Prisma, les filtres côté API, et l’affichage dans l’UI. Il évite aussi de multiplier les joins pour un périmètre aussi réduit. 

### Champs pour une entreprise

Pour une entreprise, je retiens les champs suivants :
- `companyName`.
- `legalId` ou `siret` selon le besoin.
- `contactEmail`.
- `contactPhone`.
- `address`.
- `notes` optionnel.

### Champs pour un particulier

Pour un particulier, je retiens les champs suivants :
- `firstName`.
- `lastName`.
- `email`.
- `phone`.
- `address`.
- `notes` optionnel.

### Champs communs

Les deux types partagent :
- `id`.
- `type`.
- `createdAt`.
- `updatedAt`.
- `deletedAt`.

## Modèle opportunité

Une opportunité contient :
- `id`.
- `clientId`.
- `title`.
- `amount`.
- `currency`.
- `expectedSignatureDate`.
- `stage`.
- `lastStageChangeAt`.
- `createdAt`.
- `updatedAt`.
- `deletedAt`.

Le montant est stocké en entier, idéalement en centimes, pour éviter les problèmes de précision des floats. La devise peut rester `EUR` par défaut. 

## Pipeline

J’utilise un pipeline simple mais lisible, composé des étapes suivantes :
- `lead`.
- `qualified`.
- `proposal`.
- `negotiation`.
- `won`.
- `lost`.

Ces étapes sont suffisantes pour un CRM interne minimal sans alourdir le modèle. Elles sont faciles à filtrer, à agréger, et à présenter dans l’UI. 
## Opportunités à problème

J’ai défini deux catégories de risque.

### Opportunité en retard

Une opportunité est considérée en retard si :
- `expectedSignatureDate` est passée.
- `stage` n’est ni `won` ni `lost`.

Cela signifie qu’un deal devait être signé mais n’a pas encore été clôturé. C’est un signal clair, simple à comprendre, et utile pour l’équipe commerciale. 

### Opportunité stagnante

Une opportunité est considérée stagnante si :
- `lastStageChangeAt` date de plus de `14 jours`.
- et l’opportunité n’est pas déjà clôturée.

Le seuil de 14 jours est un choix par défaut raisonnable pour un prototype. Il pourra être rendu configurable via `.env` si nécessaire. 

### Priorité d’affichage

Si une opportunité est à la fois en retard et stagnante, je lui applique le statut le plus critique, c’est-à-dire `late`. L’objectif est de rendre le tableau de bord immédiatement actionnable, sans multiplier les badges inutiles.

## Soft delete

J’ai choisi le **soft delete** pour `Client` et `Opportunity`. Une suppression applicative met donc `deletedAt` à la date courante au lieu de supprimer physiquement la ligne. Ce choix conserve l’historique métier, facilite la restauration future, et évite de casser des analyses ou relations existantes. 

### Conséquence technique

Tous les reads standards doivent exclure les enregistrements supprimés via `deletedAt = null`. Pour éviter les oublis, je centralise ce comportement dans une couche Prisma dédiée, soit via extension, soit via un wrapper de repository. Les suppressions logiques sont donc cohérentes dans toute l’application. 

### Restauration future

Le modèle laisse la porte ouverte à une action `restore`, qui remettrait `deletedAt` à `null`. Je ne l’implémente pas forcément dans le périmètre minimal, mais la structure la rend simple à ajouter. 

## Agrégation pipeline

L’indicateur le plus utile à afficher est un résumé compact du pipeline, composé de :
- la valeur totale par étape.
- le nombre d’opportunités par étape.
- la valeur totale du pipeline actif.
- la valeur “à risque”, c’est-à-dire les opportunités en retard.

Ce format donne à la fois une vision business et une lecture opérationnelle rapide. Il est aussi simple à calculer côté base avec Prisma. 

## API

### Liste des opportunités

L’endpoint de liste expose :
- filtrage par `stage`.
- filtrage par `clientType`.
- tri.
- pagination côté serveur.

Je choisis une pagination `page/limit` pour la lisibilité dans un test take-home. Si le dataset grossit, une pagination par curseur pourra être ajoutée plus tard. 

### Détail

L’endpoint de détail renvoie :
- l’opportunité.
- le client associé.
- les champs nécessaires à l’édition.

### Création et édition

Les DTOs sont validés côté backend. Les règles minimales sont :
- `amount > 0`.
- `stage` doit appartenir à l’enum.
- `expectedSignatureDate` doit être une date valide.
- les champs spécifiques au type de client doivent correspondre au `type`.

### Suppression

La suppression passe par un soft delete. Les routes REST peuvent rester classiques, mais l’action ne supprime jamais définitivement la donnée dans le flux normal.

## Validation

J’utilise TypeScript strict, `class-validator` et `class-transformer` pour les DTOs NestJS. L’objectif est d’obtenir des erreurs claires, cohérentes et exploitables côté frontend. Les validations les plus importantes se font au niveau API pour éviter de dupliquer la logique. 

## Gestion des erreurs

Je centralise la gestion des erreurs avec un filtre global NestJS. Les erreurs de validation et les erreurs Prisma sont converties en réponses JSON lisibles, avec des codes HTTP cohérents. Cela évite de laisser remonter des erreurs techniques brutes au frontend. 

## Frontend

L’interface Next.js suit une structure simple :
- une page liste avec filtres et pagination.
- une page détail pour une opportunité.
- un formulaire commun de création / édition.

Les opportunités à problème sont mises en évidence visuellement avec un badge ou un état couleur. Les états de chargement, d’erreur et de vide sont gérés explicitement pour que l’application reste lisible même quand les données ne sont pas disponibles.

## Design du code

J’organise le backend de manière modulaire :
- `clients`.
- `opportunities`.
- `pipeline`.
- `common` pour les filtres, pipes, exceptions et utilitaires.

Côté frontend, je privilégie des composants réutilisables pour la liste, les filtres, le formulaire et les cartes de statut. Le but est d’avoir un code propre sans sur-architecture.

## Index et performance

Je prévois des index sur :
- `client.type`.
- `opportunity.stage`.
- `opportunity.expectedSignatureDate`.
- `opportunity.deletedAt`.
- `opportunity.clientId`.

Ces index couvrent les filtres et les tris les plus probables. Ils gardent le module réactif sans complexifier la structure. 

## Ce que je ne fais pas

Pour rester dans le périmètre du test, je ne rajoute pas :
- d’authentification complète.
- de rôles complexes.
- de workflow de tâches ou d’activités.
- de reporting avancé.
- de suppression physique dans le flux normal.

Le but est de livrer un module simple, clair et solide, pas une suite CRM complète.

## Hypothèses de livraison

Je pars sur :
- NestJS pour le backend.
- Next.js App Router pour le frontend.
- Prisma + PostgreSQL pour la persistance.
- un dépôt unique pour tout le code.
- un README de démarrage rapide.
- des commits atomiques et descriptifs.

## Résumé des choix

En une phrase : j’ai privilégié une structure simple, une lecture métier claire, un soft delete, une pagination serveur basique, et des règles explicites pour identifier les opportunités problématiques. Ce sont des choix adaptés à un test où le raisonnement et la maintenabilité comptent plus qu’une architecture exhaustive. 