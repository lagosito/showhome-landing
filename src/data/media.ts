/** Local image URL builder for demo images. */
export const px = (id: number, w = 1200, h = 800) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=${w}&h=${h}`;

/** Local demo image path. */
export const demoImg = (file: string) => `/demo/${file}`;

export type Shot = { id: number; room: string; alt: string; file?: string };
export type LocalShot = { file: string; room: string; alt: string; pos?: string };

/** The "tour" used inside the hero player — local demo images. */
export const tourShots: LocalShot[] = [
  {
    file: "8bcf8f11-7d0c-4f64-a061-87fbf799aef8.webp",
    room: "Eingang & Flur",
    alt: "Offener Eingangsbereich einer Luxuswohnung",
  },
  {
    file: "10640570-6615-4b14-bc8b-248ac5d1360e.webp",
    room: "Wohnzimmer",
    alt: "Minimalistisches Wohnzimmer mit Designermöbeln",
  },
  {
    file: "b6db2443-230b-4cf4-995c-f20d49b7ee01.webp",
    room: "Küche",
    alt: "Moderne offene Küche mit Kochinsel",
  },
  {
    file: "c86eb513-1436-4a91-8e34-75c5ee7165f0.webp",
    room: "Hauptschlafzimmer",
    alt: "Modernes Schlafzimmer mit Einbauschrank",
  },
  {
    file: "01-badezimmer.webp",
    room: "Badezimmer",
    alt: "Helles modernes Bad mit Steinwaschtisch",
  },
  {
    file: "Image 1.jpg",
    room: "Avatar",
    alt: "Professioneller Immobilien-Videopresenter",
  },
];

/** Raw, unsorted camera-roll style uploads — local demo images. */
export const uploadShots: LocalShot[] = [
  { file: "Image 2.webp", room: "Living", alt: "Living room with sofa" },
  { file: "Image 3.webp", room: "Kitchen", alt: "Kitchen and bedroom area" },
  { file: "Image 4.webp", room: "Bedroom", alt: "Cozy bedroom" },
  { file: "01-badezimmer.webp", room: "Bathroom", alt: "Modern bathroom" },
  { file: "8bcf8f11-7d0c-4f64-a061-87fbf799aef8.webp", room: "Exterior", alt: "Contemporary house exterior" },
  { file: "10640570-6615-4b14-bc8b-248ac5d1360e.webp", room: "Living", alt: "Bright living room" },
  { file: "b6db2443-230b-4cf4-995c-f20d49b7ee01.webp", room: "Suite", alt: "Bedroom with glass walls" },
  { file: "c86eb513-1436-4a91-8e34-75c5ee7165f0.webp", room: "Lounge", alt: "Cozy lounge with wooden details" },
  { file: "Image 1.jpg", room: "Presenter", alt: "Immobilien-Videopresenter", pos: "object-top" },
];

export const IMG = {
  heroPoster: 8135492,
  exterior: 7031412,
  exteriorNight: 7031407,
  owners: 7031708,
  agents: 6207942,
  teams: 34147672,
  benefitWide: 7174113,
  beforeAfter: 7546323,
};
