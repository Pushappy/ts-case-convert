const isObject = (o: any) => o === Object(o) && !Array.isArray(o) && typeof o !== 'function';

function convertObject<
  TInput extends object,
  TResult extends
    | ObjectToCamel<TInput>
    | ObjectToSnake<TInput>
    | ObjectToPascal<TInput>,
>(obj: TInput, keyConverter: (arg: string) => string): TResult {
  if (obj === null || obj instanceof Date || typeof obj === 'undefined' || typeof obj !== 'object') {
    return obj as any;
  }

  const out = {} as TResult;


  for (const [ k, v ] of Object.entries(obj)) {
      if (v instanceof Blob) {
        // eslint-disable-next-line
        // @ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        out[ keyConverter(k) ] = v

        return out;
      }
      // eslint-disable-next-line
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      out[keyConverter(k)] = Array.isArray(v)
      ? (v.map(<ArrayItem extends object>(item: ArrayItem) =>
          typeof item === 'object'
            ? convertObject<
                ArrayItem,
                TResult extends ObjectToCamel<TInput>
                  ? ObjectToCamel<ArrayItem>
                  : TResult extends ObjectToPascal<TInput>
                  ? ObjectToPascal<ArrayItem>
                  : ObjectToSnake<ArrayItem>
              >(item, keyConverter)
            : item,
        ) as unknown[])
      : isObject(v)
      ? convertObject<
          typeof v,
          TResult extends ObjectToCamel<TInput>
            ? ObjectToCamel<typeof v>
            : TResult extends ObjectToPascal<TInput>
            ? ObjectToPascal<typeof v>
            : ObjectToSnake<typeof v>
        >(v, keyConverter)
      : (v as any);
  }

  return out;
}

const camelCache = new Map<string, string>();

export function toCamel<T extends string>(term: T): ToCamel<T> {
  if (camelCache.has(term)) {
    return camelCache.get(term)! as ToCamel<T>;
  }

  const result = (
    term.length === 1
      ? term.toLowerCase()
      : term
          .replace(/^([A-Z])/, (m) => m[0].toLowerCase())
          .replace(/[_-]([a-z0-9])/g, (m) => m[1].toUpperCase())
  );

  camelCache.set(term, result);
  return result as ToCamel<T>;
}

export function objectToCamel<T extends object>(obj: T): ObjectToCamel<T> {
  return convertObject(obj, toCamel);
}

export function toSnake(term: string): string {
  let result = term;
  let circuitBreaker = 0;

  while (
    (/([a-z])/.exec(result)?.length || 0) > 2 &&
    circuitBreaker < 10
  ) {
    result = result.replace(
      /([a-z])/,
      (_all, $1: string, $2: string) =>
        `${$1.toLowerCase()}_${$2.toLowerCase()}`,
    );

    circuitBreaker += 1;
  }

  while (
    (/(.+?)([A-Z])/.exec(result)?.length || 0) > 2 &&
    circuitBreaker < 10
  ) {
    result = result.replace(
      /(.+?)([A-Z])/,
      (_all, $1: string, $2: string) =>
        `${$1.toLowerCase()}_${$2.toLowerCase()}`,
    );
    circuitBreaker += 1;
  }

  return result.toLowerCase();
}

export function objectToSnake<T extends object>(obj: T): ObjectToSnake<T> {
  return convertObject(obj, toSnake);
}

export function toPascal(term: string): string {
  return toCamel(term).replace(/^([a-z])/, (m) => m[0].toUpperCase());
}

export function objectToPascal<T extends object>(obj: T): ObjectToPascal<T> {
  return convertObject(obj, toPascal);
}

export type ToCamel<S extends string | number | symbol> = S extends string
  ? S extends `${infer Head}_${infer Tail}`
    ? `${Uncapitalize<Head>}${Capitalize<ToCamel<Tail>>}`
    : Uncapitalize<S>
  : never;

export type ObjectToCamel<T extends object | undefined | null> =
  T extends undefined
    ? undefined
    : T extends null
    ? null
    : T extends Array<infer ArrayType>
    ? ArrayType extends object
      ? Array<ObjectToPascal<ArrayType>>
      : Array<ArrayType>
    : {
        [K in keyof T as ToCamel<K>]: T[K] extends
          | Array<infer ArrayType>
          | undefined
          | null
          ? ArrayType extends object
            ? Array<ObjectToCamel<ArrayType>>
            : Array<ArrayType>
          : T[K] extends object | undefined | null
          ? ObjectToCamel<T[K]>
          : T[K];
      };

export type ToPascal<S extends string | number | symbol> = S extends string
  ? S extends `${infer Head}_${infer Tail}`
    ? `${Capitalize<Head>}${Capitalize<ToCamel<Tail>>}`
    : Capitalize<S>
  : never;

export type ObjectToPascal<T extends object | undefined | null> =
  T extends undefined
    ? undefined
    : T extends null
    ? null
    : T extends Array<infer ArrayType>
    ? ArrayType extends object
      ? Array<ObjectToPascal<ArrayType>>
      : Array<ArrayType>
    : {
        [K in keyof T as ToPascal<K>]: T[K] extends
          | Array<infer ArrayType>
          | undefined
          | null
          ? ArrayType extends object
            ? Array<ObjectToPascal<ArrayType>>
            : Array<ArrayType>
          : T[K] extends object | undefined | null
          ? ObjectToPascal<T[K]>
          : T[K];
      };

export type ToSnake<S extends string | number | symbol> = S extends string
  ? S extends `${infer Head}${CapitalChars}${infer Tail}` // string has a capital char somewhere
    ? Head extends '' // there is a capital char in the first position
      ? Tail extends ''
        ? Lowercase<S> /*  'A' */
        : S extends `${infer Caps}${Tail}` // tail exists, has capital characters
        ? Caps extends CapitalChars
          ? Tail extends CapitalLetters
            ? `${Lowercase<Caps>}_${Lowercase<Tail>}` /* 'AB' */
            : Tail extends `${CapitalLetters}${string}`
            ? `${ToSnake<Caps>}_${ToSnake<Tail>}` /* first tail char is upper? 'ABcd' */
            : `${ToSnake<Caps>}${ToSnake<Tail>}` /* 'AbCD','AbcD',  */ /* TODO: if tail is only numbers, append without underscore */
          : never /* never reached, used for inference of caps */
        : never
      : Tail extends '' /* 'aB' 'abCD' 'ABCD' 'AB' */
      ? S extends `${Head}${infer Caps}`
        ? Caps extends CapitalChars
          ? Head extends Lowercase<Head> /* 'abcD' */
            ? Caps extends Numbers
              ? never /* stop union type forming */
              : `${ToSnake<Head>}_${ToSnake<Caps>}` /* 'abcD' 'abc25' */
            : never /* stop union type forming */
          : never
        : never /* never reached, used for inference of caps */
      : S extends `${Head}${infer Caps}${Tail}` /* 'abCd' 'ABCD' 'AbCd' 'ABcD' */
      ? Caps extends CapitalChars
        ? Head extends Lowercase<Head> /* is 'abCd' 'abCD' ? */
          ? Tail extends CapitalLetters /* is 'abCD' where Caps = 'C' */
            ? `${ToSnake<Head>}_${ToSnake<Caps>}_${Lowercase<Tail>}` /* aBCD Tail = 'D', Head = 'aB' */
            : Tail extends `${CapitalLetters}${string}` /* is 'aBCd' where Caps = 'B' */
            ? Head extends Numbers
              ? never /* stop union type forming */
              : Head extends `${string}${Numbers}`
              ? never /* stop union type forming */
              : `${Head}_${ToSnake<Caps>}_${ToSnake<Tail>}` /* 'aBCd' => `${'a'}_${Lowercase<'B'>}_${ToSnake<'Cd'>}` */
            : `${ToSnake<Head>}_${Lowercase<Caps>}${ToSnake<Tail>}` /* 'aBcD' where Caps = 'B' tail starts as lowercase */
          : never
        : never
      : never
    : S /* 'abc'  */
  : never;

export type ObjectToSnake<T extends object | undefined | null> =
  T extends undefined
    ? undefined
    : T extends null
    ? null
    : T extends Array<infer ArrayType>
    ? ArrayType extends object
      ? Array<ObjectToSnake<ArrayType>>
      : Array<ArrayType>
    : {
        [K in keyof T as ToSnake<K>]: T[K] extends
          | Array<infer ArrayType>
          | undefined
          | null
          ? ArrayType extends object
            ? Array<ObjectToSnake<ArrayType>>
            : Array<ArrayType>
          : T[K] extends object | undefined | null
          ? ObjectToSnake<T[K]>
          : T[K];
      };

type CapitalLetters =
  | 'A'
  | 'B'
  | 'C'
  | 'D'
  | 'E'
  | 'F'
  | 'G'
  | 'H'
  | 'I'
  | 'J'
  | 'K'
  | 'L'
  | 'M'
  | 'N'
  | 'O'
  | 'P'
  | 'Q'
  | 'R'
  | 'S'
  | 'T'
  | 'U'
  | 'V'
  | 'W'
  | 'X'
  | 'Y'
  | 'Z';

type Numbers = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';

type CapitalChars = CapitalLetters | Numbers;
