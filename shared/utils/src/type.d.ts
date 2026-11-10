/**
 * Matches any [primitive value](https://developer.mozilla.org/en-US/docs/Glossary/Primitive).
 */
export type Primitive = string | number | bigint | boolean | undefined | null

export type Satisfies<U, T extends U> = T

export type OmitStrict<T, K extends keyof T> = Omit<T, K>

export type OverrideStrict<
  Type,
  NewType extends {
    [Key in keyof Type]?: unknown
  },
> = Omit<Type, keyof NewType> & NewType

export type Status = "error" | "idle" | "pending" | "success"

export type NonFalsy<T> = T extends false | 0 | "" | null | undefined | 0n ? never : T

export type WidenLiteral<T> = T extends string
  ? string
  : T extends number
    ? number
    : T extends boolean
      ? boolean
      : T extends bigint
        ? bigint
        : T extends symbol
          ? symbol
          : T

/**
 * TypeScript Reset
 * Improve types for common JavaScript API's.
 * @see https://www.totaltypescript.com/ts-reset
 * @see https://github.com/mattpocock/ts-reset
 */
declare global {
  // Fetch API
  interface Body {
    json(): Promise<unknown>
  }

  // Web Storage API
  interface Storage {
    [name: string & {}]: unknown
  }

  interface Array<T> {
    filter<S extends T>(predicate: BooleanConstructor, thisArg?: any): NonFalsy<S>[]

    includes(searchElement: T | (WidenLiteral<T> & {}), fromIndex?: number): boolean

    lastIndexOf(searchElement: T | (WidenLiteral<T> & {}), fromIndex?: number): number
    indexOf(searchElement: T | (WidenLiteral<T> & {}), fromIndex?: number): number
  }

  interface ReadonlyArray<T> {
    filter<S extends T>(predicate: BooleanConstructor, thisArg?: any): NonFalsy<S>[]

    includes(searchElement: T | (WidenLiteral<T> & {}), fromIndex?: number): boolean

    lastIndexOf(searchElement: T | (WidenLiteral<T> & {}), fromIndex?: number): number
    indexOf(searchElement: T | (WidenLiteral<T> & {}), fromIndex?: number): number
  }

  interface ArrayConstructor {
    isArray(arg: any): arg is unknown[]
  }

  interface Set<T> {
    has(value: T | (WidenLiteral<T> & {})): boolean
  }

  interface ReadonlySet<T> {
    has(value: T | (WidenLiteral<T> & {})): boolean
  }

  type MapConstructor = new <K = unknown, V = unknown>() => Map<K, V>

  interface Map<K, V> {
    has(value: K | (WidenLiteral<K> & {})): boolean
  }

  interface ReadonlyMap<K, V> {
    has(value: K | (WidenLiteral<K> & {})): boolean
  }

  interface JSON {
    /**
     * Converts a JavaScript Object Notation (JSON) string into an object.
     * @param text A valid JSON string.
     * @param reviver A function that transforms the results. This function is called for each member of the object.
     * If a member contains nested objects, the nested objects are transformed before the parent object is.
     */
    parse(text: string, reviver?: (this: any, key: string, value: any) => any): unknown
  }

  interface Promise<T> {
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(
      onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null,
      onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
    ): Promise<TResult1 | TResult2>

    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(
      onrejected?: ((reason: unknown) => TResult | PromiseLike<TResult>) | null,
    ): Promise<T | TResult>
  }
}
