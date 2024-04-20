export type SVGProps = Record<string, string | number>;
export type IconNodeChild = readonly [tag: string, attrs: SVGProps];
export type IconNode = readonly IconNodeChild[];
