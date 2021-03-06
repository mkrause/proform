
import * as O from 'optics-ts';

import { classNames as cx, ComponentPropsWithoutRef } from './util/components';
import type { ClassNameArgument } from './util/components';
import * as React from 'react';

import * as Ctx from './context/FormContext';
import { useAccessorFor } from './Accessor';
import type { ControlBufferProps } from './controls/Control';

import { connectText } from './controls/TextControl';
import { connectTextArea } from './controls/TextAreaControl';
import { connectCheckbox } from './controls/CheckboxControl';
import { connectCheckboxIndeterminate } from './controls/CheckboxIndeterminateControl';
import { connectCheckboxGroup, CheckboxGroupControl } from './controls/CheckboxGroupControl';
import { connectRadio, RadioControl } from './controls/RadioControl';
import { connectRadioGroup, RadioGroupControl } from './controls/RadioGroupControl';
import { connectSelect } from './controls/SelectControl';
import { connectSelectField } from './fields/SelectField';
import { connectSelectAll } from './controls/extra/SelectAllControl';
import { connectField } from './components/Field';
import { connectForm, connectFormNested } from './components/Form';
import { useValidationFor, connectValidationMessage } from './components/ValidationMessage';


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
        TextArea: connectTextArea(FormContext),
        Checkbox: connectCheckbox(FormContext),
        CheckboxIndeterminate: connectCheckboxIndeterminate(FormContext),
        CheckboxGroup: Object.assign(connectCheckboxGroup(FormContext), { Checkbox: CheckboxGroupControl.Checkbox }),
        Radio: connectRadio(FormContext),
        RadioGroup: Object.assign(connectRadioGroup(FormContext), { Radio: RadioGroupControl.Radio }),
        Select: connectSelect(FormContext),
        SelectField: connectSelectField(FormContext)(connectSelect(FormContext)),
        
        SelectAll: connectSelectAll(FormContext),
        
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
