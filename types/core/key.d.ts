export const key: Readonly<Record<'BACKSPACE' | 'TAB' | 'ENTER' | 'ESCAPE' | 'SPACE' | 'PAGE_UP' | 'PAGE_DOWN' | 'END' | 'HOME' | 'LEFT' | 'UP' | 'RIGHT' | 'DOWN' | 'DELETE' | 'NUM0' | 'NUM1' | 'NUM2' | 'NUM3' | 'NUM4' | 'NUM5' | 'NUM6' | 'NUM7' | 'NUM8' | 'B' | 'E' | 'I' | 'J' | 'K' | 'L' | 'R' | 'S' | 'U' | 'V' | 'Y' | 'Z' | 'SLASH' | 'PERIOD', string>>;
export function isKey(event: KeyboardEvent, keyName: string): boolean;
export function isModifier(event: KeyboardEvent, keyName: string): boolean;
