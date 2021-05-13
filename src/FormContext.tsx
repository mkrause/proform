
import type { Updater } from './util/types';
import { generateRandomId } from './util/random.js';

import * as O from 'optics-ts';
import * as React from 'react';

import type { Accessor } from './Accessor.js';


/*
Design notes:
  - We use a generic React context parameterized by the buffer type `A`.
    > TypeScript cannot automatically bind the type `A` based on the context provider, see:
      https://stackoverflow.com/a/52648865/233884
    > Thus, we need to wrap all values that depend on `A` in a function `<A>() => ...`.
      > We give the name a prefix `make` so that consumer code can use the plain name without `make` prefix, e.g.:
        `const Context = makeContext<A>();`
      > For hooks we may use a suffix `For` instead because hooks conventionally start with `use`
      > If the value is a function without its own generics you could just add the generic `<A>`, without `makeX()`
        > But if the function already has some generics you can't, because you can't partially apply generics in TS.
*/


type Overlay<T, M> =
  T extends object
    ? {
      [K in keyof T]: T[K] | Overlay<T[K], M> | M
    }
    : T;

type MetaItem = {
    _meta: true,
    touched: boolean,
};
type Meta<A> = Overlay<A, MetaItem>;




// The form context (i.e. the value of the React context)
export type Validation<A> = Overlay<A, Error>;
export type FormContextState<A> = {
    formId?: string,
    
    buffer: A,
    //meta: Overlay<A, MetaItem>,
    validation: null | Validation<A>,
    
    // Note: wrapping these in `methods` allows us to get just the data part with `Omit<FormContextState, 'methods>`
    methods: {
      updateBuffer: (buffer: Updater<A>) => void,
      //updateMeta: (meta: Updater<Meta<A>>) => void,
      submit: () => Promise<void>,
    },
};

export type FormContext<A> = React.Context<null | FormContextState<A>>;

export const makeFormContext = <A,>(): FormContext<A> => {
    // May be `null` if there is not yet any `FormProvider` as ancestor
    return React.createContext<null | FormContextState<A>>(null);
};

export type ValidationError = Error;
export type ValidationErrors<A> = Map<Accessor<A, unknown>, string>;
const validationFromErrors = <A,>(buffer: A, errors: ValidationErrors<A>): null | Validation<A> => {
    if (errors.size === 0) {
        return null;
    }
    
    let validation = buffer as Validation<A>;
    errors.forEach((error, accessor) => {
        try {
            validation = O.set<Validation<A>, any, any>(accessor)(new Error(error))(validation);
        } catch (e) {
            console.error(`Invalid accessor found`);
            // Ignore
        }
    });
    
    return validation;
};

export type FormProviderProps<A> = { // Note: exported so we can get the type without first needing a FormContext
    buffer: A,
    updateBuffer: FormContextState<A>['methods']['updateBuffer'],
    nestable?: boolean,
    id?: string,
    onSubmit: (buffer: A) => void | Promise<void>,
    validate?: (buffer: A) => Map<Accessor<A, any>, ValidationError>,
    children: React.ReactNode,
};
export const makeFormProvider = <A,>(FormContext: FormContext<A>) =>
    function FormProvider(props: FormProviderProps<A>) {
        const {
            buffer,
            updateBuffer,
            nestable = false,
            id,
            onSubmit,
            validate = () => { return new Map(); },
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
                console.log('errors', validation);
                return;
            }
            
            await onSubmit(buffer);
        }, [onSubmit, buffer, validation]);
        
        const formContext = React.useMemo<FormContextState<A>>(() => ({
            formId: formId ?? undefined,
            
            buffer,
            //meta: buffer as Meta<A>,
            validation,
            
            methods: {
                updateBuffer,
                //updateMeta: () => {},
                submit,
            },
        }), [buffer, updateBuffer, formId, validation, submit]);
        
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
    // Note: `FormContext` should not change, so is not included as dependency
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
