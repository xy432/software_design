import { EditorContext } from "./EditorContext";

export interface Command {
  execute(context: EditorContext): string[];
  undo(context: EditorContext): string[];
  allowsMissingDocument(): boolean;
  recordInHistory(): boolean;
}
