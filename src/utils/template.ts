export type TemplateFilter = (value: string) => string;

export const templateFilters: Record<string, TemplateFilter> = {
  black: (value) => color(value, "\x1b[30m"),
  red: (value) => color(value, "\x1b[31m"),
  green: (value) => color(value, "\x1b[32m"),
  yellow: (value) => color(value, "\x1b[33m"),
  blue: (value) => color(value, "\x1b[34m"),
  magenta: (value) => color(value, "\x1b[35m"),
  cyan: (value) => color(value, "\x1b[36m"),
  white: (value) => color(value, "\x1b[37m"),
  gray: (value) => color(value, "\x1b[90m"),
  bold: (value) => color(value, "\x1b[1m"),
  dim: (value) => color(value, "\x1b[2m"),
  underline: (value) => color(value, "\x1b[4m"),
};

export function renderTemplate(
  template: string,
  context: Record<string, unknown>,
  filters: Record<string, TemplateFilter> = templateFilters,
): string {
  return template.replace(/\{\{\s*([^{}]+?)\s*\}\}/g, (_, expression: string) =>
    renderExpression(expression, context, filters),
  );
}

function renderExpression(
  expression: string,
  context: Record<string, unknown>,
  filters: Record<string, TemplateFilter>,
): string {
  const [input, ...filterNames] = expression
    .split("|")
    .map((part) => part.trim())
    .filter((part) => part.length > 0);

  if (!input) return "";

  return filterNames.reduce((value, filterName) => {
    const filter = filters[filterName];
    return filter ? filter(value) : value;
  }, resolveInput(input, context));
}

function resolveInput(input: string, context: Record<string, unknown>): string {
  const quotedInput = input.match(/^(?<quote>["'])(?<value>.*)\k<quote>$/);
  if (quotedInput?.groups) {
    return quotedInput.groups.value;
  }

  const value = getNestedValue(context, input);
  return value == null ? "" : `${value}`;
}

function color(value: string, ansi: string): string {
  return `${ansi}${value}\x1b[0m`;
}

const getNestedValue = (
  obj: Record<string, unknown>,
  path: string,
): unknown => {
  let value: unknown = obj;

  for (const part of path.split(".")) {
    if (value && typeof value === "object" && part in value) {
      value = (value as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }

  return value;
};
