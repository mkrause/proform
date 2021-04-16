
import * as O from 'optics-ts';
import type { DottedPath } from 'optics-ts/dist/lib/utils';

import * as React from 'react';

import * as Ctx from './FormContext.js';
import type { ControlBufferProps } from './components/Control.js';


//type RenderProp<P, C extends React.ReactNode = React.ReactNode> = C | ((props: P) => C);

export type Accessor<A, F> = O.Lens<A, O.OpticParams, F>;
export type AccessorResult<L extends Accessor<any, any>> = L extends Accessor<unknown, infer A> ? A : never;

export type AccessorProp<A, F> = PropertyKey | Array<PropertyKey> | Accessor<A, F>; // Accessor, or a path (string)
//const isPath = <A,>(path: unknown): path is DottedPath<A, string> => typeof path === 'string';

export const parseAccessor = <A, F>(accessor: AccessorProp<A, F>) => {
    const accessorParsed: Accessor<A, F> =
        typeof accessor === 'string' || typeof accessor === 'number' || typeof accessor === 'symbol'
            ? (O.optic<A>().path(accessor) as unknown as Accessor<A, F>)
            : Array.isArray(accessor)
                ? (O.optic<A>().path(...accessor) as unknown as Accessor<A, F>) // FIXME
                : accessor;
    
    return accessorParsed;
};

// Hook to get the result of an accessor in the current form context
export const useAccessorFor = <A,>(FormContext: Ctx.FormContext<A>) =>
    function useAccessor<F,>(accessor: AccessorProp<A, F>) { // Named function for DevTools
        const context = Ctx.useForm(FormContext);
        
        const accessorParsed: Accessor<A, F> = parseAccessor(accessor);
        
        type FieldBuffer = AccessorResult<typeof accessorParsed>;
        const buffer = React.useMemo(
            () => O.get(accessorParsed)(context.buffer),
            [context.buffer, accessorParsed]
        );
        const updateBuffer = React.useCallback((fieldBufferUpdated: FieldBuffer) =>
            context.methods.updateBuffer((buffer: A) => O.set(accessorParsed)(fieldBufferUpdated)(context.buffer)),
            [context.buffer, context.methods.updateBuffer, accessorParsed],
        );
        
        return { buffer, updateBuffer };
    };

export const ConnectAccessor = <F, P extends ControlBufferProps<F>>(Component: React.ComponentType<P>) =>
    <A,>(FormContext: Ctx.FormContext<A>) => {
        type ElementRefT = React.ElementRef<typeof Component>;
        type RefT = React.PropsWithRef<P> extends { ref?: infer R } ? R : never;
        type PropsT = Omit<React.PropsWithoutRef<P>, keyof ControlBufferProps<F>> & {
            accessor: AccessorProp<A, F>,
        };
        
        const forwarder: React.ForwardRefRenderFunction<ElementRefT, PropsT> = ({ accessor, ...props }, ref) => {
            const useAccessor = React.useMemo(() => useAccessorFor(FormContext), []);
            
            const { formId } = Ctx.useForm(FormContext);
            const { buffer, updateBuffer } = useAccessor(accessor);
            
            // Note: TS will complain that `P` may be instantiated with a different subtype of `FieldBufferProps<F>`.
            // We assume (but cannot enforce in the type constraint) that this is not the case.
            // @ts-ignore
            const propsWithRef: P = { ref, ...props, buffer, updateBuffer };
            return (
                <Component {...propsWithRef} form={formId}/>
            );
        };
        const displayName = `ProformConnect(${Component.displayName ?? 'Anonymous'})`;
        Object.defineProperty(forwarder, 'name', { value: displayName });
        
        return React.forwardRef<ElementRefT, PropsT>(forwarder);
    };
