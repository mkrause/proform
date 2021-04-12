
import * as O from 'optics-ts';

import { classNames as cx, ComponentPropsWithoutRef } from './util/components.js';
import type { ClassNameArgument } from './util/components.js';
import * as React from 'react';

import * as Ctx from './FormContext.js';
import { AccessorProp, useAccessorFor } from './Accessor.js';
import type { FieldBufferProps } from './components/Field.js';


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
        FormContext,
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
