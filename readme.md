### Shelfside

Shelfside is a Week 10 derivative of the [FriendlyEats Next.js + Firebase codelab](https://firebase.google.com/codelabs/firebase-nextjs). The restaurant guide is now a field guide to independent bookstores.

The app uses:

- Google sign-in through Firebase Authentication
- Cloud Firestore for the `bookstores` collection and visitor notes
- Cloud Storage for shop photos visitors upload
- Gemini, through Genkit, to summarize the notes on each shop
- Firebase App Hosting for deployment

`initializeApp()` receives the web config from `.env.local` during local development. On App Hosting that config is empty, and App Hosting fills it in.

#### What changed from FriendlyEats

- The subject is independent bookstores, stored in `bookstores` and opened at `/bookstore/[id]`.
- The old food names, cities, categories, reviews, and hosted food photos are replaced by the Shelfside catalog in `src/lib/bookstoreCatalog.js`, with original cover art in `public/covers`.
- Colors and type are a paper, forest-green, and sienna palette, set in Fraunces and Source Sans 3.
- Each shop page asks Gemini for a one-sentence summary of the visitor notes.

#### Create the Firebase project

1. Create a new Firebase project and upgrade it to the Blaze plan. Do not reuse the Week 7 project.
2. Register a web app. Leave Firebase Hosting unchecked.
3. Copy the web app config into `.env.local`, using the names in `.env.example`.
4. Enable Google as an Authentication sign-in provider.
5. Create a Firestore database, then deploy the rules in this repo.
6. Create a Cloud Storage bucket, then deploy the storage rules in this repo.
7. Create a Gemini API key and save it as the App Hosting secret `GEMINI_API_KEY`. The same name is declared in `apphosting.yaml`.
8. In App Hosting, create a backend named `shelfside` that watches the `main` branch of this GitHub repository, with the root directory `/` and automatic rollouts enabled.
9. Add the App Hosting domain to Authentication > Settings > Authorized domains.

After `firebase login` and `firebase use --add`:

```sh
firebase deploy --only firestore,storage
```

#### Run locally

```sh
npm install
npm run dev
```

Open `http://localhost:3000`, sign in with Google, then choose **Add sample bookstores**. Open a shop to read the Gemini summary of its visitor notes.

To browse the catalog before the Firebase project exists, add `NEXT_PUBLIC_SHELFSIDE_PREVIEW=1` to `.env.local` and restart the dev server. Leave that variable unset on App Hosting.
