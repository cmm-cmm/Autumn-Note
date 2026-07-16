export class WrappedRange {
  constructor(sc: Node, so: number, ec: Node, eo: number);
  sc: Node;
  so: number;
  ec: Node;
  eo: number;
  isCollapsed(): boolean;
  toNativeRange(): Range;
  select(): void;
  commonAncestor(): Element | null;
  blockNode(editable: HTMLElement): Element | null;
  toString(): string;
  getClientRects(): DOMRect | null;
  insertNode(node: Node): void;
}
export function fromNativeRange(range: Range): WrappedRange;
export function currentRange(editable?: HTMLElement): WrappedRange | null;
export function rangeFromElement(el: HTMLElement): WrappedRange;
export function collapsedRange(node: Node, offset?: number): WrappedRange;
export function isSelectionInside(el: HTMLElement): boolean;
export function withSavedRange(fn: () => void): void;
export function splitText(textNode: Text, offset: number): [Text, Text];
