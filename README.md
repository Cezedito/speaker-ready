# 🎤 Speaker Ready

Webapp pour progresser en anglais dans la communication des congrès médicaux : un programme d'un an (52 leçons hebdomadaires, A2 → B2) et des mini-jeux.

## Contenu
- **2 parcours thématiques** à suivre en parallèle : Marketing (12 leçons) et Anglais du quotidien au bureau (12 leçons : valider un plan de com' au téléphone, partager son écran, planifier une réunion, messages Slack/Teams…).
- **52 leçons**, une par semaine, réparties en 4 trimestres :
  1. Les bases pro (A2) : se présenter, emails, téléphone, accueil, inscriptions, intervenants…
  2. Partenaires et logistique (B1) : sponsors, devis, stands, hôtels, réclamations, réseaux sociaux…
  3. Presse et médical (B1+) : relations presse, embargo, spécialités, essais cliniques, compliance…
  4. Aisance et nuances (B2) : présenter, négocier, gérer une crise, bilan, faux-amis, idiomes…
- Chaque leçon : 6 mots avec exemple, un point de grammaire, 4 phrases utiles, une astuce métier et un quiz de 6 questions (4/6 pour valider).
- **Révision** : cartes mémoire et quiz de 10 questions sur les leçons faites.
- **Congress Loop**, jeu à niveaux (moteur Phaser 4) : des mots anglais tournent sur un tapis en boucle, il faut servir les commandes en français des marmites avant que le plateau d'attente déborde. 90 niveaux en 6 mondes (un par trimestre, plus les mondes Marketing et Bureau débloqués d'office), étoiles, combos, pièces et bonus (Indice, Gel, Case), niveaux à l'écoute et niveaux inversés.
- **4 jeux rapides** : Paires, Vrai ou faux chrono, Phrase en désordre, Dictée.
- **Oral** : écoute et répétition au micro avec score mot par mot (Chrome / Safari).
- Progression enregistrée dans le navigateur (leçons, mots maîtrisés, records, série de jours).

## Fichiers
| Fichier | Rôle |
|---|---|
| `index.html` | Page et design |
| `manifest.webmanifest`, `icon-*.png`, `apple-touch-icon.png`, `favicon-32.png` | Nom, icône et installation sur l'écran d'accueil |
| `phaser.min.js` | Moteur de jeu Phaser 4.2.1 (licence MIT), utilisé par Congress Loop |
| `loop-phaser.js` | Scène de jeu de Congress Loop (tapis, marmites, combos, effets, sons) |
| `app.js` | Fonctionnement de l'appli |
| `lessons-q1.js` … `lessons-q4.js` | Contenu des leçons, un fichier par trimestre |
| `lessons-marketing.js`, `lessons-quotidien.js` | Parcours thématiques |

## Mettre en ligne avec GitHub Pages
1. Dépose tous les fichiers à la racine du dépôt.
2. **Settings → Pages → Source : Deploy from a branch → `main` / `(root)`**.
3. L'app est en ligne sur `https://<ton-pseudo>.github.io/<nom-du-depot>/`.

Le micro ne fonctionne qu'en https : utilise l'adresse GitHub Pages plutôt que le fichier ouvert en local.

## Modifier une leçon
Chaque leçon des fichiers `lessons-q*.js` suit ce format :
```js
{w:1, q:1, lv:"A2", t:"Titre",
 g:{t:"Point de grammaire", x:"Explication", e:[["Exemple EN","Traduction FR"]]},
 v:[["mot","traduction","Phrase d'exemple"]],   // 6 mots
 p:[["Phrase EN","Phrase FR"]],                  // 4 phrases
 tip:"Astuce métier"}
```

## Installer sur le téléphone
- **iPhone (Safari)** : ouvrir l'adresse GitHub Pages → bouton Partager → « Sur l'écran d'accueil ».
- **Android (Chrome)** : menu ⋮ → « Ajouter à l'écran d'accueil » ou « Installer l'application ».
L'appli s'ouvre alors en plein écran, avec son icône, comme une vraie appli.
