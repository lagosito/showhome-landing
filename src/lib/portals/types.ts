export interface PortalListing {
  title: string;
  address: string;
  price: string;
  area: string;
  rooms: string;
  yearBuilt?: string;
  energyClass?: string;
  photos: { url: string; alt: string }[];
  floorPlanUrl: string | null;
  listingText: string;
  features: string[];
  listingFacts: Record<string, string>;
}

export interface PortalParser {
  name: string;
  matchUrl(url: string): boolean;
  parse(html: string): PortalListing;
}
