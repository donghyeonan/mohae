const localeKey = (locale) => locale === "en" || locale?.startsWith("en") ? "en-KR" : "ko-KR";

export function localizeRecord(record, locale = "ko") {
  const localized = record.localizations?.[localeKey(locale)] ?? {};
  return {
    ...record,
    name: localized.name ?? record.name,
    description: localized.description ?? record.description,
    address: localized.address ?? record.address,
    location: localized.location ?? record.location,
    categories: localized.categories?.length ? localized.categories : record.categories,
  };
}

export function localizationSearchText(record) {
  return Object.values(record.localizations ?? {})
    .flatMap((localized) => [localized.name, localized.description, localized.address, localized.location, ...(localized.categories ?? [])])
    .filter(Boolean)
    .join(" ");
}
