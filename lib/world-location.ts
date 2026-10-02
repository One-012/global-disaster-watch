import "server-only";

import { Country, State, City } from "country-state-city";

import type {
  CatalogVideo,
  VideoLocation,
} from "@/lib/video-catalog";

type Place = {
  id: string;
  name: string;
  countryCode: string;
  stateCode?: string;
  kind: "country" | "state" | "city";
  lat: number;
  lng: number;
};

type PlaceIndex = Map<string, Place[]>;

let cachedIndex: PlaceIndex | undefined;

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Avoid treating common headline words as small-town names.
const ignoredNames = new Set([
  "all",
  "and",
  "as",
  "at",
  "back",
  "big",
  "by",
  "can",
  "down",
  "earth",
  "fall",
  "falls",
  "fire",
  "flood",
  "floods",
  "hail",
  "hit",
  "hits",
  "in",
  "is",
  "la",
  "large",
  "latest",
  "live",
  "major",
  "new",
  "news",
  "no",
  "north",
  "of",
  "on",
  "rain",
  "red",
  "river",
  "road",
  "roads",
  "rock",
  "san",
  "sea",
  "snow",
  "south",
  "storm",
  "storms",
  "the",
  "to",
  "union",
  "update",
  "updates",
  "us",
  "war",
  "water",
  "west",
  "wind",
]);

function getIndex(): PlaceIndex {
  if (cachedIndex) return cachedIndex;

  const index: PlaceIndex = new Map();
  const countries = Country.getAllCountries();

  const countryNames = new Map(
    countries.map((country) => [
      country.isoCode,
      country.name,
    ])
  );

  const states = State.getAllStates();

  const stateNames = new Map(
    states.map((state) => [
      `${state.countryCode}:${state.isoCode}`,
      state.name,
    ])
  );

  const countryPlaces = new Map<string, Place>();

  function add(alias: string, place: Place) {
    const key = normalize(alias);

    if (key.length < 3 || ignoredNames.has(key)) return;

    const current = index.get(key) ?? [];

    if (!current.some((item) => item.id === place.id)) {
      current.push(place);
      index.set(key, current);
    }
  }

  function coordinates(
    latitude?: string | null,
    longitude?: string | null
  ) {
    if (!latitude?.trim() || !longitude?.trim()) {
      return undefined;
    }

    const lat = Number(latitude);
    const lng = Number(longitude);

    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lng) ||
      Math.abs(lat) > 90 ||
      Math.abs(lng) > 180
    ) {
      return undefined;
    }

    return { lat, lng };
  }

  for (const country of countries) {
    const point = coordinates(
      country.latitude,
      country.longitude
    );

    if (!point) continue;

    const place: Place = {
      id: `country:${country.isoCode}`,
      name: `${country.name} — General Coverage`,
      countryCode: country.isoCode,
      kind: "country",
      ...point,
    };

    countryPlaces.set(country.isoCode, place);
    add(country.name, place);
  }

  // Common alternative names.
  // Extend this list for other languages used in your titles.
  const aliases: Record<string, string[]> = {
    US: [
      "USA",
      "U.S.A.",
      "U.S.",
      "United States",
      "United States of America",
    ],
    GB: [
      "United Kingdom",
      "Britain",
      "Great Britain",
      "U.K.",
    ],
    JP: ["Japan", "Japanese", "Nhật Bản", "日本"],
    VN: ["Vietnam", "Viet Nam", "Việt Nam"],
    KR: ["South Korea", "Republic of Korea", "Hàn Quốc"],
    KP: ["North Korea"],
    CN: ["China", "Trung Quốc"],
    TW: ["Taiwan", "Đài Loan"],
    TR: ["Turkey", "Türkiye"],
    CZ: ["Czechia", "Czech Republic"],
    RU: ["Russia", "Russian Federation"],
  };

  for (const [code, names] of Object.entries(aliases)) {
    const place = countryPlaces.get(code);
    if (!place) continue;

    names.forEach((name) => add(name, place));
  }

  for (const state of states) {
    const point = coordinates(
      state.latitude,
      state.longitude
    );

    if (!point) continue;

    const place: Place = {
      id: `state:${state.countryCode}:${state.isoCode}`,
      name:
        `${state.name}, ` +
        (countryNames.get(state.countryCode) ??
          state.countryCode),
      countryCode: state.countryCode,
      stateCode: state.isoCode,
      kind: "state",
      ...point,
    };

    add(state.name, place);

    // Recognize "Tokyo" when the database says
    // "Tokyo Prefecture", for example.
    const shortName = state.name.replace(
      /\s+(prefecture|province|state|region|governorate|department|oblast)$/i,
      ""
    );

    if (shortName !== state.name) {
      add(shortName, place);
    }
  }

  for (const city of City.getAllCities()) {
    const point = coordinates(
      city.latitude,
      city.longitude
    );

    if (!point) continue;

    const countryName =
      countryNames.get(city.countryCode) ??
      city.countryCode;

    const stateName = stateNames.get(
      `${city.countryCode}:${city.stateCode}`
    );

    const place: Place = {
      id:
        `city:${city.countryCode}:${city.stateCode}:` +
        `${city.name}:${point.lat}:${point.lng}`,

      name: [city.name, stateName, countryName]
        .filter(Boolean)
        .join(", "),

      countryCode: city.countryCode,
      stateCode: city.stateCode,
      kind: "city",
      ...point,
    };

    add(city.name, place);
  }

  cachedIndex = index;
  return index;
}

export function detectWorldLocation(
  title: string
): VideoLocation | undefined {
  const index = getIndex();
  const words = normalize(title).split(" ").filter(Boolean);

  const mentions: Array<{
    start: number;
    end: number;
    candidates: Place[];
  }> = [];

  // Match longest place names first:
  // "New York City" before "York".
  for (let start = 0; start < words.length; start++) {
    const maxLength = Math.min(8, words.length - start);

    for (let length = maxLength; length >= 1; length--) {
      const phrase = words
        .slice(start, start + length)
        .join(" ");

      const candidates = index.get(phrase);
      if (!candidates) continue;

      mentions.push({
        start,
        end: start + length,
        candidates,
      });

      start += length - 1;
      break;
    }
  }

  if (mentions.length === 0) return undefined;

  // Country context is trusted only when a mention
  // resolves uniquely to a country.
  const explicitCountries = new Set(
    mentions.flatMap((mention) =>
      mention.candidates.length === 1 &&
      mention.candidates[0].kind === "country"
        ? [mention.candidates[0].countryCode]
        : []
    )
  );

  const narrowed = mentions.map((mention) => ({
    ...mention,
    candidates: mention.candidates.filter(
      (place) =>
        explicitCountries.size === 0 ||
        explicitCountries.has(place.countryCode)
    ),
  }));

  // A clearly identified state can disambiguate a city
  // with the same name in several countries or states.
  const stateContexts = new Set(
    narrowed.flatMap((mention) => {
      const states = mention.candidates.filter(
        (place) => place.kind === "state"
      );

      return states.length === 1 &&
        !mention.candidates.some(
          (place) => place.kind === "country"
        )
        ? [
            `${states[0].countryCode}:${states[0].stateCode}`,
          ]
        : [];
    })
  );

  const resolved: Place[] = [];

  for (const mention of narrowed) {
    let candidates = mention.candidates;

    const localCities = candidates.filter(
      (place) =>
        place.kind === "city" &&
        stateContexts.has(
          `${place.countryCode}:${place.stateCode}`
        )
    );

    if (localCities.length > 0) {
      candidates = localCities;
    }

    // A city and its state may share a name.
    // Prefer the broader state in that case.
    const state = candidates.find(
      (place) => place.kind === "state"
    );

    if (
      state &&
      candidates.every(
        (place) =>
          place.id === state.id ||
          (place.kind === "city" &&
            place.countryCode === state.countryCode &&
            place.stateCode === state.stateCode)
      )
    ) {
      candidates = [state];
    }

    if (candidates.length !== 1) {
      // Ambiguous or conflicting place names:
      // do not invent a precise location.
      return undefined;
    }

    resolved.push(candidates[0]);
  }

  const unique = Array.from(
    new Map(resolved.map((place) => [place.id, place])).values()
  );

  // Remove a parent country/state when a more specific
  // place inside it was also recognized.
  const specific = unique.filter((place) => {
    if (place.kind === "country") {
      return !unique.some(
        (other) =>
          other.kind !== "country" &&
          other.countryCode === place.countryCode
      );
    }

    if (place.kind === "state") {
      return !unique.some(
        (other) =>
          other.kind === "city" &&
          other.countryCode === place.countryCode &&
          other.stateCode === place.stateCode
      );
    }

    return true;
  });

  // The existing map supports one location per video.
  // Leave multi-location titles for manual review.
  if (specific.length !== 1) return undefined;

  const place = specific[0];

  return {
    name: place.name,
    lat: place.lat,
    lng: place.lng,
  };
}

export function locateVideos(
  videos: CatalogVideo[]
): CatalogVideo[] {
  return videos.map((video) => ({
    ...video,

    // Explicitly assigned locations remain authoritative.
    location:
      video.location ??
      detectWorldLocation(video.title),
  }));
}