/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as init from "../init.js";
import type * as profile from "../profile.js";
import type * as programs_favorites from "../programs/favorites.js";
import type * as programs_search from "../programs/search.js";
import type * as resend from "../resend.js";
import type * as userProfiles from "../userProfiles.js";
import type * as validators from "../validators.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  init: typeof init;
  profile: typeof profile;
  "programs/favorites": typeof programs_favorites;
  "programs/search": typeof programs_search;
  resend: typeof resend;
  userProfiles: typeof userProfiles;
  validators: typeof validators;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
