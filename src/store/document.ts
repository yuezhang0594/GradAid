import { atom } from "jotai";
import { Id } from "../../convex/_generated/dataModel";

export const documentEditorAtom = atom<{
  applicationDocumentId: Id<"applicationDocuments"> | null;
}>({
  applicationDocumentId: null
});
