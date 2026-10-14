import { parseOverrides } from "./override";
import overridesJson from "./override.json";

export const CATALOG_OVERRIDES = parseOverrides(overridesJson);
