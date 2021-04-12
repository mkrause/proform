
import * as O from 'optics-ts';
import type { DottedPath } from 'optics-ts/dist/lib/utils';

import { classNames as cx, ComponentPropsWithoutRef } from './util/components.js';
import type { ClassNameArgument } from './util/components.js';
import * as React from 'react';

import * as Ctx from './FormContext.js';


type RenderProp<P, C extends React.ReactNode = React.ReactNode> = C | ((props: P) => C);

export type Accessor<A, F> = O.Lens<A, O.OpticParams, F>;
type AccessorResult<L extends Accessor<any, any>> = L extends Accessor<unknown, infer A> ? A : never;

type AccessorProp<A, F> = PropertyKey | Array<PropertyKey> | Accessor<A, F>; // Accessor, or a path (string)
const isPath = <A,>(path: unknown): path is DottedPath<A, string> => typeof path === 'string';

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
const useAccessorFor = <A,>(FormContext: Ctx.FormContext<A>) => <F,>(accessor: AccessorProp<A, F>) => {
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

type FieldBufferProps<F> = {
    buffer: F,
    updateBuffer: (bufferUpdated: F) => void,
}

type InputTextProps = ComponentPropsWithoutRef<'input'> & FieldBufferProps<string>;
const InputText = ({ buffer, updateBuffer, ...props }: InputTextProps) => {
    return (
        <input
            type="text"
            value={buffer}
            {...props}
            className={cx(props.className)}
            onChange={(evt: React.ChangeEvent<HTMLInputElement>) => {
                updateBuffer(evt.target.value);
                
                // Call user-defined `onChange`, if any
                if (typeof props.onChange === 'function') { props.onChange(evt); }
            }}
        />
    );
};

type InputTextFieldProps<A> = Omit<InputTextProps, keyof FieldBufferProps<string>> & {
    accessor: AccessorProp<A, string>,
};
const InputTextField = <A,>(FormContext: Ctx.FormContext<A>) => ({ accessor, ...props }: InputTextFieldProps<A>) => {
    const useAccessor = React.useMemo(() => useAccessorFor(FormContext), []);
    
    const { buffer: inputBuffer, updateBuffer: updateInputBuffer } = useAccessor(accessor);
    return (
        <InputText {...props} buffer={inputBuffer} updateBuffer={updateInputBuffer}/>
    );
};

export const makeForm = <A,>() => {
    const { FormContext, FormProvider, useForm } = Ctx.createFormContext<A>();
    const useAccessor = useAccessorFor(FormContext);
    
    /*
    type FieldProps<F> = {
        accessor: AccessorProp<A, F>,
        children?: RenderProp<{ buffer: F, updateBuffer: (bufferUpdated: F) => void }>,
    };
    const Field = <F,>({ accessor, children }: FieldProps<F>) => {
        const { fieldBuffer, updateFieldBuffer } = useAccessor(accessor);
        
        return typeof children === 'function'
            ? children({ buffer: fieldBuffer, updateBuffer: updateFieldBuffer })
            : children;
        
        /*
        // Ref: https://github.com/facebook/react/issues/15156#issuecomment-474590693
        const element = React.useMemo(() => {
            return typeof children === 'function'
                ? children({ buffer: fieldBuffer, updateBuffer: updateFieldBuffer })
                : children;
        }, [context.buffer, fieldBuffer]);
        
        return element;
        * /
    };
    */
    
    return {
        FormProvider,
        
        // Hooks
        useForm,
        useAccessor,
        
        // Optics
        accessor: O.optic<A>(),
        path: O.optic<A>().path.bind(O.optic<A>()),
        
        //Field,
        
        // Field components
        InputText,
        InputTextField: InputTextField(FormContext),
    };
};
