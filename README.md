# Energie Renouvelable IA — Application Desktop

Interface desktop professionnelle pour la classification de sites d'energie renouvelable.
Construite avec **Electron + React** (architecture VS Code).

---

## Structure du Projet

```
energie-renouvelable-ia/
├── electron/
│   ├── main.js          # Processus principal Electron
│   └── preload.js       # Pont IPC securise
├── src/
│   ├── App.js           # Composant React principal
│   ├── components/
│   │   ├── TitleBar.js  # Barre de titre personnalisee
│   │   ├── Sidebar.js   # Navigation laterale
│   │   ├── FormPanel.js # Formulaire de saisie
│   │   ├── ResultPanel.js # Resultats + graphiques
│   │   └── HistoryPanel.js # Historique SQLite
│   └── index.css        # Tokens de design globaux
├── python/
│   ├── predict.py       # Modele DecisionTree (scikit-learn)
│   ├── history.py       # Lecture historique SQLite
│   └── donnees_energie.sql # Donnees d'entrainement SQL
└── public/
    └── index.html       # Point d'entree HTML
```

---

## Prerequis

- **Node.js** v18+ — https://nodejs.org
- **Python 3.8+** — https://python.org
- **pip** packages : `pip install scikit-learn numpy`

---

## Installation et Lancement

```bash
# 1. Installer les dependances Node
npm install

# 2. Lancer en mode developpement
npm run dev
```

## Build Production (executable)

```bash
# Generer l'executable Windows/Mac/Linux
npm run build
# Resultat dans le dossier dist/
```

---

## Fonctionnalites

| Vue          | Description |
|---|---|
| **Analyse**  | Formulaire interactif avec sliders + pills. Lance la prediction Python via IPC Electron. Affiche radar, barres de probabilite, chemin de decision. |
| **Historique** | Tableau de toutes les predictions lues depuis SQLite. |
| **Energies** | Guide de reference sur les 4 sources d'energie. |

---

## Technologies

- **Electron 28** — fenetre desktop native, IPC
- **React 18** — interface utilisateur
- **Recharts** — RadarChart, BarChart
- **scikit-learn** — DecisionTreeClassifier
- **SQLite** — stockage des donnees et predictions
- **CSS Variables** — systeme de design tokens

---

## Personnalisation

Pour ajouter des donnees d'entrainement : editez `python/donnees_energie.sql`
puis supprimez `energie_renouvelable.db` pour forcer la recreation.
