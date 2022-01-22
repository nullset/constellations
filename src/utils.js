// List of shadowDOM-able native elements from https://javascript.info/shadow-dom
export const nativeShadowDOMable = new Set([
  "ARTICLE",
  "ASIDE",
  "BLOCKQUOTE",
  "BODY",
  "DIV",
  "FOOTER",
  "H1",
  "H2",
  "H3",
  "H4",
  "H5",
  "H6",
  "HEADER",
  "MAIN",
  "NAV",
  "P",
  "SECTION",
  "SPAN",
]);

export function pascalCaseToSnakeCase(str) {
  if (str === "tabIndex") return "tabindex";
  return str
    .replace(/([A-Z])/g, (m) => `-${m.toLocaleLowerCase()}`)
    .replace(/^-/, "");
}

export function implicitSlotName(element) {
  return (
    element.getAttribute("slot") ??
    element.tagName.toLowerCase().replace(/^.+?-/, "")
  );
}
