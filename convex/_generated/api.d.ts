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
import type * as aiCredits_model from "../aiCredits/model.js";
import type * as aiCredits_mutations from "../aiCredits/mutations.js";
import type * as aiCredits_queries from "../aiCredits/queries.js";
import type * as applications_model from "../applications/model.js";
import type * as applications_mutations from "../applications/mutations.js";
import type * as applications_queries from "../applications/queries.js";
import type * as applications_timeline from "../applications/timeline.js";
import type * as dashboard_model from "../dashboard/model.js";
import type * as dashboard_queries from "../dashboard/queries.js";
import type * as documents_model from "../documents/model.js";
import type * as documents_mutations from "../documents/mutations.js";
import type * as documents_queries from "../documents/queries.js";
import type * as feedback from "../feedback.js";
import type * as http from "../http.js";
import type * as init from "../init.js";
import type * as profile from "../profile.js";
import type * as programs_favorites from "../programs/favorites.js";
import type * as programs_model from "../programs/model.js";
import type * as programs_queries from "../programs/queries.js";
import type * as resend from "../resend.js";
import type * as search_model from "../search/model.js";
import type * as search_search from "../search/search.js";
import type * as services_llm from "../services/llm.js";
import type * as universities_model from "../universities/model.js";
import type * as universities_queries from "../universities/queries.js";
import type * as userActivity_model from "../userActivity/model.js";
import type * as userActivity_queries from "../userActivity/queries.js";
import type * as userProfiles_mutations from "../userProfiles/mutations.js";
import type * as userProfiles_queries from "../userProfiles/queries.js";
import type * as users from "../users.js";
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
  "aiCredits/model": typeof aiCredits_model;
  "aiCredits/mutations": typeof aiCredits_mutations;
  "aiCredits/queries": typeof aiCredits_queries;
  "applications/model": typeof applications_model;
  "applications/mutations": typeof applications_mutations;
  "applications/queries": typeof applications_queries;
  "applications/timeline": typeof applications_timeline;
  "dashboard/model": typeof dashboard_model;
  "dashboard/queries": typeof dashboard_queries;
  "documents/model": typeof documents_model;
  "documents/mutations": typeof documents_mutations;
  "documents/queries": typeof documents_queries;
  feedback: typeof feedback;
  http: typeof http;
  init: typeof init;
  profile: typeof profile;
  "programs/favorites": typeof programs_favorites;
  "programs/model": typeof programs_model;
  "programs/queries": typeof programs_queries;
  resend: typeof resend;
  "search/model": typeof search_model;
  "search/search": typeof search_search;
  "services/llm": typeof services_llm;
  "universities/model": typeof universities_model;
  "universities/queries": typeof universities_queries;
  "userActivity/model": typeof userActivity_model;
  "userActivity/queries": typeof userActivity_queries;
  "userProfiles/mutations": typeof userProfiles_mutations;
  "userProfiles/queries": typeof userProfiles_queries;
  users: typeof users;
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
