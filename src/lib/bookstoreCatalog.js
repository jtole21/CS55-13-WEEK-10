// Curated Shelfside shops. This replaces the FriendlyEats food dataset.
// Each shop keeps the same Firestore shape as the codelab: category, city,
// price (1–4), photo, and a ratings subcollection of visitor notes.

export const bookstoreCategories = [
  "New Fiction",
  "Used & Rare",
  "Comics",
  "Children's",
  "Poetry",
  "Academic",
];

export const bookstoreCities = [
  "Portland",
  "Oakland",
  "Brooklyn",
  "Austin",
  "Chicago",
  "Seattle",
  "New Orleans",
  "Santa Fe",
  "Los Angeles",
  "Boston",
];

export const bookstoreCatalog = [
  {
    name: "Lantern & Quill",
    category: "Used & Rare",
    city: "Portland",
    price: 2,
    photo: "/covers/lantern.svg",
    reviews: [
      {
        rating: 5,
        userId: "Sample: Elena V.",
        text: "The stacks go on forever, and a bookseller found a 1970s poetry pamphlet for me in under a minute.",
      },
      {
        rating: 5,
        userId: "Sample: Jonah P.",
        text: "It smells like cedar and dust in the best way. I left with three books I had not planned to buy.",
      },
      {
        rating: 4,
        userId: "Sample: Priya S.",
        text: "Prices on the rare wall are steep, but the dollar carts on the sidewalk are a real treasure hunt.",
      },
    ],
  },
  {
    name: "Cedar Stack",
    category: "Poetry",
    city: "Oakland",
    price: 1,
    photo: "/covers/cedar.svg",
    reviews: [
      {
        rating: 5,
        userId: "Sample: Mateo L.",
        text: "Tuesday readings are packed, and the host remembered my name on the second visit.",
      },
      {
        rating: 4,
        userId: "Sample: Helen C.",
        text: "Small room, a huge poetry section, and a quiet corner that actually stays quiet.",
      },
      {
        rating: 3,
        userId: "Sample: Owen K.",
        text: "The espresso is only okay. I come back for the chapbooks and the reading series.",
      },
    ],
  },
  {
    name: "Marlowe Room",
    category: "New Fiction",
    city: "Brooklyn",
    price: 3,
    photo: "/covers/marlowe.svg",
    reviews: [
      {
        rating: 5,
        userId: "Sample: Aisha N.",
        text: "The staff picks are written like letters, and they have not steered me toward a dull novel yet.",
      },
      {
        rating: 3,
        userId: "Sample: Chris D.",
        text: "Beautiful shop, though a paperback here costs more than the same book two blocks away.",
      },
      {
        rating: 4,
        userId: "Sample: Lila M.",
        text: "The window display changes every Monday and is worth the walk from the subway.",
      },
    ],
  },
  {
    name: "Nightingale Comics",
    category: "Comics",
    city: "Austin",
    price: 1,
    photo: "/covers/nightingale.svg",
    reviews: [
      {
        rating: 5,
        userId: "Sample: Andre W.",
        text: "They stock small-press comics I cannot find anywhere else in town, and the staff knows the catalog.",
      },
      {
        rating: 5,
        userId: "Sample: June H.",
        text: "Saturday sketch hour is generous, and the back-issue bins are actually labeled.",
      },
      {
        rating: 4,
        userId: "Sample: Samir T.",
        text: "Release days get loud, which is exactly the point of a comics shop.",
      },
    ],
  },
  {
    name: "Hearth Room",
    category: "Children's",
    city: "Chicago",
    price: 2,
    photo: "/covers/hearth.svg",
    reviews: [
      {
        rating: 5,
        userId: "Sample: Nora B.",
        text: "Low shelves, a reading rug, and booksellers who ask what a kid loved last before they recommend anything.",
      },
      {
        rating: 4,
        userId: "Sample: David F.",
        text: "Story hour stays calm, and the picture-book wall is arranged by mood instead of only by series.",
      },
      {
        rating: 5,
        userId: "Sample: Grace Y.",
        text: "Gift wrapping is free and nobody rushes you out, even on a crowded Saturday.",
      },
    ],
  },
  {
    name: "Salt & Margin",
    category: "Academic",
    city: "Seattle",
    price: 3,
    photo: "/covers/salt.svg",
    reviews: [
      {
        rating: 5,
        userId: "Sample: Kenji A.",
        text: "The criticism and translation shelves are better than the ones at my university bookstore.",
      },
      {
        rating: 4,
        userId: "Sample: Ruth E.",
        text: "They special-ordered a university-press title and emailed me the morning it arrived.",
      },
      {
        rating: 3,
        userId: "Sample: Paul N.",
        text: "There are only a few chairs, so I browse here and then finish the chapter at the cafe next door.",
      },
    ],
  },
  {
    name: "Cypress Bindery",
    category: "Used & Rare",
    city: "New Orleans",
    price: 2,
    photo: "/covers/cypress.svg",
    reviews: [
      {
        rating: 5,
        userId: "Sample: Camille R.",
        text: "Signed southern fiction up front, and a binder in the back who repaired my grandmother's Bible.",
      },
      {
        rating: 4,
        userId: "Sample: Hector J.",
        text: "Ceiling fans, a humid afternoon, and a jazz record that never overpowered the room.",
      },
      {
        rating: 4,
        userId: "Sample: Imani G.",
        text: "Some prices are handwritten, and they were willing to talk when I bought more than one book.",
      },
    ],
  },
  {
    name: "Mesa Chapter",
    category: "Poetry",
    city: "Santa Fe",
    price: 1,
    photo: "/covers/mesa.svg",
    reviews: [
      {
        rating: 5,
        userId: "Sample: Sofia Q.",
        text: "Regional poets are up front, and the courtyard makes it easy to stay for another chapter.",
      },
      {
        rating: 5,
        userId: "Sample: Ben O.",
        text: "The owner pressed a local pamphlet into my hand and refused to let me pay for it.",
      },
      {
        rating: 3,
        userId: "Sample: Yara I.",
        text: "The shop is tiny, so a weekday visit is the one that lets you linger.",
      },
    ],
  },
  {
    name: "Glass Orchard",
    category: "New Fiction",
    city: "Los Angeles",
    price: 4,
    photo: "/covers/orchard.svg",
    reviews: [
      {
        rating: 5,
        userId: "Sample: Miles K.",
        text: "Floor-to-ceiling fiction, and the staff talks about sentences instead of only about plots.",
      },
      {
        rating: 3,
        userId: "Sample: Dana L.",
        text: "It is pricey and the parking is a puzzle, but the debut-author nights stay intimate.",
      },
      {
        rating: 4,
        userId: "Sample: Elise P.",
        text: "I found a first edition I had given up on. They wrapped it in orchard-green paper.",
      },
    ],
  },
  {
    name: "Harbor Index",
    category: "Academic",
    city: "Boston",
    price: 2,
    photo: "/covers/harbor.svg",
    reviews: [
      {
        rating: 5,
        userId: "Sample: Theo M.",
        text: "A serious essay section and a map table by the window that makes maritime history feel close.",
      },
      {
        rating: 5,
        userId: "Sample: Farah Z.",
        text: "The bookseller built me a reading list for a trip, and every title was already on the shelf.",
      },
      {
        rating: 3,
        userId: "Sample: Colin B.",
        text: "Evenings fill up with students, so morning is the better time to browse.",
      },
    ],
  },
];
