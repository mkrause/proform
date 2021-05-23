
// Given some data type `T` and a "meta" data type `M`, create a new type that matches `T` in structure but where
// each property of any object may be an instance of `M`.
export type Overlay<T, M> = M | (
    T extends object
        ? { [K in keyof T]: Overlay<T[K], M> }
        : T
);

/*
Example:
    type Person = { name: string, contact: { address: string, phone: string } };
    type PersonMeta = { accessed: boolean };
    type TestOverlay = Overlay<Person, PersonMeta>;

Result:
    type TestOverlay = PersonMeta | {
        name: PersonMeta | string,
        contact: PersonMeta | {
            address: PersonMeta | string,
            phone: PersonMeta | string,
        },
    };
*/
