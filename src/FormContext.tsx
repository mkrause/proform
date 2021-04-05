
import * as React from 'react';


export type FormContext<B> = {
    buffer: B,
    methods: {
      updateBuffer: (buffer: B | ((buffer: B) => B)) => void,
    },
};

// Note: need to use a generic function in order to use a generic React context
// https://stackoverflow.com/a/52648865/233884
export const createFormContext = <B,>() => {
    // Note: don't have an initial value, because we don't yet know the instance
    const FormContext = React.createContext<FormContext<B>>(null as unknown as FormContext<B>);
    
    type ProviderProps<B> = {
        buffer: B,
        updateBuffer: FormContext<B>['methods']['updateBuffer'],
        children?: React.ReactNode,
    };
    const FormProvider = ({ buffer, updateBuffer, children }: ProviderProps<B>) => {
        const formContext = {
            buffer,
            methods: {
                updateBuffer,
            },
        };
        
        return (
            <FormContext.Provider value={formContext}>
                {children}
            </FormContext.Provider>
        );
    };
    
    const useForm = () => React.useContext(FormContext);
    
    return {
        FormContext,
        FormProvider,
        FormConsumer: FormContext.Consumer,
        useForm,
    };
};
