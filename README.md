# calorEAT

A clean, minimal calorie and macro tracker. On first launch it asks for your details, works out your daily calorie budget with the **Mifflin-St Jeor** equation, and then lets you log meals against that goal. Everything is stored in your browser, so there is no account, no backend and no data leaves your device.

Built with **React (Vite)** and **Tailwind CSS**.

## Features

- **Onboarding / BMR calculator:** enter sex, age, weight, height and activity level. A live preview shows your BMR and TDEE before you save.
- **Automatic daily goal:** TDEE (BMR × activity factor) is saved and used as your daily calorie target. You can edit your profile at any time and the goal is recalculated.
- **Dashboard:** a progress bar for calories consumed vs. goal, the calories remaining (or how far over you are), and the day's protein, carbs and fat in grams.
- **Meal log:** add a meal with its calories and macros, see today's list, and delete any entry.
- **Dark mode:** follows your system preference on first visit, with a manual toggle that is remembered.
- **Responsive:** works on phones and desktops.
- **Persistent:** profile, meals and theme live in `localStorage` and survive a refresh.

## How the goal is calculated

```
BMR  = 10 × weight (kg) + 6.25 × height (cm) − 5 × age + 5     (men)
BMR  = 10 × weight (kg) + 6.25 × height (cm) − 5 × age − 161   (women)
TDEE = BMR × activity factor
```

| Activity level | Factor |
| -------------- | ------ |
| Sedentary      | 1.2    |
| Light          | 1.375  |
| Moderate       | 1.55   |
| Intense        | 1.725  |

These are estimates, not medical advice.

## Getting started

Requires [Node.js](https://nodejs.org/) 20 or newer.

```bash
git clone https://github.com/ramoneus/calorie-tracker.git
cd calorie-tracker
npm install
npm run dev
```

Then open the URL Vite prints (usually http://localhost:5173).

Other scripts:

```bash
npm run build     # production build in dist/
npm run preview   # serve the production build locally
npm run lint      # lint with oxlint
```

## Project structure

```
src/
├── components/
│   ├── Dashboard.jsx    # calorie progress bar + macro cards
│   ├── Field.jsx        # labelled input wrapper and shared input style
│   ├── Header.jsx       # title, date, profile and theme buttons
│   ├── MealForm.jsx     # add-meal form
│   ├── MealLog.jsx      # today's meals with delete
│   └── Onboarding.jsx   # setup form (also used to edit the profile)
├── hooks/
│   ├── useLocalStorage.js
│   └── useTheme.js
├── lib/
│   └── nutrition.js     # BMR/TDEE maths, macro totals, date helper
├── App.jsx
└── main.jsx
```

## Data storage

| Key                       | Contents                                        |
| ------------------------- | ----------------------------------------------- |
| `calorie-tracker:profile` | sex, age, weight, height, activity, BMR, goal   |
| `calorie-tracker:meals`   | every logged meal, each tagged with its date    |
| `calorie-tracker:theme`   | `light` or `dark`                               |

Meals are stored with their local date, so the dashboard starts empty at midnight while earlier days stay in storage. Clearing your browser's site data resets the app.

## License

[MIT](LICENSE)
