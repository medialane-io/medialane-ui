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

export interface UnmarkedMessage {
  file: string;
  text: string;
}

const SCHEMA_RULES = new Set(["min", "max", "regex", "refine", "superRefine", "email", "url", "length", "addIssue"]);

export function scanUnmarkedMessages(files: Record<string, string>): UnmarkedMessage[] {
  const found: UnmarkedMessage[] = [];
  for (const [file, text] of Object.entries(files)) {
    const kind = file.endsWith("x") ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
    const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, kind);
    const report = (node: ts.Node | undefined): void => {
      if (!node) return;
      if (ts.isConditionalExpression(node)) {
        report(node.whenTrue);
        report(node.whenFalse);
        return;
      }
      if (ts.isParenthesizedExpression(node)) {
        report(node.expression);
        return;
      }
      if (ts.isObjectLiteralExpression(node)) {
        for (const property of node.properties) {
          if (ts.isPropertyAssignment(property) && property.name.getText(source) === "message") report(property.initializer);
        }
        return;
      }
      const sentence = literalText(node) ?? (ts.isTemplateExpression(node) ? node.getText(source).slice(1, -1) : null);
      if (sentence !== null && /^[A-Z].*\s/.test(sentence)) found.push({ file, text: sentence });
    };
    const visit = (node: ts.Node) => {
      if (ts.isCallExpression(node)) {
        const callee = node.expression;
        const method = ts.isPropertyAccessExpression(callee) ? callee.name.text : null;
        const name = ts.isIdentifier(callee) ? callee.text : null;
        if (method && SCHEMA_RULES.has(method) && !(ts.isPropertyAccessExpression(callee) && callee.expression.getText(source) === "Math")) {
          node.arguments.forEach(report);
        }
        if (name && (/^set\w*Error(Msg)?$/.test(name) || /^\w+Field$/.test(name))) node.arguments.forEach(report);
      }
      if (ts.isVariableDeclaration(node) && /_MESSAGE$/.test(node.name.getText(source))) report(node.initializer);
      ts.forEachChild(node, visit);
    };
    visit(source);
  }
  return found;
}
