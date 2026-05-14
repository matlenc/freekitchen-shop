// Av. João Wallig, 1800 — Passo d'Areia, Porto Alegre (Shopping Iguatemi)
const STORE_LAT = -30.03443;
const STORE_LNG = -51.21756;
const MAX_DISTANCE_KM = 5;
export const DELIVERY_FEE = 10;

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Mapa local de bairros de Porto Alegre — evita chamadas ao Nominatim
// Coordenadas do centroide de cada bairro
const POA_BAIRROS: Record<string, { lat: number; lng: number }> = {
  "passo d'areia":      { lat: -30.0344, lng: -51.2175 },
  "passo da areia":     { lat: -30.0344, lng: -51.2175 },
  "boa vista":          { lat: -30.0250, lng: -51.2100 },
  "auxiliadora":        { lat: -30.0300, lng: -51.2100 },
  "mont serrat":        { lat: -30.0430, lng: -51.2200 },
  "moinhos de vento":   { lat: -30.0250, lng: -51.2150 },
  "independência":      { lat: -30.0350, lng: -51.2050 },
  "independencia":      { lat: -30.0350, lng: -51.2050 },
  "centro":             { lat: -30.0330, lng: -51.2300 },
  "petrópolis":         { lat: -30.0380, lng: -51.1980 },
  "petropolis":         { lat: -30.0380, lng: -51.1980 },
  "floresta":           { lat: -30.0200, lng: -51.2300 },
  "são joão":           { lat: -30.0150, lng: -51.2250 },
  "sao joao":           { lat: -30.0150, lng: -51.2250 },
  "santa cecília":      { lat: -30.0450, lng: -51.2300 },
  "santa cecilia":      { lat: -30.0450, lng: -51.2300 },
  "farroupilha":        { lat: -30.0350, lng: -51.2350 },
  "higienópolis":       { lat: -30.0450, lng: -51.2400 },
  "higienopolis":       { lat: -30.0450, lng: -51.2400 },
  "bela vista":         { lat: -30.0550, lng: -51.2100 },
  "menino deus":        { lat: -30.0600, lng: -51.2250 },
  "jardim botânico":    { lat: -30.0600, lng: -51.2100 },
  "jardim botanico":    { lat: -30.0600, lng: -51.2100 },
  "cristo redentor":    { lat: -30.0200, lng: -51.2000 },
  "três figueiras":     { lat: -30.0180, lng: -51.1850 },
  "tres figueiras":     { lat: -30.0180, lng: -51.1850 },
  "jardim itu":         { lat: -30.0600, lng: -51.2000 },
  "vila ipiranga":      { lat: -30.0430, lng: -51.1780 },
  "sarandi":            { lat: -30.0050, lng: -51.1850 },
  "navegantes":         { lat: -29.9950, lng: -51.2200 },
  "jardim sabará":      { lat: -30.0700, lng: -51.1900 },
  "jardim sabara":      { lat: -30.0700, lng: -51.1900 },
  "jardim lindóia":     { lat: -30.0750, lng: -51.2000 },
  "jardim lindoia":     { lat: -30.0750, lng: -51.2000 },
  "partenon":           { lat: -30.0600, lng: -51.1800 },
  "são geraldo":        { lat: -30.0100, lng: -51.2100 },
  "sao geraldo":        { lat: -30.0100, lng: -51.2100 },
  "marcílio dias":      { lat: -30.0150, lng: -51.2300 },
  "marcilio dias":      { lat: -30.0150, lng: -51.2300 },
  "rio branco":         { lat: -30.0280, lng: -51.2200 },
  "bom fim":            { lat: -30.0350, lng: -51.2200 },
  "cidade baixa":       { lat: -30.0470, lng: -51.2200 },
  "santana":            { lat: -30.0230, lng: -51.2350 },
  "azenha":             { lat: -30.0520, lng: -51.2250 },
  "medianeira":         { lat: -30.0650, lng: -51.2100 },
  "glória":             { lat: -30.0750, lng: -51.2150 },
  "gloria":             { lat: -30.0750, lng: -51.2150 },
  "tristeza":           { lat: -30.1100, lng: -51.2200 },
  "teresópolis":        { lat: -30.0900, lng: -51.2200 },
  "teresopolis":        { lat: -30.0900, lng: -51.2200 },
  "rubem berta":        { lat: -29.9900, lng: -51.1750 },
  "anchieta":           { lat: -30.0550, lng: -51.1700 },
};

export interface CepResult {
  valid: boolean;
  distance?: number;
  address?: {
    logradouro: string;
    bairro: string;
    cidade: string;
    uf: string;
    cep: string;
  };
  error?: string;
}

export async function validateCep(cep: string): Promise<CepResult> {
  const cleaned = cep.replace(/\D/g, "");
  if (cleaned.length !== 8) return { valid: false, error: "CEP inválido" };

  const viacep = await fetch(`https://viacep.com.br/ws/${cleaned}/json/`);
  if (!viacep.ok) return { valid: false, error: "Erro ao consultar CEP" };

  const data = await viacep.json();
  if (data.erro) return { valid: false, error: "CEP não encontrado" };

  if (data.localidade !== "Porto Alegre") {
    return {
      valid: false,
      error: `Entregamos apenas em Porto Alegre — seu CEP é de ${data.localidade}/${data.uf}`,
    };
  }

  // Tenta encontrar o bairro no mapa local (rápido, sem API externa)
  const bairroKey = (data.bairro as string).toLowerCase().trim();
  const localCoords = POA_BAIRROS[bairroKey];

  let coords: { lat: number; lng: number } | null = localCoords ?? null;

  // Fallback: Nominatim só se o bairro não estiver no mapa local
  if (!coords) {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?postalcode=${cleaned}&country=BR&format=json&limit=1`,
        { headers: { "User-Agent": "freekitchen-shop/1.0" } }
      );
      if (res.ok) {
        const geo = await res.json();
        if (geo.length) coords = { lat: parseFloat(geo[0].lat), lng: parseFloat(geo[0].lon) };
      }
    } catch {
      // ignora erro de rede
    }
  }

  if (!coords) {
    return { valid: false, error: "Bairro não reconhecido. Tente outro CEP ou entre em contato." };
  }

  const distance = haversineKm(STORE_LAT, STORE_LNG, coords.lat, coords.lng);

  if (distance > MAX_DISTANCE_KM) {
    return {
      valid: false,
      distance,
      error: `Fora da área de entrega (${distance.toFixed(1)}km do Iguatemi — máximo ${MAX_DISTANCE_KM}km)`,
    };
  }

  return {
    valid: true,
    distance,
    address: {
      logradouro: data.logradouro,
      bairro: data.bairro,
      cidade: data.localidade,
      uf: data.uf,
      cep: data.cep,
    },
  };
}
