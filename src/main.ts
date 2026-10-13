import { EditorSession } from "./app/EditorSession";
import { CliRepl } from "./cli/CliRepl";

const repl = new CliRepl(new EditorSession());
await repl.run();
