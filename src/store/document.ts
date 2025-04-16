import { atom } from "jotai";
import { Id } from "#/_generated/dataModel";

export const documentEditorAtom = atom<{
  applicationDocumentId: Id<"applicationDocuments"> | null;
}>({
  applicationDocumentId: null
});
