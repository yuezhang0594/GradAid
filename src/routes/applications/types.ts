import { Id } from "../../../convex/_generated/dataModel";

export interface DocumentVersion {
  id: string;
  date: string;
  changes: string;
}

export interface DocumentState {
  content: string;
  recommenderName: string;
  recommenderEmail: string;
  showRecommenderDialog: boolean;
  isSaving: boolean;
}

export interface DocumentData {
  _id: Id<"applicationDocuments">;
  type: string;
  content: string;
  status: string;
  lastEdited?: string;
  recommenderName?: string;
  recommenderEmail?: string;
}
