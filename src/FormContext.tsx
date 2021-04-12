
import { generateRandomId } from './util/random.js';

import * as React from 'react';


/*
Design notes:
  - We use a generic React context parameterized by the buffer type `A`.
    > TypeScript cannot automatically bind the type `A` based on the context provider, see:
      - https://stackoverflow.com/a/52648865/233884
    > Thus, we need to wrap all values that depend on `A` in a function `<A>() => ...`.
      > We give the name a prefix `make` so that consumer code can use the plain name without `make` prefix, e.g.:
        `const Context = makeContext<A>();`
      > For hooks we may use the `For` suffix instead because hooks need to start with `use`
      > If the value is a function that doesn't have generics you can just add the generic `<A>`, without `makeX()`
        > But then again if the function already has a generic you can't because you can't partially apply generics.
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





// Either a plain value `T` or a function `T => T`. Used to update some value of type `T` in a structure.
type Updater<T> = T | ((value: T) => T);

// The form context (i.e. the value of the React context)
export type FormContextState<A> = {
    buffer: A,
    //meta: Overlay<A, MetaItem>,
    
    // Note: wrapping these in `methods` allows us to get just the data part with `Omit<FormContextState, 'methods>`
    methods: {
      updateBuffer: (buffer: Updater<A>) => void,
      //updateMeta: (meta: Updater<Meta<A>>) => void,
    },
};

export type FormContext<A> = React.Context<null | FormContextState<A>>;

export const makeFormContext = <A,>(): FormContext<A> => {
    // May be `null` if there is not yet any `FormProvider` as ancestor
    return React.createContext<null | FormContextState<A>>(null);
};

type FormProviderProps<A> = {
    buffer: A,
    updateBuffer: FormContextState<A>['methods']['updateBuffer'],
    children: React.ReactNode,
};
export const makeFormProvider = <A,>(FormContext: FormContext<A>) => (props: FormProviderProps<A>) => {
    const { buffer, updateBuffer, children } = props;
    
    const formId = React.useMemo<string>(generateRandomId, []);
    
    const formContext = React.useMemo<FormContextState<A>>(() => ({
        formId,
        
        buffer,
        //meta: buffer as Meta<A>,
        
        methods: {
            updateBuffer,
            //updateMeta: () => {},
        },
    }), [buffer, updateBuffer]);
    
    return (
        <FormContext.Provider value={formContext}>
            <form
                id={formId}
                onSubmit={(evt: React.FormEvent<HTMLFormElement>) => {
                    evt.preventDefault();
                    console.log('submit', evt);
                    //submit();
                }}
            />
            
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
