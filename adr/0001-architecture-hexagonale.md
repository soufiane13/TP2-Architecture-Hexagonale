# ADR-0001: Adoption de l'architecture hexagonale pour le module Commande

Date: 2026-10-21  
Statut: Accepté  
Décideurs: Binôme Dev  

## Contexte
Le module Commande de ShopLite doit évoluer dans un environnement où les détails techniques (prestataire de paiement, base de données, canaux de notification) sont susceptibles de changer. Actuellement, le paiement est simulé avec un plafond de 500 € et les commandes sont stockées en mémoire. À terme, nous devrons intégrer un vrai prestataire bancaire (ex: Stripe) et une base de données PostgreSQL sans impacter la logique métier de la commande.

## Décision
Nous adoptons l'architecture hexagonale (Ports & Adaptateurs) pour le module Commande. Le domaine (`Order`) et le cas d'utilisation (`PlaceOrder`) sont totalement isolés des détails d'infrastructure. Les dépendances extérieures sont inversées et injectées via des ports (contrats).

## Conséquences

### Avantages (+)
- **Testabilité sans infrastructure :** Le domaine et le cas d'utilisation sont testés à 100 % en mémoire sans démarrer de serveur HTTP ni de base de données.
- **Interchangeabilité des adaptateurs :** Le prestataire de paiement et le système de stockage peuvent être remplacés en modifiant uniquement la racine de composition (`main.js`), sans toucher au code métier.

### Inconvénients (-)
- **Indirections et complexité initiale :** Augmentation du nombre de fichiers (ports, adaptateurs, entités) et nécessité de passer par des interfaces/objets de transfert.
- **Traduction d'objets à maintenir :** Nécessité de convertir les modèles de données entre les adaptateurs (ex: JSON HTTP) et les objets du domaine (`Order`).

## Alternatives considérées
- **Architecture en couches classique (Layered Architecture) :** Rejetée car le domaine dépendrait directement des couches basses (base de données, services externes), rendant les tests unitaires plus lourds et le couplage plus fort.

## Contrôle d'architecture
La règle de dépendance est contrôlée automatiquement via la commande `npm run lint:archi`, garantissant qu'aucun fichier du dossier `domain/` n'importe de module extérieur.