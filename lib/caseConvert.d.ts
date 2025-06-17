export declare function toCamel<T extends string>(term: T): ToCamel<T>;
export declare function objectToCamel<T extends object>(obj: T): ObjectToCamel<T>;
export declare function toSnake(term: string): string;
export declare function objectToSnake<T extends object>(obj: T): ObjectToSnake<T>;
export declare function toPascal(term: string): string;
export declare function objectToPascal<T extends object>(obj: T): ObjectToPascal<T>;
export declare type ToCamel<S extends string | number | symbol> = S extends string ? S extends `${infer Head}_${infer Tail}` ? `${Uncapitalize<Head>}${Capitalize<ToCamel<Tail>>}` : Uncapitalize<S> : never;
export declare type ObjectToCamel<T extends object | undefined | null> = T extends undefined ? undefined : T extends null ? null : T extends Array<infer ArrayType> ? ArrayType extends object ? Array<ObjectToPascal<ArrayType>> : Array<ArrayType> : {
    [K in keyof T as ToCamel<K>]: T[K] extends Array<infer ArrayType> | undefined | null ? ArrayType extends object ? Array<ObjectToCamel<ArrayType>> : Array<ArrayType> : T[K] extends object | undefined | null ? ObjectToCamel<T[K]> : T[K];
};
export declare type ToPascal<S extends string | number | symbol> = S extends string ? S extends `${infer Head}_${infer Tail}` ? `${Capitalize<Head>}${Capitalize<ToCamel<Tail>>}` : Capitalize<S> : never;
export declare type ObjectToPascal<T extends object | undefined | null> = T extends undefined ? undefined : T extends null ? null : T extends Array<infer ArrayType> ? ArrayType extends object ? Array<ObjectToPascal<ArrayType>> : Array<ArrayType> : {
    [K in keyof T as ToPascal<K>]: T[K] extends Array<infer ArrayType> | undefined | null ? ArrayType extends object ? Array<ObjectToPascal<ArrayType>> : Array<ArrayType> : T[K] extends object | undefined | null ? ObjectToPascal<T[K]> : T[K];
};
export declare type ToSnake<S extends string | number | symbol> = S extends string ? S extends `${infer Head}${CapitalChars}${infer Tail}` ? Head extends '' ? Tail extends '' ? Lowercase<S> : S extends `${infer Caps}${Tail}` ? Caps extends CapitalChars ? Tail extends CapitalLetters ? `${Lowercase<Caps>}_${Lowercase<Tail>}` : Tail extends `${CapitalLetters}${string}` ? `${ToSnake<Caps>}_${ToSnake<Tail>}` : `${ToSnake<Caps>}${ToSnake<Tail>}` : never : never : Tail extends '' ? S extends `${Head}${infer Caps}` ? Caps extends CapitalChars ? Head extends Lowercase<Head> ? Caps extends Numbers ? never : `${ToSnake<Head>}_${ToSnake<Caps>}` : never : never : never : S extends `${Head}${infer Caps}${Tail}` ? Caps extends CapitalChars ? Head extends Lowercase<Head> ? Tail extends CapitalLetters ? `${ToSnake<Head>}_${ToSnake<Caps>}_${Lowercase<Tail>}` : Tail extends `${CapitalLetters}${string}` ? Head extends Numbers ? never : Head extends `${string}${Numbers}` ? never : `${Head}_${ToSnake<Caps>}_${ToSnake<Tail>}` : `${ToSnake<Head>}_${Lowercase<Caps>}${ToSnake<Tail>}` : never : never : never : S : never;
export declare type ObjectToSnake<T extends object | undefined | null> = T extends undefined ? undefined : T extends null ? null : T extends Array<infer ArrayType> ? ArrayType extends object ? Array<ObjectToSnake<ArrayType>> : Array<ArrayType> : {
    [K in keyof T as ToSnake<K>]: T[K] extends Array<infer ArrayType> | undefined | null ? ArrayType extends object ? Array<ObjectToSnake<ArrayType>> : Array<ArrayType> : T[K] extends object | undefined | null ? ObjectToSnake<T[K]> : T[K];
};
declare type CapitalLetters = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K' | 'L' | 'M' | 'N' | 'O' | 'P' | 'Q' | 'R' | 'S' | 'T' | 'U' | 'V' | 'W' | 'X' | 'Y' | 'Z';
declare type Numbers = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';
declare type CapitalChars = CapitalLetters | Numbers;
export {};
