export function splitIntoGroups(keys: string[], space: string = '\\'): Record<string, string[]> {
  const groups: Record<string, string[]> = {}
  keys.map(x => [x.split(space)[0],x]).forEach(([x,y]) => (groups[x] ??= []).push(y))
  return groups
}

export function replaceSpace(text: string, space: string = '\\', replace: string = ""): string {
  return text.split(space).join(replace)
}

export function softcapped_text(bool: boolean, text = 'softcapped'): string { return bool ? `<span class='soft'>(${text})</span>` : "" }

export function horHandleScroll (element: Element, event: WheelEvent) {
  if (element && element.scrollWidth > element.clientWidth && event.deltaY !== 0) {
    event.preventDefault();
    element.scrollLeft += event.deltaY
  };
}
