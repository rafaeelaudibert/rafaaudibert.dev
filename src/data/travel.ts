import type { COUNTRY_CODE_TO_LONG_NAME } from "./countries"

export type CountryCode = keyof typeof COUNTRY_CODE_TO_LONG_NAME
type VisitedCountry = {
  code: CountryCode
  year: number
}

type Airport = {
  code: string // Can't type as `AirportCode` because it's defined dynamically from AIRPORTS below
  name: string
  location: [number, number]
  countryCode: CountryCode
}

export const AIRPORTS = {
  // Brazil
  POA: { code: "POA", name: "Porto Alegre", location: [-29.99, -51.17], countryCode: "BR" },
  GRU: { code: "GRU", name: "São Paulo-Guarulhos", location: [-23.43, -46.47], countryCode: "BR" },
  CGH: { code: "CGH", name: "São Paulo-Congonhas", location: [-23.63, -46.66], countryCode: "BR" },
  GIG: { code: "GIG", name: "Rio de Janeiro-Galeão", location: [-22.81, -43.25], countryCode: "BR" },
  SDU: { code: "SDU", name: "Rio de Janeiro-Santos Dumont", location: [-22.91, -43.16], countryCode: "BR" },
  CWB: { code: "CWB", name: "Curitiba", location: [-25.53, -49.17], countryCode: "BR" },
  JPA: { code: "JPA", name: "João Pessoa", location: [-7.15, -34.95], countryCode: "BR" },
  NVT: { code: "NVT", name: "Navegantes", location: [-26.88, -48.65], countryCode: "BR" },
  VCP: { code: "VCP", name: "Campinas-Viracopos", location: [-23.01, -47.13], countryCode: "BR" },
  REC: { code: "REC", name: "Recife", location: [-8.13, -34.92], countryCode: "BR" },
  CNF: { code: "CNF", name: "Belo Horizonte-Confins", location: [-19.63, -43.97], countryCode: "BR" },
  BSB: { code: "BSB", name: "Brasília", location: [-15.87, -47.92], countryCode: "BR" },
  NAT: { code: "NAT", name: "Natal", location: [-5.77, -35.38], countryCode: "BR" },
  FEN: { code: "FEN", name: "Fernando de Noronha", location: [-3.85, -32.42], countryCode: "BR" },
  FLN: { code: "FLN", name: "Florianópolis", location: [-27.67, -48.55], countryCode: "BR" },
  BYO: { code: "BYO", name: "Bonito", location: [-21.25, -56.45], countryCode: "BR" },
  // Latin America
  PTY: { code: "PTY", name: "Panama City-Tocumen", location: [9.07, -79.38], countryCode: "PA" },
  BOG: { code: "BOG", name: "Bogotá", location: [4.70, -74.15], countryCode: "CO" },
  LIM: { code: "LIM", name: "Lima", location: [-12.02, -77.11], countryCode: "PE" },
  AEP: { code: "AEP", name: "Buenos Aires-Aeroparque", location: [-34.56, -58.42], countryCode: "AR" },
  EZE: { code: "EZE", name: "Buenos Aires-Ezeiza", location: [-34.82, -58.54], countryCode: "AR" },
  MVD: { code: "MVD", name: "Montevideo", location: [-34.84, -56.03], countryCode: "UY" },
  SCL: { code: "SCL", name: "Santiago", location: [-33.39, -70.79], countryCode: "CL" },
  // Caribbean
  CUR: { code: "CUR", name: "Curaçao-Hato", location: [12.19, -68.96], countryCode: "CW" },
  SJU: { code: "SJU", name: "San Juan", location: [18.44, -66.00], countryCode: "PR" },
  PUJ: { code: "PUJ", name: "Punta Cana", location: [18.57, -68.37], countryCode: "DO" },
  // BGI: { code: "BGI", name: "Barbados-Grantley Adams", location: [13.07, -59.48], countryCode: "BB" }, // SOON!
  CUN: { code: "CUN", name: "Cancún", location: [21.04, -86.87], countryCode: "MX" },
  TQO: { code: "TQO", name: "Tulum", location: [20.24, -87.43], countryCode: "MX" },
  // United States
  JFK: { code: "JFK", name: "New York-JFK", location: [40.64, -73.78], countryCode: "US" },
  AUS: { code: "AUS", name: "Austin", location: [30.20, -97.67], countryCode: "US" },
  MIA: { code: "MIA", name: "Miami", location: [25.80, -80.29], countryCode: "US" },
  PHL: { code: "PHL", name: "Philadelphia", location: [39.87, -75.24], countryCode: "US" },
  ORD: { code: "ORD", name: "Chicago-O'Hare", location: [41.97, -87.91], countryCode: "US" },
  // Canada
  YYZ: { code: "YYZ", name: "Toronto-Pearson", location: [43.68, -79.63], countryCode: "CA" },
  YUL: { code: "YUL", name: "Montréal-Trudeau", location: [45.47, -73.74], countryCode: "CA" },
  // Spain
  MAD: { code: "MAD", name: "Madrid-Barajas", location: [40.47, -3.57], countryCode: "ES" },
  BCN: { code: "BCN", name: "Barcelona-El Prat", location: [41.30, 2.08], countryCode: "ES" },
  MAH: { code: "MAH", name: "Menorca-Mahón", location: [39.86, 4.22], countryCode: "ES" },
  PMI: { code: "PMI", name: "Palma de Mallorca", location: [39.55, 2.74], countryCode: "ES" },
  // Germany
  FRA: { code: "FRA", name: "Frankfurt", location: [50.03, 8.57], countryCode: "DE" },
  FKB: { code: "FKB", name: "Karlsruhe/Baden-Baden", location: [48.78, 8.08], countryCode: "DE" },
  // Portugal
  LIS: { code: "LIS", name: "Lisbon", location: [38.77, -9.13], countryCode: "PT" },
  OPO: { code: "OPO", name: "Porto", location: [41.24, -8.68], countryCode: "PT" },
  // United Kingdom
  LHR: { code: "LHR", name: "London-Heathrow", location: [51.47, -0.46], countryCode: "GB" },
  LCY: { code: "LCY", name: "London City", location: [51.50, 0.05], countryCode: "GB" },
  STN: { code: "STN", name: "London-Stansted", location: [51.89, 0.26], countryCode: "GB" },
  EDI: { code: "EDI", name: "Edinburgh", location: [55.95, -3.37], countryCode: "GB" },
  // Italy
  FCO: { code: "FCO", name: "Rome-Fiumicino", location: [41.80, 12.25], countryCode: "IT" },
  MXP: { code: "MXP", name: "Milan-Malpensa", location: [45.63, 8.72], countryCode: "IT" },
  OLB: { code: "OLB", name: "Olbia-Costa Smeralda", location: [40.90, 9.52], countryCode: "IT" },
} satisfies Record<string, Airport>

export type AirportCode = keyof typeof AIRPORTS

type Flight = {
  from: AirportCode
  to: AirportCode
  year: number
  layover?: boolean // don't count the `to` airport's country as visited
}

// These are NOT all my flights, only the ones that make sense to be put here
// All international flights are here, but I've not included some domestic flights
// to avoid looking repetitive - I go back and forth between POA and CGH often
export const FLIGHTS: Flight[] = [
  // 2019
  { from: "POA", to: "GRU", year: 2019, layover: true },
  { from: "GRU", to: "JPA", year: 2019 },
  { from: "JPA", to: "GRU", year: 2019, layover: true },
  { from: "GRU", to: "POA", year: 2019 },
  // 2021 - Europe
  { from: "POA", to: "PTY", year: 2021 },
  { from: "PTY", to: "MAD", year: 2021, layover: true },
  { from: "MAD", to: "FRA", year: 2021 },
  // LU, CH, FR - bus/train, no flights
  { from: "FRA", to: "BCN", year: 2021, layover: true },
  { from: "BCN", to: "MAH", year: 2021 },
  { from: "PMI", to: "BCN", year: 2021 },
  { from: "BCN", to: "FRA", year: 2021 },
  { from: "FKB", to: "LIS", year: 2021 },
  { from: "OPO", to: "MAD", year: 2021 },
  { from: "BCN", to: "FRA", year: 2021 },
  { from: "FRA", to: "GRU", year: 2022, layover: true },
  { from: "GRU", to: "POA", year: 2022 },
  // 2022 - Domestic
  { from: "POA", to: "GRU", year: 2022, layover: true },
  { from: "GRU", to: "REC", year: 2022 },
  { from: "REC", to: "GRU", year: 2022, layover: true },
  { from: "GRU", to: "POA", year: 2022 },
  { from: "POA", to: "SDU", year: 2022 },
  { from: "SDU", to: "POA", year: 2022 },
  // 2023 - US + domestic
  { from: "POA", to: "GRU", year: 2023, layover: true },
  { from: "GRU", to: "JFK", year: 2023 },
  { from: "JFK", to: "AUS", year: 2023 },
  { from: "AUS", to: "MIA", year: 2023 },
  { from: "MIA", to: "GRU", year: 2023, layover: true },
  { from: "GRU", to: "POA", year: 2023 },
  { from: "POA", to: "CNF", year: 2023 },
  { from: "CNF", to: "POA", year: 2023 },
  { from: "POA", to: "BSB", year: 2023 },
  { from: "BSB", to: "POA", year: 2023 },
  { from: "POA", to: "VCP", year: 2023, layover: true },
  { from: "VCP", to: "NAT", year: 2023, layover: true },
  { from: "NAT", to: "FEN", year: 2023 },
  { from: "FEN", to: "NAT", year: 2023, layover: true },
  { from: "NAT", to: "VCP", year: 2023, layover: true },
  { from: "VCP", to: "POA", year: 2023 },
  { from: "POA", to: "SDU", year: 2023 },
  { from: "SDU", to: "POA", year: 2023 },
  { from: "POA", to: "PTY", year: 2023, layover: true },
  { from: "PTY", to: "AUS", year: 2023 },
  { from: "AUS", to: "PTY", year: 2023, layover: true },
  { from: "PTY", to: "POA", year: 2023 },
  // 2024 - UY, CW, PR, US/CA, IT/GB
  { from: "POA", to: "CWB", year: 2024, layover: true },
  { from: "CWB", to: "MVD", year: 2024 },
  { from: "MVD", to: "PTY", year: 2024, layover: true },
  { from: "PTY", to: "CUR", year: 2024 },
  { from: "CUR", to: "BOG", year: 2024, layover: true },
  { from: "BOG", to: "GRU", year: 2024, layover: true },
  { from: "GRU", to: "POA", year: 2024 },
  { from: "POA", to: "PTY", year: 2024, layover: true },
  { from: "PTY", to: "SJU", year: 2024 },
  { from: "SJU", to: "PTY", year: 2024, layover: true },
  { from: "PTY", to: "GRU", year: 2024, layover: true },
  { from: "CGH", to: "NVT", year: 2024 },
  { from: "FLN", to: "GRU", year: 2024, layover: true },
  { from: "GRU", to: "JFK", year: 2024 },
  { from: "PHL", to: "YUL", year: 2024 },
  { from: "YYZ", to: "ORD", year: 2024, layover: true },
  { from: "ORD", to: "GRU", year: 2024, layover: true },
  { from: "GRU", to: "POA", year: 2024 },
  { from: "POA", to: "GRU", year: 2024, layover: true },
  { from: "GRU", to: "BYO", year: 2024 },
  { from: "BYO", to: "GRU", year: 2024, layover: true },
  { from: "GRU", to: "POA", year: 2024 },
  { from: "POA", to: "GRU", year: 2024, layover: true },
  { from: "GRU", to: "FCO", year: 2024, layover: true },
  { from: "FCO", to: "LCY", year: 2024 },
  { from: "LCY", to: "FCO", year: 2024, layover: true },
  { from: "FCO", to: "GRU", year: 2024, layover: true },
  { from: "GRU", to: "POA", year: 2024 },
  // 2025 - DO, US/MX, IT/GB/ES, CL, AR/UY
  { from: "POA", to: "LIM", year: 2025, layover: true },
  { from: "LIM", to: "PUJ", year: 2025 },
  { from: "PUJ", to: "LIM", year: 2025, layover: true },
  { from: "LIM", to: "GRU", year: 2025, layover: true },
  { from: "GRU", to: "POA", year: 2025 },
  { from: "POA", to: "PTY", year: 2025, layover: true },
  { from: "PTY", to: "MIA", year: 2025 },
  { from: "MIA", to: "TQO", year: 2025 },
  { from: "CUN", to: "PTY", year: 2025, layover: true },
  { from: "PTY", to: "POA", year: 2025 },
  { from: "POA", to: "GRU", year: 2025, layover: true },
  { from: "GRU", to: "MAD", year: 2025, layover: true },
  { from: "MAD", to: "MXP", year: 2025 },
  { from: "MXP", to: "OLB", year: 2025 },
  { from: "OLB", to: "EDI", year: 2025 },
  { from: "STN", to: "BCN", year: 2025 },
  { from: "BCN", to: "GRU", year: 2025, layover: true },
  { from: "GRU", to: "POA", year: 2025 },
  { from: "POA", to: "SCL", year: 2025 },
  { from: "SCL", to: "POA", year: 2025 },
  { from: "POA", to: "AEP", year: 2025 },
  { from: "AEP", to: "POA", year: 2025 },
  // 2026
  // SOON!
  // { from: "POA", to: "PTY", year: 2026, layover: true },
  // { from: "PTY", to: "BGI", year: 2026 },
  // { from: "BGI", to: "PTY", year: 2026, layover: true },
  // { from: "PTY", to: "POA", year: 2026 },
]

// Home country — generates a visit entry for every year since birth
const HOME_COUNTRY: CountryCode = "BR"
const HOME_SINCE = 2000

// Countries visited by non-flight means (train, bus, ferry, walk, etc.)
const NON_FLIGHT_VISITS: VisitedCountry[] = [
  { code: "LU", year: 2021 }, // Bus from Saarbrucken (DE) to Luxembourg City
  { code: "CH", year: 2021 }, // Train from Kaiserslautern to Basel (DE) + Bus from Grenoble to Geneve (FR)
  { code: "FR", year: 2021 }, // Train from Kaiserslautern to Strasbourg (DE) + Bus from Freiburg to Grenoble (DE)
]

// Derived from FLIGHTS + AIRPORTS + the above supplements
export const VISITED_COUNTRIES_TIMELINE: VisitedCountry[] = (() => {
  const seen = new Set<string>()
  const timeline: VisitedCountry[] = []

  const add = (code: CountryCode, year: number) => {
    const key = `${code}-${year}`
    if (seen.has(key)) return
    seen.add(key)
    timeline.push({ code, year })
  }

  // Home country for every year
  const currentYear = new Date().getFullYear()
  for (let y = HOME_SINCE; y <= currentYear; y++) add(HOME_COUNTRY, y)

  // Countries from flight legs (layover = don't count the destination country)
  for (const flight of FLIGHTS) {
    if (!flight.layover) add(AIRPORTS[flight.to].countryCode, flight.year)
  }

  // Non-flight visits
  for (const v of NON_FLIGHT_VISITS) add(v.code, v.year)

  timeline.sort((a, b) => a.year - b.year)
  return timeline
})()

export const VISITED_COUNTRIES = new Set(
  VISITED_COUNTRIES_TIMELINE.map((country) => country.code)
)
