# ManwhaTranslate - Extension Firefox & Studio Webtoons (v0.1.4)

[![Version](https://img.shields.io/badge/version-0.1.4-teal.svg)](https://github.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![Firefox WebExtension](https://img.shields.io/badge/Firefox-WebExtensions-orange.svg)](https://addons.mozilla.org)
[![Languages](https://img.shields.io/badge/Languages-FR%20%7C%20EN%20%7C%20IT%20%7C%20ES%20%7C%20PT-teal.svg)](https://github.com)
[![Status](https://img.shields.io/badge/AMO%20Store-Ready-brightgreen.svg)](https://addons.mozilla.org)

> **ManwhaTranslate** est une extension officielle pour Mozilla Firefox et un studio interactif conçus pour la **traduction instantanée in-situ** des images de manwhas coréens, mangas japonais, manhuas chinois et webcomics.

---

## ✨ Fonctionnalités Principales

* 🎯 **Remplacement Direct In-Situ (par-dessus l'original)** : Les dialogues traduits remplacent directement les bulles originales sur la planche sans dénaturer la mise en page.
* 📐 **Fidélité Géométrique Stricte** :
  * **Bulles Ovales ⬭** : rendu strictement arrondi (`border-radius: 50%`).
  * **Cadres & Boîtes Système ▭** : rendu rectangulaire strict à coins droits.
  * **Bulles de Cri 💥** : bordures accentuées adaptées à l'action.
* 🔠 **Auto-Ajustement de Police (Zero Overflow)** : Calcul automatique de la taille de texte pour garantir qu'aucun mot ne dépasse des bordures de la bulle.
* 🌍 **5 Langues Intégrales Prises en Charge** :
  * 🇫🇷 Français (VF)
  * 🇬🇧 Anglais (English)
  * 🇮🇹 Italien (Italiano)
  * 🇪🇸 Espagnol (Español)
  * 🇵🇹 Portugais (Português)
* ⚡ **Multi-Moteurs de Traduction** :
  * **Mode Gratuit Direct** : opérationnel immédiatement sans aucune clé API requise.
  * **DeepL API** : traductions littéraires et fluides adaptées aux dialogues de webtoons.
  * **Google Cloud Translation** : vitesse et couverture universelle.
  * **Yandex Cloud Translate** : support étendu v1.5 et v2 IAM.
* 👁️ **Détection OCR & Vision IA** : Repérage automatique des coordonnées et des boîtes englobantes des bulles.
* 🎨 **Palette Turquoise Harmonieuse** : Interface moderne, élégante et reposante pour de longues sessions de lecture.

---

## 🚀 Installation Rapide dans Mozilla Firefox

> ⚠️ **IMPORTANT :** Ne glissez pas l'extension dans `about:addons`. Firefox bloque par défaut les extensions locales non signées cryptographiquement par Mozilla et affiche le message trompeur *« Ce module semble être corrompu »*.
> **La méthode officielle de développement est `about:debugging` :**

1. Téléchargez ou clonez le projet, ou générez le fichier `manwha-translate-firefox.zip` depuis le studio.
2. Dans Firefox, ouvrez un nouvel onglet et collez :
   ```text
   about:debugging#/runtime/this-firefox
   ```
3. Dans la section **Ce Firefox** > **Modules temporaires**, cliquez sur **« Charger un module temporaire... »**.
4. Sélectionnez le fichier `manifest.json` (ou l'archive `.zip`).
5. L'icône de l'extension (Runes ᚱ ➔ Traduction) apparaît instantanément dans la barre d'outils Firefox !

---

## 💻 Lancer le Studio Simulateur en Local

Pour prévisualiser et tester les planches en direct :

```bash
# 1. Installer les dépendances
npm install

# 2. Lancer le serveur de développement
npm run dev

# 3. Ouvrir dans votre navigateur
# Rendez-vous sur http://localhost:3000
```

---

## 📤 Comment Envoyer ce Projet sur GitHub ?

Si vous souhaitez créer votre dépôt sur GitHub et publier ce projet :

### Étape 1 : Créer un nouveau dépôt sur GitHub
1. Connectez-vous sur [GitHub.com](https://github.com).
2. Cliquez sur le bouton vert **« New »** (Nouveau dépôt).
3. Nommez votre dépôt (par exemple : `manwha-translate-firefox-addon`).
4. Choisissez **Public** (ou Privé selon votre choix).
5. Ne cochez pas « Add a README » car ce fichier `README.md` est déjà prêt.
6. Cliquez sur **« Create repository »**.

### Étape 2 : Commandes Git depuis votre terminal
Dans le dossier du projet, exécutez les commandes suivantes :

```bash
# Initialiser le dépôt git local (si ce n'est pas déjà fait)
git init

# Ajouter tous les fichiers (le .gitignore protège les node_modules)
git add .

# Enregistrer le commit initial
git commit -m "feat: initial commit v0.1.4 - ManwhaTranslate Firefox WebExtension & Studio"

# Renommer la branche en main
git branch -M main

# Lier votre dépôt GitHub (remplacez VOTRE_PSEUDO et LE_NOM_DU_REPO)
git remote add origin https://github.com/VOTRE_PSEUDO/manwha-translate-firefox-addon.git

# Envoyer sur GitHub
git push -u origin main
```

---

## 📁 Structure du Projet

```text
├── manifest.json              # Manifeste officiel WebExtensions Firefox v2/v3
├── background.js              # Script d'arrière-plan pour gestion des onglets & contexte
├── content.js                 # Détection in-situ, OCR & incrustation des bulles sur les pages
├── content.css                # Styles géométriques stricts (ovale 50%, rect 2px, z-index)
├── popup.html / popup.js      # Interface de l'extension dans la barre d'outils Firefox
├── options.html / options.js  # Page de configuration des clés API (DeepL, Google, Yandex)
├── _locales/                  # Traductions officielles en 5 langues (fr, en, it, es, pt)
│   ├── fr/messages.json
│   ├── en/messages.json
│   ├── it/messages.json
│   ├── es/messages.json
│   └── pt/messages.json
├── icons/                     # Icônes officielles Firefox (16x16, 48x48, 96x96, 128x128)
├── LICENSE                    # Licence libre MIT officielle
├── package.json               # Métadonnées et dépendances de l'application
├── server.ts                  # Serveur proxy de vision et OCR
├── src/                       # Studio interactif React + TypeScript + Tailwind
└── README.md                  # Documentation complète du projet
```

---

## ⚖️ Licence & Droits

Ce projet est distribué sous la **Licence MIT**.  
Vous êtes libre de l'utiliser, de le modifier, de le distribuer et de le soumettre sur le magasin officiel **Mozilla Add-ons Store (AMO)**.

* **Auteur & Contact** : [kasparof57@gmail.com](mailto:kasparof57@gmail.com)
* **Copyright** : (c) 2026 kasparof57@gmail.com
