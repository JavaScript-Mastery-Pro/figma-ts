export const getCoordsFromPointerEvent = <El>(
  e: PointerEvent
): {
  cursorSelectors: string[];
} | null => {
  if (!e.target || !(e.target as any)?.getBoundingClientRect) {
    return null;
  }

  // Get all parent elements
  const pathArray: HTMLElement[] =
    (e as any)._savedComposedPath || e.composedPath() || (e as any).path;

  // Generate a set of CSS selectors using the path
  const cursorSelectors = generateSelectors(pathArray);

  // Don't show cursor
  if (!cursorSelectors) {
    return null;
  }

  return {
    cursorSelectors,
  };
};

const generateSelectors = (pathArray: Element[]): string[] | null => {
  let nthChildFromLowestIdSelectors: string[] = [];
  let nthChildSelectors: string[] = [];
  let classNameSelectors: string[] = [];

  let dontShowCursors = false;
  let reachedBody = false;
  let lowestId: null | string = null;

  pathArray.forEach((el) => {
    if (reachedBody || dontShowCursors) {
      return;
    }

    if ((el as HTMLElement)?.dataset.hideCursors) {
      dontShowCursors = true;
      return;
    }

    if (el.nodeName?.toLowerCase() === "body") {
      reachedBody = true;
    }

    // Selector with nth child and HTML element types
    // More performant than: [...el.parentNode.children].indexOf(el) + 1
    if (el?.parentNode?.children) {
      const nthIndex =
        Array.prototype.indexOf.call(el.parentNode.children, el) + 1;
      const currentNthChild = `${el.nodeName}:nth-child(${nthIndex})`;
      nthChildSelectors.push(currentNthChild);
      if (!lowestId) {
        nthChildFromLowestIdSelectors.push(currentNthChild);
      }
    }

    // Selector same as above, but stops at nearest id
    if (!lowestId && el?.id && el?.parentNode?.children) {
      lowestId = el.id;
    }

    // Selector with just class names
    // More performant than: [...el.classList].map(CSS.escape).join('.')
    if (el.classList) {
      const classes = Array.prototype.map
        .call(el.classList, CSS.escape)
        .join(".");
      classNameSelectors.push(el.nodeName + (classes ? "." + classes : ""));
    } else {
      classNameSelectors.push(el.nodeName);
    }
  });

  if (dontShowCursors) {
    return null;
  }

  // If no id found, selector not needed
  if (!lowestId) {
    nthChildFromLowestIdSelectors = [];
  } else {
    nthChildFromLowestIdSelectors.pop();
    nthChildFromLowestIdSelectors.push(`#${lowestId}`);
  }

  // Create CSS selectors
  const classNamePath = classNameSelectors.reverse().join(">") || "";
  const nthChildPath = nthChildSelectors.reverse().join(">") || "";
  const nthChildPathFromLowestId =
    nthChildFromLowestIdSelectors.reverse().join(">") || "";

  // If last element has id
  const lastElement = pathArray[pathArray.length - 1];
  const id = lastElement?.id || "";

  return [id, nthChildPathFromLowestId, nthChildPath, classNamePath].filter(
    (selector) => selector
  );
};
