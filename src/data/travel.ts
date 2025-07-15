import type { COUNTRY_CODE_TO_LONG_NAME } from "./countries"

type VisitedCountry = {
  code: keyof typeof COUNTRY_CODE_TO_LONG_NAME
  year: number
}

export const VISITED_COUNTRIES_TIMELINE: VisitedCountry[] = [
  { code: "BR", year: 2000 },
  { code: "BR", year: 2001 },
  { code: "BR", year: 2002 },
  { code: "BR", year: 2003 },
  { code: "BR", year: 2004 },
  { code: "BR", year: 2005 },
  { code: "BR", year: 2006 },
  { code: "BR", year: 2007 },
  { code: "BR", year: 2008 },
  { code: "BR", year: 2009 },
  { code: "BR", year: 2010 },
  { code: "BR", year: 2011 },
  { code: "BR", year: 2012 },
  { code: "BR", year: 2013 },
  { code: "BR", year: 2014 },
  { code: "BR", year: 2015 },
  { code: "BR", year: 2016 },
  { code: "BR", year: 2017 },
  { code: "BR", year: 2018 },
  { code: "BR", year: 2019 },
  { code: "BR", year: 2020 },
  { code: "BR", year: 2021 },
  { code: "PA", year: 2021 },
  { code: "ES", year: 2021 },
  { code: "DE", year: 2021 },
  { code: "LU", year: 2021 },
  { code: "DE", year: 2021 },
  { code: "CH", year: 2021 },
  { code: "FR", year: 2021 },
  { code: "DE", year: 2021 },
  { code: "PT", year: 2021 },
  { code: "ES", year: 2021 },
  { code: "DE", year: 2021 },
  { code: "BR", year: 2022 },
  { code: "US", year: 2023 },
  { code: "BR", year: 2023 },
  { code: "UY", year: 2024 },
  { code: "CW", year: 2024 },
  { code: "BR", year: 2024 },
  { code: "PR", year: 2024 },
  { code: "BR", year: 2024 },
  { code: "US", year: 2024 },
  { code: "CA", year: 2024 },
  { code: "BR", year: 2024 },
  { code: "GB", year: 2024 },
  { code: "BR", year: 2024 },
  { code: "DO", year: 2025 },
  { code: "BR", year: 2025 },
  { code: "US", year: 2025 },
  { code: "MX", year: 2025 },
  { code: "BR", year: 2025 },
  { code: "IT", year: 2025 },
  { code: "GB", year: 2025 },
  { code: "ES", year: 2025 },
  { code: "BR", year: 2025 },
]

export const VISITED_COUNTRIES = new Set(
  VISITED_COUNTRIES_TIMELINE.map((country) => country.code)
)
