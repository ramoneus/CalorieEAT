# calorEAT

A clean, minimal calorie and macro tracker. On first launch it asks for your details, works out your daily calorie budget with the **Mifflin-St Jeor** equation, and then lets you log meals against that goal. Everything is stored in your browser, so there is no account, no backend and no data leaves your device.

Built with **React (Vite)** and **Tailwind CSS**.

## Features

- **Onboarding / BMR calculator:** enter sex, age, weight, height and activity level. A live preview shows your BMR and TDEE before you save.
- **Automatic daily goal:** TDEE (BMR × activity factor) is saved and used as your daily calorie target. You can edit your profile at any time and the goal is recalculated.
- **Dashboard:** a progress bar for calories consumed vs. goal, the calories remaining (or how far over you are), and the day's protein, carbs and fat in grams.
- **Food search:** about 900 Greek and everyday foods, dishes and brands with values per 100 g and ready-made portions (slice, cup, medium, etc.) or grams. Search ignores case and accents.
- **Meals:** entries are filed under breakfast, lunch, dinner or snack (picked from the time of day, changeable).
- **Recents and favourites:** re-add something you have eaten before with one tap, or repeat a whole meal from the day before ("Same breakfast as yesterday").
- **Edit and undo:** tap an entry to change its amount or meal; a deleted entry can be restored for a few seconds.
- **Manual entry:** for anything not in the list, type the calories and macros yourself.
- **History:** move between days or pick one from a calendar (days are marked within or over goal) and log meals you forgot on past days.
- **Progress:** calories per day against the goal and weight over the last 7, 30 or 90 days, with daily averages. Changing your profile only affects the goal from that day on.
- **Backup:** download all your data as a file and restore it on any device.
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

## Use it online

Open **https://ramoneus.github.io/CalorieEAT/** in any browser. Nothing to install.

## Run it locally

Requires [Node.js](https://nodejs.org/) 20 or newer.

```bash
git clone https://github.com/ramoneus/CalorieEAT.git
cd CalorieEAT
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

## Data storage

| Key                         | Contents                                      |
| --------------------------- | --------------------------------------------- |
| `calorie-tracker:profile`   | sex, age, weight, height, activity, BMR, goal |
| `calorie-tracker:meals`     | every logged meal, each tagged with its date  |
| `calorie-tracker:favorites` | foods starred as favourites                   |
| `calorie-tracker:goals`     | daily goal history (each goal and the day it started) |
| `calorie-tracker:weights`   | weight log, one entry per day                 |
| `calorie-tracker:theme`     | `light` or `dark`                             |

Meals are stored with their local date, so the dashboard starts empty at midnight while earlier days stay in storage. Clearing your browser's site data resets the app.

## License

[MIT](LICENSE)
