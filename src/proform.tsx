
import * as O from 'optics-ts';

import { classNames as cx, ComponentPropsWithoutRef } from './util/components.js';
import type { ClassNameArgument } from './util/components.js';
import * as React from 'react';

import * as Ctx from './context/FormContext.js';
import { useAccessorFor } from './Accessor.js';
import type { ControlBufferProps } from './components/Control.js';

import { connectText } from './controls/TextControl.js';
import { connectSelect } from './controls/SelectControl.js';
import { connectSelectField } from './fields/SelectField.js';
import { connectField } from './components/Field.js';
import { connectForm, connectFormNested } from './components/Form.js';
import { useValidationFor, connectValidationMessage } from './components/ValidationMessage.js';


export const makeForm = <A,>() => {
    const { FormContext, FormProvider, useForm } = Ctx.createFormContext<A>();
    const useAccessor = useAccessorFor(FormContext);
    
    /*
    type FieldProps<F> = {
        accessor: Accessor<A, F>,
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
        
        // Components
        Form: connectForm(FormContext),
        FormNested: connectFormNested(FormContext),
        Field: connectField(FormContext),
        
        //Field,
        
        // Control components
        Text: connectText(FormContext),
        Select: connectSelect(FormContext),
        SelectField: connectSelectField(FormContext)(connectSelect(FormContext)),
        
        // Validation
        useValidation: useValidationFor(FormContext),
        ValidationMessage: connectValidationMessage(FormContext),
    };
};

export const useFormProvider = <A,>() => {
    const Form = React.useMemo(() => makeForm<A>(), []);
    return Form;
};


// Utility types
export type FormSubmit<A> = Ctx.FormProviderProps<A>['onSubmit'];
export type FormValidate<A> = Required<Ctx.FormProviderProps<A>>['validate'];
