export type Category = {
  id: string;
  name: string;
  emoji: string;
  color: string;
  words: string[];
};

export const CATEGORIES: Category[] = [
  {
    id: "spor",
    name: "Spor",
    emoji: "⚽",
    color: "#16a34a",
    words: [
      "GOLCU", "HAKEM", "TAKIM", "FUTBOL", "PALET", "RAKIP",
      "KOŞUCU", "BASKET", "TENIS", "VOLEY", "FORVET", "KALECI",
      "PENALT", "FRIKIK", "KORNER", "SMAÇ", "SERVIS", "BLOK",
      "SPRINT", "MARATON",
    ],
  },
  {
    id: "yemek",
    name: "Yemek",
    emoji: "🍽️",
    color: "#ea580c",
    words: [
      "KEBAP", "BÖREK", "PILAV", "ÇORBA", "SALÇA", "SOĞAN",
      "BİBER", "SARIMS", "MAYDOZ", "DOMATES", "PATATES", "LAHANA",
      "MANTAR", "ZEYTUN", "PEYNIR", "YOĞURT", "AYRAN", "TURŞU",
      "BAKLAV", "KADAYIF",
    ],
  },
  {
    id: "sinema",
    name: "Sinema",
    emoji: "🎬",
    color: "#7c3aed",
    words: [
      "OYUNCU", "YÖNETM", "SENARYO", "SAHNE", "KAMERA", "DEKOR",
      "KOSTÜM", "MAKYAJ", "MÜZIK", "EFEKT", "PRÖMIER", "FESTIVAL",
      "ÖDÜL", "JÜRI", "FRAGMAN", "AFİŞ", "BİLET", "PERDE",
      "VIZYON", "GALASI",
    ],
  },
  {
    id: "tarih",
    name: "Tarih",
    emoji: "🏛️",
    color: "#b45309",
    words: [
      "SULTAN", "SAVAŞI", "İMPARA", "KALE", "ORDU", "SEFER",
      "ANTLAŞ", "FETIH", "DÖNEM", "HANEDA", "TAHT", "SARAY",
      "MİMARI", "KÜLTÜR", "MİRAS", "ARKEOL", "KAZISI", "MÜZE",
      "ANITı", "ZAFER",
    ],
  },
  {
    id: "bilim",
    name: "Bilim",
    emoji: "🔬",
    color: "#0891b2",
    words: [
      "ATOM", "HÜCRE", "DENEY", "TEORI", "FORMÜL", "REAKSI",
      "MADDE", "ENERJI", "DALGA", "IŞIN", "KUVVET", "KÜTLE",
      "HACİM", "YOĞUNL", "SICAKL", "BASINC", "AKIMI", "VOLTAJ",
      "DIRENÇ", "FREKANS",
    ],
  },
  {
    id: "cografya",
    name: "Coğrafya",
    emoji: "🌍",
    color: "#059669",
    words: [
      "DAĞLAR", "NEHIR", "GÖLLER", "BOĞAZI", "DELTA", "VADI",
      "PLATO", "OVALAR", "KÖRFEZ", "ADALAR", "YANARDAĞ", "BUZUL",
      "ÇÖLLER", "ORMAN", "STEP", "TUNDRA", "İKLİM", "YAĞIŞ",
      "RÜZGAR", "FIRTINA",
    ],
  },
  {
    id: "muzik",
    name: "Müzik",
    emoji: "🎵",
    color: "#db2777",
    words: [
      "NOTA", "RITIM", "MELODI", "AKOR", "ENSTR", "GITAR",
      "KEMAN", "PIYANO", "DAVUL", "BATERI", "VOKAL", "KLİP",
      "ALBÜM", "TURNE", "KONSER", "SAHNE", "MIKSER", "STÜDYO",
      "KAYIT", "MİKSAJ",
    ],
  },
];

export function getDailyCategory(): Category {
  const now = new Date();
  const dayOfYear = Math.floor(
    (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000
  );
  return CATEGORIES[dayOfYear % CATEGORIES.length];
}

export function getDailyWord(category: Category): string {
  const now = new Date();
  const seed = now.getFullYear() * 1000 + Math.floor(
    (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000
  );
  return category.words[seed % category.words.length];
}

export function getTodayKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
}
