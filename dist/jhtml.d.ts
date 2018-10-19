export function setWindow(win: import("jsdom").DOMWindow | (Window & typeof globalThis)): void;
export function toJSONObject(items?: Element | Element[], options?: {
    mode?: "JSON" | "JavaScript";
}): JSONObject;
export function toJSONString(items?: Element | Element[], options?: {
    mode?: "JSON" | "JavaScript";
}): string | string[];
export function toJHTMLString(jsonObj: JSONObject, options?: import("./SAJJ/SAJJ.js").SAJJOptions): string;
export function toJHTMLDOM(jsonObj: JSONObject, options?: import("./SAJJ/SAJJ.js").SAJJOptions): Element;
export { Stringifier };
export type GenericFunction = Function;
export type NonObject = undefined | null | boolean | number | bigint | symbol | string | Function | Date | RegExp;
export type JSONObjectPlain = {
    [key: string]: NonObject | JSONObject | JSONObject[];
};
export type JSONObjectArray = (NonObject | JSONObject)[];
export type JSONObject = NonObject | JSONObjectPlain | JSONObjectArray;
import Stringifier from './SAJJ/SAJJ.Stringifier.js';
//# sourceMappingURL=jhtml.d.ts.map