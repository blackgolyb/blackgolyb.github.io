export function renderTemplate(
  template: string,
  context: Record<string, unknown>,
): string {
  return template.replace(
    /\{\{([\w\.]+)\}\}/g,
    (_, key) => `${getNestedValue(context, key)}` || "",
  );
}

const getNestedValue = (
  obj: Record<string, unknown>,
  path: string,
): unknown => {
  return path.split(".").reduce((acc, part) => {
    if (acc && typeof acc === "object" && part in acc) {
      return acc[part];
    }
    return undefined;
  }, obj);
};
