
import $msg from 'message-tag';

import type { Updater } from './util/types';
import * as O from 'optics-ts';
//import type { DottedPath } from 'optics-ts/dist/lib/utils';

import * as React from 'react';

import * as Ctx from './context/FormContext';
import type { ControlBufferProps } from './components/Control';


type Optional<A> = undefined | A;
type Maybe<A> = null | A;

/*
Design notes:
  - Given a data type `S`, an *accessor* on `S` is a descriptor that tells you how to get and/or set a part of `S`.
  - Accessors are based on profunctor optics (hence the name "*pro*form"):
    - `Optic<S, A>` is the type of an optic on a *source* `S` with a *focal* type `A`
    - Optics can be specialized into:
      - `Lens<S, A>`, which focuses on a single `A` element (focus type `A`)
      - `Prism<S, A>`, which focuses on zero or one `A` elements (focus type `undefined | A`)
      - `Traversal<S, A>`, which focuses on zero or more `A` elements (focus type `Array<A>`)
*/

export type Lens<S, A> = O.Lens<S, O.OpticParams, A>;
export type Prism<S, A> = O.Prism<S, O.OpticParams, A>;
export type Traversal<S, A> = O.Traversal<S, O.OpticParams, A>;

export type Optic<S, A> = Lens<S, A> | Prism<S, A> | Traversal<S, A>;
export const Optic = O.optic().constructor;

export const isLens = (input: unknown): input is O.Lens<unknown, O.OpticParams, unknown> => {
    return input instanceof Optic && (input as any)._tag === 'Lens';
};
export const isPrism = (input: unknown): input is O.Prism<unknown, O.OpticParams, unknown> => {
    return input instanceof Optic && (input as any)._tag === 'Prism';
};
export const isTraversal = (input: unknown): input is O.Traversal<unknown, O.OpticParams, unknown> => {
    return input instanceof Optic && (input as any)._tag === 'Traversal';
};
export const isOptic = (input: unknown): input is Optic<unknown, unknown> => {
    return isLens(input) || isPrism(input) || isTraversal(input);
};

type LensFocus<A> = A;
// Note: use `undefined` as the empty sentinal value for prisms rather than `null`, because (1) nonexistence in prisms
// indicates the lack of a property, (2) `A` as a user space type should be able to use `null`, and (3) optics-ts
// uses it so less type conversion.
type PrismFocus<A> = Optional<A>;
type TraversalFocus<A> = Array<A>;
type OpticFocal<O extends Optic<unknown, any>> = O extends Optic<any, infer A> ? A : never;
type OpticFocus<O extends Optic<unknown, any>> =
    O extends { _tag: 'Lens' } ? LensFocus<OpticFocal<O>>
        : O extends { _tag: 'Prism' } ? PrismFocus<OpticFocal<O>>
        : O extends { _tag: 'Traversal' } ? TraversalFocus<OpticFocal<O>>
        : never;


type PathList = Array<PropertyKey>;
type PathDotted = string;
export type Accessor<S, A> =
    | Optic<S, A>
    | keyof S
    | PathList
    | PathDotted;

export const parseAccessor = <S, A>(accessor: Accessor<S, A>): Optic<S, A> => {
    const _ = O.optic<S>();
    
    // Note: parsing from non-optic (e.g. string path) lacks the type safety of the optics-ts methods, and we cannot
    // replicate that type safety here due to the lack of optics-ts internals. Prefer to use the optics-ts methods
    // instead.
    if (isOptic(accessor)) {
        return accessor as Optic<S, A>;
    } else if (Array.isArray(accessor)) {
        return _.path(...accessor) as unknown as Optic<S, A>;
    } else if (typeof accessor === 'string') {
        return _.path(accessor) as unknown as Optic<S, A>;
    } else if (typeof accessor === 'number' || typeof accessor === 'symbol') {
        return _.prop(accessor) as unknown as Optic<S, A>;
    } else {
        throw new TypeError($msg`Invalid accessor ${accessor}`);
    }
};


export type AccessorBufferProps<A> = {
    buffer: A,
    updateBuffer: (bufferUpdated: Updater<A>) => void,
};

export const useLensFor = <S,>(FormContext: Ctx.FormContext<S>) =>
    // Named function for DevTools
    function useLens<A,>(lens: Lens<S, A>): AccessorBufferProps<A> {
        const context = Ctx.useForm(FormContext);
        
        type FieldBuffer = A;
        const buffer = React.useMemo<FieldBuffer>(
            () => O.get(lens)(context.buffer),
            [context.buffer, lens],
        );
        const updateBuffer = React.useCallback<(fieldBufferUpdated: Updater<FieldBuffer>) => void>(
            (fieldBufferUpdated: Updater<FieldBuffer>) => {
                if (typeof fieldBufferUpdated === 'function') {
                    // Unsafe cast because the user may pass a function of an invalid type (we cannot check)
                    const updater = fieldBufferUpdated as (fieldBuffer: FieldBuffer) => void;
                    return context.methods.updateBuffer(O.modify(lens)(updater));
                } else {
                    return context.methods.updateBuffer(O.set(lens)(fieldBufferUpdated));
                }
            },
            [context.buffer, context.methods.updateBuffer, lens],
        );
        
        return { buffer, updateBuffer };
    };

export const usePrismFor = <S,>(FormContext: Ctx.FormContext<S>) =>
    // Named function for DevTools
    function usePrism<A,>(prism: Prism<S, A>): AccessorBufferProps<Optional<A>> {
        const context = Ctx.useForm(FormContext);
        
        type FieldBuffer = Optional<A>;
        const buffer = React.useMemo<FieldBuffer>(
            () => O.preview(prism)(context.buffer),
            [context.buffer, prism],
        );
        const updateBuffer = React.useCallback<(fieldBufferUpdated: Updater<FieldBuffer>) => void>(
            (fieldBufferUpdated: Updater<FieldBuffer>) => {
                return context.methods.updateBuffer((buffer: S) => {
                    // Note: in case the prism returns `undefined`, for an object property, it would be nice to
                    // remove the property from the buffer altogether, but currently optics-ts just sets it to
                    // `undefined`. `O.remove()` also does not work, because that is only supported for array elements.
                    if (typeof fieldBufferUpdated === 'function') {
                        // Unsafe cast because the user may pass a function of an invalid type (we cannot check)
                        const updater = fieldBufferUpdated as (fieldBuffer: FieldBuffer) => void;
                        return O.modify(prism)(updater)(buffer);
                    } else {
                        return O.set(prism)(fieldBufferUpdated)(buffer);
                    }
                });
            },
            [context.buffer, context.methods.updateBuffer, prism],
        );
        
        return { buffer, updateBuffer };
    };

export const useTraversalFor = <S,>(FormContext: Ctx.FormContext<S>) =>
    // Named function for DevTools
    function usePrism<A,>(prism: Prism<S, A>): AccessorBufferProps<Optional<A>> {
        const context = Ctx.useForm(FormContext);
        
        type FieldBuffer = Optional<A>;
        const buffer = React.useMemo<FieldBuffer>(
            () => O.preview(prism)(context.buffer),
            [context.buffer, prism],
        );
        const updateBuffer = React.useCallback<(fieldBufferUpdated: Updater<FieldBuffer>) => void>(
            (fieldBufferUpdated: Updater<FieldBuffer>) => {
                return context.methods.updateBuffer((buffer: S) => {
                    // Note: in case the prism returns `undefined`, for an object property, it would be nice to
                    // remove the property from the buffer altogether, but currently optics-ts just sets it to
                    // `undefined`. `O.remove()` also does not work, because that is only supported for array elements.
                    if (typeof fieldBufferUpdated === 'function') {
                        // Unsafe cast because the user may pass a function of an invalid type (we cannot check)
                        const updater = fieldBufferUpdated as (fieldBuffer: FieldBuffer) => void;
                        return O.modify(prism)(updater)(buffer);
                    } else {
                        return O.set(prism)(fieldBufferUpdated)(buffer);
                    }
                });
            },
            [context.buffer, context.methods.updateBuffer, prism],
        );
        
        return { buffer, updateBuffer };
    };

// Hook to get the result of an accessor in the current form context
export const useAccessorFor = <S,>(FormContext: Ctx.FormContext<S>) =>
    // Named function for DevTools
    function useAccessor<A,>(accessor: Accessor<S, A>): AccessorBufferProps<OpticFocus<Optic<S, A>>> {
        const context = Ctx.useForm(FormContext);
        
        const optic: Optic<S, A> = parseAccessor(accessor);
        
        type FieldBuffer = OpticFocus<Optic<S, A>>;
        const buffer = React.useMemo<FieldBuffer>(
            (): FieldBuffer => {
                if (isLens(optic)) {
                    return O.get(optic as O.Lens<S, O.OpticParams, A>)(context.buffer);
                } else if (isPrism(optic)) {
                    return O.preview(optic as O.Prism<S, O.OpticParams, A>)(context.buffer);
                } else if (isTraversal(optic)) {
                    return O.collect(optic as O.Traversal<S, O.OpticParams, A>)(context.buffer);
                } else {
                    throw new Error($msg`Invalid accessor ${optic}`);
                }
            },
            [context.buffer, optic],
        );
        const updateBuffer = React.useCallback<(fieldBufferUpdated: Updater<FieldBuffer>) => void>(
            (fieldBufferUpdated: Updater<FieldBuffer>) => {
                return context.methods.updateBuffer(O.set(optic)(fieldBufferUpdated));
            },
            [context.buffer, context.methods.updateBuffer, accessor],
        );
        
        return { buffer, updateBuffer };
    };

export type ConnectedControlBufferProps<A, F> = {
    accessor: Accessor<A, F>,
};

export const ConnectAccessor = <F, P extends ControlBufferProps<F>>(Component: React.ComponentType<P>) =>
    <A,>(FormContext: Ctx.FormContext<A>) => {
        type ElementRefT = React.ElementRef<typeof Component>;
        type RefT = React.PropsWithRef<P> extends { ref?: infer R } ? R : never;
        
        // Omit the direct buffer props and replace with `Accessor`-based props
        type PropsT = Omit<React.PropsWithoutRef<P>, keyof ControlBufferProps<F>> & ConnectedControlBufferProps<A, F>;
        
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
