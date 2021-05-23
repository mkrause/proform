
import { classNames as cx, ComponentPropsWithRef } from '../util/components.js';
import * as React from 'react';

import { FormContext, useForm } from '../context/FormContext.js';


type FormProps = ComponentPropsWithRef<'form'> & {
    children?: React.ReactNode,
};
export const connectForm = <A,>(FormContext: FormContext<A>) => {
    const Form = React.forwardRef<HTMLFormElement, FormProps>(({ children, ...props }, ref) => {
        const { formId, methods: { submit } } = useForm(FormContext);
        
        const handleSubmit = React.useCallback((evt: React.FormEvent<HTMLFormElement>) => {
            evt.preventDefault();
            submit();
            
            // Call user-defined `onChange`, if any
            if (typeof props.onChange === 'function') { props.onChange(evt); }
        }, [submit, props.onChange]);
        
        return (
            <form
                ref={ref}
                method="post"
                action=""
                {...props}
                id={formId}
                className={cx(props.className)}
                onSubmit={handleSubmit}
            >
                {children}
            </form>
        );
    });
    Form.displayName = 'Form';
    
    return Form;
};



// Form element that uses a unique ID + the `form` attribute on inputs, as a workaround for nested forms:
// https://stackoverflow.com/a/54901309/233884
// Caveats:
//   - Seems to break easily. E.g. if a single `<button type="submit"/>` is included without a `form` attribute,
//     the link with the `<form>` element seems to be broken.
//   - Styling based on a `<form>` ancestor element will no longer work, need to provide your own wrapper element.
//     Also recommended to include `form:empty { display: none; }` in your styling.
type FormNestedProps = ComponentPropsWithRef<'form'> & {
    children?: React.ReactNode,
};
export const connectFormNested = <A,>(FormContext: FormContext<A>) => {
    const FormNested = React.forwardRef<HTMLFormElement, FormProps>(({ children, ...props }, ref) => {
        const { formId, methods: { submit } } = useForm(FormContext);
        
        const handleSubmit = React.useCallback((evt: React.FormEvent<HTMLFormElement>) => {
            evt.preventDefault();
            submit();
            
            // Call user-defined `onChange`, if any
            if (typeof props.onChange === 'function') { props.onChange(evt); }
        }, [submit, props.onChange]);
        
        return (
            <>
                <form
                    ref={ref}
                    {...props}
                    id={formId}
                    className={cx(props.className)}
                    onSubmit={handleSubmit}
                />
                {children}
            </>
        );
    });
    FormNested.displayName = 'FormNested';
    
    return FormNested;
};
