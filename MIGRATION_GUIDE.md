# Migration de MongoDB vers Neon PostgreSQL

Ce guide explique comment migrer l'application FMindset de MongoDB vers Neon PostgreSQL.

## Changements effectués

### 1. Dépendances
- ❌ Supprimé : `mongoose`
- ✅ Ajouté : `drizzle-orm`, `@neondatabase/serverless`, `drizzle-kit`

### 2. Structure de base de données

#### Ancien (MongoDB)
```javascript
// Collections: assessments, userprofiles
// Documents avec ObjectId
```

#### Nouveau (PostgreSQL)
```sql
-- Tables: assessments, user_profiles
-- UUID comme clés primaires
-- Types enum pour validation
-- Contraintes de validation
```

### 3. Fichiers modifiés

#### Supprimés
- `src/services/mongooseModels.ts`

#### Ajoutés
- `src/db/schema.ts` - Schéma Drizzle ORM
- `src/db/connection.ts` - Connexion PostgreSQL
- `src/services/databaseService.ts` - Service de base de données
- `src/services/databaseService.test.ts` - Tests du service
- `drizzle.config.ts` - Configuration Drizzle
- `src/db/migrations/0001_initial.sql` - Migration initiale

#### Modifiés
- `package.json` - Nouvelles dépendances et scripts
- `src/app/api/assessment/submit/route.ts` - Utilise le nouveau service
- `src/types/assessment.ts` - Suppression de `assessmentId`
- `.env.example` - Variable `DATABASE_URL` au lieu de `MONGODB_URI`

## Instructions de déploiement

### 1. Installer les dépendances
```bash
npm install
```

### 2. Configurer Neon
1. Créer un compte sur [Neon](https://neon.tech)
2. Créer une nouvelle base de données
3. Copier l'URL de connexion

### 3. Configuration environnement
```bash
# Copier le fichier d'exemple
cp .env.example .env.local

# Modifier DATABASE_URL avec votre URL Neon
DATABASE_URL=postgresql://username:password@ep-example-123456.us-east-1.aws.neon.tech/neondb?sslmode=require
```

### 4. Exécuter les migrations
```bash
# Générer les migrations
npm run db:generate

# Appliquer les migrations
npm run db:migrate
```

### 5. Vérifier la migration
```bash
# Lancer les tests
npm test

# Démarrer le serveur de développement
npm run dev
```

## Avantages de PostgreSQL/Neon

### Performance
- ✅ Requêtes SQL optimisées
- ✅ Index sur les colonnes fréquemment utilisées
- ✅ Contraintes de validation au niveau base de données

### Développement
- ✅ Types TypeScript générés automatiquement
- ✅ Migrations versionnées
- ✅ Interface d'administration avec Drizzle Studio

### Production
- ✅ Scaling automatique avec Neon
- ✅ Backups automatiques
- ✅ Monitoring intégré

## Commandes utiles

```bash
# Générer le schéma TypeScript
npm run db:generate

# Appliquer les migrations
npm run db:migrate

# Ouvrir Drizzle Studio (interface d'administration)
npm run db:studio

# Lancer les tests
npm test

# Build de production
npm run build
```

## Structure des données

### Table `user_profiles`
```sql
id              UUID PRIMARY KEY
od_id           TEXT UNIQUE NOT NULL
is_anonymous    BOOLEAN DEFAULT true
pseudonym       TEXT
password_hash   TEXT
created_at      TIMESTAMP DEFAULT now()
```

### Table `assessments`
```sql
id                  UUID PRIMARY KEY
user_id             TEXT NOT NULL
answers             JSONB NOT NULL (array of 25 A/B/C/D)
imposter_syndrome   INTEGER (0-100)
founder_doubt       INTEGER (0-100)
identity_fusion     INTEGER (0-100)
fear_of_rejection   INTEGER (0-100)
risk_tolerance      INTEGER (0-100)
motivation_type     ENUM('intrinsic', 'extrinsic', 'mixed')
isolation_level     INTEGER (0-100)
archetype           ENUM(8 archetype names)
groq_insights       TEXT
created_at          TIMESTAMP DEFAULT now()
updated_at          TIMESTAMP DEFAULT now()
```

## Rollback (si nécessaire)

Si vous devez revenir à MongoDB :

1. Restaurer les dépendances dans `package.json`
2. Restaurer `src/services/mongooseModels.ts`
3. Restaurer l'ancienne API route
4. Changer `DATABASE_URL` vers `MONGODB_URI`

## Support

Pour toute question sur la migration, consultez :
- [Documentation Drizzle ORM](https://orm.drizzle.team/)
- [Documentation Neon](https://neon.tech/docs)
- [Guide de migration PostgreSQL](https://www.postgresql.org/docs/current/migration.html)