# TP 2 - ShopLite : Architecture Hexagonale (Module Commande)

Ce dépôt contient l'implémentation du module Commande de l'application ShopLite en respectant les principes de l'**Architecture Hexagonale (Ports & Adaptateurs)**.

## 🏗️ Structure du Projet

```text
seance2-architecture/tp2-nom1-nom2/
├── domain/                  # Métier pur (Entité Order) - AUCUN import externe
│   └── Order.js
├── application/             # Cas d'utilisation (PlaceOrder) - Ne dépend que du domaine
│   └── PlaceOrder.js
├── adapters/
│   ├── primary/             # Adaptateurs d'entrée (Pilotes)
│   │   └── httpServer.js    # API HTTP (Node.js natif)
│   └── secondary/           # Adaptateurs de sortie (Pilotés)
│       ├── InMemoryOrderRepository.js
│       ├── StaticCatalog.js
│       ├── FakePayment.js   # Plafond de paiement à 500 €
│       └── ConsoleNotifier.js
├── adr/                     # Records de Décisions d'Architecture
│   └── 0001-architecture-hexagonale.md
├── main.js                  # Racine de composition (Composition Root)
├── Order.test.js            # Tests unitaires du Domaine
├── PlaceOrder.test.js       # Tests unitaires du Cas d'Utilisation
└── requests.http            # Requêtes d'exemple pour l'API HTTP


🚀 Préqurequis & Lancement
--------------------------

### 1\. Exécuter les tests unitaires (Sans serveur ni base de données)

```bash
# Tests de l'entité Order (Domaine)
node --test Order.test.js

# Tests du cas d'utilisation PlaceOrder (Application)
node --test PlaceOrder.test.js
```

2\. Démarrer le serveur HTTP

```bash
node main.js
```

Le serveur démarre sur http://localhost:3001


**MéthodeRouteDescriptionCode HTTPPOST**/ordersCréer et payer une commande (CLAVIER x2 = 98 €)

201 Created

**POST**/ordersTenter de payer une commande > 500 € (ECRAN x2 = 598 €)

402 Payment Required

**GET**/orders/:idRécupérer les détails d'une commande enregistrée

200 OK / 404 Not Found

🛡️ Vérification de la Règle d'Architecture
-------------------------------------------

Pour s'assurer que le domaine reste 100 % isolé et n'importe aucun composant d'infrastructure :

```bash
npm run lint:archi
```
