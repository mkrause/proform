
// Either a plain value `T` or a function `T => T`. Used to update some value of type `T` in a structure.
export type Updater<T> = T | ((value: T) => T);


// Adapted from optics-ts:
// https://github.com/akheron/optics-ts/blob/main/src/utils.ts

// Given a type `S`, and a list path `P`, return the type indexed by `P`, or `never` if invalid path
export type GetWithPathList<S, P extends Array<unknown>> =
    P extends []
        ? S // Empty path gives just `S`
        : P extends [infer K, ...infer R]
            ? K extends keyof S
                ? GetWithPathList<S[K], R>
                : never
            : never;

// Given a type `S`, and a dotted string path `P`, return the type indexed by `P`, or `never` if invalid path
// Note: if the path as a whole matches a key (e.g. if `"x.y.z"` is a key), interprets the path as the single key.
export type GetWithPathDotted<S, P> =
    P extends keyof S
        ? S[P]
        : P extends `${infer K}.${infer R}`
            ? K extends keyof S
                ? GetWithPathDotted<S[K], R>
                : never
            : P extends ''
                ? S
                : never;
