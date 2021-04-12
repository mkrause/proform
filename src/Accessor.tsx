
import * as O from 'optics-ts';
import type { DottedPath } from 'optics-ts/dist/lib/utils';

import * as React from 'react';

import * as Ctx from './FormContext.js';


//type RenderProp<P, C extends React.ReactNode = React.ReactNode> = C | ((props: P) => C);

export type Accessor<A, F> = O.Lens<A, O.OpticParams, F>;
export type AccessorResult<L extends Accessor<any, any>> = L extends Accessor<unknown, infer A> ? A : never;

export type AccessorProp<A, F> = PropertyKey | Array<PropertyKey> | Accessor<A, F>; // Accessor, or a path (string)
//const isPath = <A,>(path: unknown): path is DottedPath<A, string> => typeof path === 'string';

const parseAccessor = <A, F>(accessor: AccessorProp<A, F>) => {
    const accessorParsed: Accessor<A, F> =
        typeof accessor === 'string' || typeof accessor === 'number' || typeof accessor === 'symbol'
            ? (O.optic<A>().path(accessor) as unknown as Accessor<A, F>)
            : Array.isArray(accessor)
                ? (O.optic<A>().path(...accessor) as unknown as Accessor<A, F>) // FIXME
                : accessor;
    
    return accessorParsed;
};

// Hook to get the result of an accessor in the current form context
export const useAccessorFor = <A,>(FormContext: Ctx.FormContext<A>) => <F,>(accessor: AccessorProp<A, F>) => {
    const context = Ctx.useForm(FormContext);
    
    const accessorParsed: Accessor<A, F> = parseAccessor(accessor);
    
    type FieldBuffer = AccessorResult<typeof accessorParsed>;
    
    const buffer = React.useMemo(
        () => O.get(accessorParsed)(context.buffer),
        [context.buffer, accessorParsed]
    );
    const updateBuffer = React.useCallback((fieldBufferUpdated: FieldBuffer) =>
        context.methods.updateBuffer((buffer: A) => O.set(accessorParsed)(fieldBufferUpdated)(context.buffer)),
        [context.buffer, accessorParsed],
    );
    
    return { buffer, updateBuffer };
};
