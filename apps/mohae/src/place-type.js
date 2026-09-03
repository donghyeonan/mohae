const TOKEN_PATTERNS = {
  restaurant: [
    /음식점|한식|양식|일식|중식|이탈리아|이탈리안|프랑스|스페인|멕시코|터키|고기|구이|국밥|국수|칼국수|냉면|막국수|라멘|소바|우동|만두|분식|요리|생선|조개|곱창|족발|순대|김밥|호떡|파스타|스파게티/,
    /\b(?:restaurant|cuisine|korean|japanese|chinese|french|italian|barbecue|noodles|sushi|steakhouse|steak|grill|vegan|vegetarian)\b/i,
  ],
  bar: [/와인|주점|펍|맥주/, /\b(?:bar|wine|pub|cocktail)\b/i, /^바(?:\(bar\))?$/i],
  cafe: [/카페|커피|디저트|브런치|케이크|아이스크림/, /\b(?:tea|cafe|coffee|dessert)\b/i, /^차$/],
  bakery: [/베이커리|제과|빵/, /\bbakery\b/i],
  culture: [/문화|예술|전시|영화|극장|서점|도서|음반|갤러리|화랑|공연/, /\b(?:museum|gallery|cinema|theatre|book)\b/i],
  activity: [/놀거리|힐링|공원|산책|요가|명상|캠핑|야영장|스케이트|썰매|수영장|테마파크|레저|체험|공방/, /\b(?:wellness|park|activity)\b/i, /^스파$/],
  shopping: [/쇼핑|문구|팬시|가구|인테리어|생활용품|구제의류|백화점|할인매장|스토어|상점|편집숍/, /\b(?:shop|store|retail)\b/i],
};

const SUBTYPE_ORDER = ["bakery", "cafe", "bar", "restaurant", "activity", "culture", "shopping"];

function tokens(values) {
  return values
    .flatMap((value) => String(value ?? "").toLowerCase().split(/[,/]/))
    .map((token) => token.trim())
    .filter(Boolean);
}

function matches(tokensToCheck) {
  return Object.fromEntries(Object.entries(TOKEN_PATTERNS).map(([type, patterns]) => [
    type,
    tokensToCheck.some((token) => patterns.some((pattern) => pattern.test(token))),
  ]));
}

export function matchingPlaceSubtypes(entry) {
  const result = matches(tokens(entry.categories ?? []));
  if (entry.source === "michelin_2026") result.restaurant = true;
  return result;
}

export function placeSubtype(entry) {
  if (entry.source === "michelin_2026") return "restaurant";
  const primary = matches(tokens([entry.currentCategory ?? entry.categories?.at(-1)]));
  const primaryType = SUBTYPE_ORDER.find((type) => primary[type]);
  if (primaryType) return primaryType;
  const all = matchingPlaceSubtypes(entry);
  return SUBTYPE_ORDER.find((type) => all[type]) ?? "other";
}

export function placeType(entry) {
  const subtype = placeSubtype(entry);
  if (subtype === "restaurant" || subtype === "bar") return "restaurant";
  if (subtype === "cafe" || subtype === "bakery") return "cafe";
  if (subtype === "culture" || subtype === "activity" || subtype === "shopping") return "culture";
  return "other";
}

export function matchingPlaceTypes(entry) {
  const matches = matchingPlaceSubtypes(entry);
  return {
    restaurant: matches.restaurant || matches.bar,
    cafe: matches.cafe || matches.bakery,
    culture: matches.culture || matches.activity || matches.shopping,
  };
}
