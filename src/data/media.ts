/** Pexels image URL builder — keeps payload small and responsive. */
export const px = (id: number, w = 1200, h = 800) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=${w}&h=${h}`;

export type Shot = { id: number; room: string; alt: string };

/** The "tour" used inside the hero player. */
export const tourShots: Shot[] = [
  {
    id: 8135496,
    room: "Entrance & Hall",
    alt: "Open-plan entrance hall of a luxury apartment",
  },
  {
    id: 7546323,
    room: "Living Room",
    alt: "Minimalist living room with designer furniture",
  },
  {
    id: 8089172,
    room: "Kitchen",
    alt: "Modern open kitchen with island",
  },
  {
    id: 7060826,
    room: "Master Bedroom",
    alt: "Contemporary bedroom with built-in wardrobe",
  },
  {
    id: 6782570,
    room: "Bathroom",
    alt: "Bright modern bathroom with stone counter",
  },
  {
    id: 7031604,
    room: "Terrace",
    alt: "Villa terrace with panoramic glass walls",
  },
];

/** Raw, unsorted camera-roll style uploads. */
export const uploadShots: Shot[] = [
  { id: 7167073, room: "Living", alt: "Living room with sofa" },
  { id: 7045991, room: "Kitchen", alt: "Kitchen and bedroom area" },
  { id: 3555619, room: "Bedroom", alt: "Cozy bedroom" },
  { id: 30767898, room: "Bathroom", alt: "Rustic modern bathroom" },
  { id: 7031581, room: "Exterior", alt: "Yard of a contemporary house" },
  { id: 7173666, room: "Living", alt: "Bright living room" },
  { id: 6207940, room: "Suite", alt: "Bedroom with glass walls" },
  { id: 7031708, room: "Lounge", alt: "Cozy lounge with wooden details" },
  { id: 34574597, room: "Bedroom", alt: "Chic bedroom with accent wall" },
  { id: 8135503, room: "Media", alt: "Living room with TV wall" },
  { id: 33259929, room: "Hall", alt: "Minimalist apartment archway" },
  { id: 6920439, room: "Living", alt: "Corner sofa living room" },
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
