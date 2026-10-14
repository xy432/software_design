export class CommandLineParser {
  parse(line: string): string[] | null {
    const tokens: string[] = [];
    let current = "";
    let inQuotes = false;
    let sawToken = false;

    for (let index = 0; index < line.length; index += 1) {
      const char = line[index];
      if (char === undefined) {
        break;
      }
      if (!inQuotes && !sawToken && char === "#") {
        const word = line.slice(index).split(/[ \t]/)[0] ?? "";
        if (/^#[0-9a-fA-F]{3,8}$/.test(word)) {
          current = word;
          sawToken = true;
          index += word.length - 1;
          continue;
        }
        break;
      }
      if (char === '"') {
        inQuotes = !inQuotes;
        sawToken = true;
        continue;
      }
      if (!inQuotes && (char === " " || char === "\t")) {
        if (sawToken) {
          tokens.push(current);
          current = "";
          sawToken = false;
        }
        continue;
      }
      current += char;
      sawToken = true;
    }

    if (inQuotes) {
      throw new Error("error: unclosed quote");
    }
    if (sawToken) {
      tokens.push(current);
    }
    if (tokens.length === 0) {
      return null;
    }
    return tokens;
  }
}
