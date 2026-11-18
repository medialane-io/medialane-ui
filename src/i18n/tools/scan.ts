import ts from "typescript";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

export interface Scan {
  sentences: Set<string>;
  plurals: Set<string>;
}

const literalText = (node: ts.Node | undefined): string | null =>
  node && (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) ? node.text : null;

export function scanSentences(files: Record<string, string>): Scan {
  const sentences = new Set<string>();
  const plurals = new Set<string>();
  for (const [name, text] of Object.entries(files)) {
    const kind = name.endsWith("x") ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
    const source = ts.createSourceFile(name, text, ts.ScriptTarget.Latest, true, kind);
    const visit = (node: ts.Node) => {
      if (ts.isCallExpression(node)) {
        const callee = node.expression;
        if (ts.isIdentifier(callee) && (callee.text === "t" || callee.text === "msg")) {
          const sentence = literalText(node.arguments[0]);
          if (sentence !== null) sentences.add(sentence);
        } else if (ts.isPropertyAccessExpression(callee) && ts.isIdentifier(callee.expression) && callee.expression.text === "t") {
          const first = literalText(node.arguments[0]);
          if (first !== null && callee.name.text === "plural") plurals.add(first);
          if (first !== null && callee.name.text === "rich") sentences.add(first);
        }
      }
      ts.forEachChild(node, visit);
    };
    visit(source);
  }
  return { sentences, plurals };
}

export function readSources(dir: string, skip: ReadonlySet<string> = new Set(["catalog"])): Record<string, string> {
  const files: Record<string, string> = {};
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) {
      if (!skip.has(name) && name !== "node_modules") Object.assign(files, readSources(path, skip));
    } else if (/\.tsx?$/.test(name) && !/\.test\.tsx?$/.test(name)) {
      files[path] = readFileSync(path, "utf8");
    }
  }
  return files;
}
