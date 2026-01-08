# FMindset - Founder Psychology Assessment

Une application Next.js pour évaluer le profil psychologique des jeunes entrepreneurs (16-24 ans).

## 🚀 Fonctionnalités

- **Évaluation psychologique complète** : 25 questions couvrant 7 dimensions psychologiques
- **8 archétypes de fondateurs** : Classification personnalisée basée sur les scores
- **Insights IA** : Recommandations personnalisées générées par Groq AI
- **Interface responsive** : Optimisée pour mobile et desktop
- **Accès anonyme** : Pas besoin d'email pour commencer
- **Gestion d'erreurs robuste** : Sauvegarde locale et récupération de session

## 🏗️ Architecture

### Dimensions psychologiques mesurées :
1. **Syndrome de l'imposteur** (Q1-5)
2. **Doute du fondateur** (Q6-9)
3. **Fusion identitaire** (Q10-13)
4. **Peur du rejet** (Q14-18)
5. **Tolérance au risque** (Q19-21)
6. **Type de motivation** (Q22-24)
7. **Niveau d'isolement** (Q25)

### Archétypes de fondateurs :
- Perfectionist Builder
- Opportunistic Visionary
- Isolated Dreamer
- Burning Out (urgent)
- Self-Assured Hustler
- Community-Driven
- Balanced Founder
- Growth Seeker

## 🛠️ Installation

### Prérequis
- Node.js 18+ 
- npm ou yarn

### Installation des dépendances

```bash
npm install
```

### Configuration

1. **Variables d'environnement** (optionnel pour Groq AI) :
```bash
# .env.local
GROQ_API_KEY=your_groq_api_key_here
MONGODB_URI=your_mongodb_connection_string
```

2. **Base de données** :
   - MongoDB pour la persistance des évaluations
   - Les schémas sont définis dans `src/services/mongooseModels.ts`

## 🚀 Utilisation

### Développement
```bash
npm run dev
```
L'application sera disponible sur http://localhost:3000

### Production
```bash
npm run build
npm start
```

### Tests
```bash
npm test
```

## 📁 Structure du projet

```
src/
├── app/                          # Pages Next.js App Router
│   ├── api/                      # Routes API
│   │   ├── assessment/submit/    # Soumission d'évaluation
│   │   └── groq/insights/        # Génération d'insights IA
│   ├── assessment/               # Pages d'évaluation
│   │   ├── quiz/                 # Quiz de 25 questions
│   │   └── results/              # Affichage des résultats
│   └── dashboard/                # Tableau de bord
├── components/                   # Composants React
│   └── Assessment/               # Composants d'évaluation
├── services/                     # Services métier
│   ├── assessmentService.ts      # Logique de scoring
│   ├── groqService.ts           # Intégration Groq AI
│   └── mongooseModels.ts        # Modèles MongoDB
├── types/                        # Types TypeScript
├── utils/                        # Utilitaires
│   ├── constants.ts             # Questions et constantes
│   ├── archetypes.ts            # Définitions des archétypes
│   └── errorHandler.ts          # Gestion d'erreurs
└── tests/                        # Tests unitaires et PBT
```

## 🧪 Tests

Le projet utilise une approche de test complète :

- **Tests unitaires** : Vitest pour les cas spécifiques
- **Tests basés sur les propriétés** : fast-check pour la validation universelle
- **56 tests** couvrant toutes les fonctionnalités critiques

### Exécution des tests :
```bash
npm test                    # Tous les tests
npm test -- --watch        # Mode watch
```

## 🔧 Technologies utilisées

- **Frontend** : Next.js 16, React 19, TypeScript
- **Styling** : Tailwind CSS 4
- **Base de données** : MongoDB avec Mongoose
- **IA** : Groq API (Mixtral 8x7b)
- **Tests** : Vitest, fast-check
- **Authentification** : NextAuth.js (préparé)

## 📊 Flux utilisateur

1. **Accueil** → Présentation de l'évaluation
2. **Quiz** → 25 questions avec navigation et sauvegarde automatique
3. **Résultats** → Affichage immédiat des scores et archétype
4. **Insights** → Chargement asynchrone des recommandations IA
5. **Dashboard** → Gestion des évaluations (futur)

## 🛡️ Gestion d'erreurs

- **Hors ligne** : Sauvegarde locale avec synchronisation
- **Expiration de session** : Récupération automatique des réponses
- **Erreurs API** : Messages utilisateur génériques, logs détaillés
- **Échec Groq** : Texte de fallback, pas de blocage des résultats

## 🚀 Déploiement

L'application est prête pour le déploiement sur :
- Vercel (recommandé pour Next.js)
- Netlify
- AWS/GCP/Azure

### Variables d'environnement requises :
```
GROQ_API_KEY=xxx
MONGODB_URI=xxx
NEXTAUTH_SECRET=xxx
NEXTAUTH_URL=xxx
```

## 📈 Prochaines étapes

- [ ] Authentification complète avec NextAuth
- [ ] Historique des évaluations
- [ ] Tableau de bord avancé
- [ ] Comparaisons temporelles
- [ ] Recommandations personnalisées étendues
- [ ] Intégration avec d'autres services de santé mentale

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence ISC.

## 🆘 Support

Pour toute question ou problème :
1. Vérifier les [issues existantes](../../issues)
2. Créer une nouvelle issue avec les détails
3. Consulter la documentation dans `/docs` (à venir)

---

**Note** : Cette application est conçue comme un outil de support et ne remplace pas un conseil psychologique professionnel.