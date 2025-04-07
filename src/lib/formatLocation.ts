/**
 * Formats a location string by converting state names to their 2-letter codes
 * @param location - Location string (can be "City, State" or just "State")
 * @returns Formatted location string with 2-letter state code
 */
export function formatLocation(location: string): string {
  // Handle "all" special case
  if (!location || location === 'all') {
    return location;
  }
  
  // Check if location contains a comma (indicating city, state format)
  if (location.includes(',')) {
    const [city, state] = location.split(',').map(part => part.trim());
    // Convert state to 2-letter code if possible
    const stateCode = stateNameToCode(state) || state;
    return `${city}, ${stateCode}`;
  }
  
  // If it's just a state name without city, convert to code
  return stateNameToCode(location) || location;
}

interface StateMap {
    [key: string]: string;
}

export function stateNameToCode(name: string): string | null {
    let states: StateMap = {
        "arizona": "AZ",
        "alabama": "AL",
        "alaska": "AK",
        "arkansas": "AR",
        "california": "CA",
        "colorado": "CO",
        "connecticut": "CT",
        "district of columbia": "DC",
        "delaware": "DE",
        "florida": "FL",
        "georgia": "GA",
        "hawaii": "HI",
        "idaho": "ID",
        "illinois": "IL",
        "indiana": "IN",
        "iowa": "IA",
        "kansas": "KS",
        "kentucky": "KY",
        "louisiana": "LA",
        "maine": "ME",
        "maryland": "MD",
        "massachusetts": "MA",
        "michigan": "MI",
        "minnesota": "MN",
        "mississippi": "MS",
        "missouri": "MO",
        "montana": "MT",
        "nebraska": "NE",
        "nevada": "NV",
        "new hampshire": "NH",
        "new jersey": "NJ",
        "new mexico": "NM",
        "new york": "NY",
        "north carolina": "NC",
        "north dakota": "ND",
        "ohio": "OH",
        "oklahoma": "OK",
        "oregon": "OR",
        "pennsylvania": "PA",
        "rhode island": "RI",
        "south carolina": "SC",
        "south dakota": "SD",
        "tennessee": "TN",
        "texas": "TX",
        "utah": "UT",
        "vermont": "VT",
        "virginia": "VA",
        "washington": "WA",
        "west virginia": "WV",
        "wisconsin": "WI",
        "wyoming": "WY",
        "american samoa": "AS",
        "guam": "GU",
        "northern mariana islands": "MP",
        "puerto rico": "PR",
        "us virgin islands": "VI",
        "us minor outlying islands": "UM"
    }

    let a = name.trim().replace(/[^\w ]/g, "").toLowerCase(); //Trim, remove all non-word characters with the exception of spaces, and convert to lowercase
    if(states[a] !== null) {
        return states[a];
    }

    return null;
}