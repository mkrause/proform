
import $msg from 'message-tag';
import type { Updater } from '../util/types';
import { generateRandomId } from '../util/random'; // .js

import * as O from 'optics-ts';

import { isElement } from 'react-is';
import * as React from 'react';

import type { Optic } from '../Accessor'; // .js
import { Overlay } from './util';
import { ValidationError } from './Validation'; // .js


/*
Design notes:
  - We use a generic React context parameterized by the buffer type `A`.
    > TypeScript cannot automatically bind the type `A` based on the context provider, see:
      https://stackoverflow.com/a/52648865/233884
    > Thus, we need to wrap all components, hooks, etc. that consume the context in a function `<A>() => ...`.
      > We give the name a prefix (e.g. `make`) so that consumer code can use the plain name without the prefix:
        `const Context = makeContext<A>();`
      > For hooks we use a suffix `For` instead because hooks conventionally start with the prefix `use`.
      > If the value is a function without its own generics you could just add the generic `<A>`, without `makeX()`.
        > But if the function already has some generics you can't, because you can't partially apply generics in TS.
*/

// type MetaItem = {
//     _meta: true,
//     touched: boolean,
// };
// type Meta<A> = Overlay<A, MetaItem>;


// Validation

// Map of errors on a buffer type `A`, indexed by accessor into `A`
export type ValidationErrors<A> = Map<
    Optic<A, unknown>,
    string | React.ReactElement | ValidationError
>;
export type Validation<A> = Overlay<A, ValidationError>; // Validation object as overlay on `A`

// Create a `Validation<A>` overlay on the given buffer of type `A`, with errors at the corresponding locations
const validationFromErrors = <A,>(buffer: A, errors: ValidationErrors<A>): null | Validation<A> => {
    if (errors.size === 0) {
        return null;
    }
    
    const validation: Validation<A> = Array.from(errors.entries()).reduce(
        (validation, [accessor, error]) => {
            const validationError: ValidationError =
                error instanceof ValidationError ? error
                    : isElement(error) ? new ValidationError(undefined, error)
                    : typeof error === 'string' ? new ValidationError(error)
                    : (() => { throw new TypeError($msg`Invalid error type: ${error}`); })();
            
            try {
                const optic = accessor as Optic<Validation<A>, unknown>; // Widen from Optic<A> -> Optic<Validation<A>>
                return O.set(optic)(validationError)(validation);
            } catch (e) {
                console.error($msg`Invalid accessor found: ${accessor}`);
                return validation; // Ignore
            }
        },
        buffer as Validation<A>, // Widen from `A` -> `Validation<A>`
    );
    
    /* Alternative (slightly more efficient without the `reduce()`)
    let validation = buffer as Validation<A>; // Widen from `A` -> `Validation<A>`
    errors.forEach((error, accessor) => {
        const validationError: ValidationError =
            error instanceof ValidationError ? error
                : isElement(error) ? new ValidationError(undefined, error)
                : typeof error === 'string' ? new ValidationError(error)
                : (() => { throw new TypeError($msg`Invalid error type: ${error}`); })();
        
        try {
            const optic = accessor as Optic<Validation<A>, unknown>; // Widen from Optic<A> -> Optic<Validation<A>>
            validation = O.set(optic)(validationError)(validation);
        } catch (e) {
            console.error($msg`Invalid accessor found: ${accessor}`);
            // Ignore
        }
    });
    */
    
    return validation;
};


// The form context (i.e. the value of the React context)
export type FormContextState<A> = {
    formId: null | string, // Optional, globally unique identifier for the form (e.g. for nested `<form>` elements)
    
    buffer: A, // The form buffer (current form data as input by the user)
    //meta: Overlay<A, MetaItem>, // XXX May not need this, can just store metadata at the component (e.g. field) level
    validation: null | Validation<A>, // Result of validation, either `null` (no errors) or a `Validation` object
    
    // Note: wrapping these in `methods` allows us to get just the data part using `Omit<FormContextState, 'methods>`
    methods: {
        updateBuffer: (buffer: Updater<A>) => void,
        //updateMeta: (meta: Updater<Meta<A>>) => void,
        submit: () => Promise<void>,
    },
};

// React context type for `FormContextState`
// May be `null` if there is not yet any `FormProvider` as ancestor
export type FormContext<A> = React.Context<null | FormContextState<A>>;

export const makeFormContext = <A,>(): FormContext<A> => {
    return React.createContext<null | FormContextState<A>>(null);
};


export type FormProviderProps<A> = { // Note: exported so we can get the type without first needing a `FormContext`
    buffer: A,
    updateBuffer: FormContextState<A>['methods']['updateBuffer'],
    nestable?: boolean, // If `true`, requires a form `id` (or generates one if none given)
    id?: string, // Form ID, must be globally unique
    onSubmit: (buffer: A) => void | Promise<void>,
    validate?: (buffer: A) => ValidationErrors<A>,
    children: React.ReactNode,
};
export const makeFormProvider = <A,>(FormContext: FormContext<A>) =>
    function FormProvider(props: FormProviderProps<A>) { // Named function for DevTools
        const {
            buffer,
            updateBuffer,
            nestable = false,
            id,
            onSubmit,
            validate = () => new Map(),
            children,
        } = props;
        
        const formId = React.useMemo<null | string>(
            () => {
                if (!nestable) { return null; }
                return id ?? generateRandomId();
            },
            [nestable, id],
        );
        
        const validation = React.useMemo<null | Validation<A>>(
            () => validationFromErrors(buffer, validate(buffer)),
            [buffer, validate],
        );
        
        const submit = React.useCallback<FormContextState<A>['methods']['submit']>(async () => {
            if (validation !== null) {
                //console.log('errors', validation); // TEMP
                return;
            }
            
            await onSubmit(buffer);
        }, [onSubmit, buffer, validation]);
        
        const formContext = React.useMemo<FormContextState<A>>(() => ({
            formId,
            
            buffer,
            //meta: buffer as Meta<A>,
            validation,
            
            methods: {
                updateBuffer,
                //updateMeta: () => {},
                submit,
            },
        }), [formId, buffer, validation, updateBuffer, submit]);
        
        return (
            <FormContext.Provider value={formContext}>
                {children}
            </FormContext.Provider>
        );
    };

export const makeUseForm = <A,>(FormContext: FormContext<A>) =>
    function useForm(): FormContextState<A> { // Named function for DevTools
        const context = React.useContext(FormContext);
        
        if (context === null) {
            throw new Error(`Missing FormProvider. There should be a <FormProvider> ancestor element.`);
        }
        
        return context;
    };
// Shorthand version for direct use in a component
export const useForm = <A,>(FormContext: FormContext<A>): FormContextState<A> => {
    // Note: `FormContext` should never change after mount, so is not included as dependency
    const useForm = React.useMemo(() => makeUseForm(FormContext), []);
    
    return useForm();
};


// Convenience function to instantiate all context values at once
export const createFormContext = <A,>() => {
    const FormContext = makeFormContext<A>();
    
    return {
        FormContext,
        FormProvider: makeFormProvider<A>(FormContext),
        FormConsumer: FormContext.Consumer,
        useForm: makeUseForm<A>(FormContext),
    };
};
