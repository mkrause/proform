
import * as O from 'optics-ts';

import * as React from 'react';

import * as Ctx from '../FormContext.js';
import { Accessor, AccessorProp, parseAccessor } from '../Accessor.js';


// Hook to get the result of an accessor in the current form context
export const useValidationFor = <A,>(FormContext: Ctx.FormContext<A>) =>
    // Named function for DevTools
    function useValidation<F,>(accessorProp: AccessorProp<A, F>): null | Ctx.ValidationError {
        const { validation } = Ctx.useForm(FormContext);
        
        const accessor = React.useMemo<Accessor<Ctx.Validation<A>, F>>(
            () => parseAccessor(accessorProp),
            [accessorProp],
        );
        
        let validationError: null | Ctx.ValidationError = null;
        if (validation !== null) {
            const result = O.get(accessor)(validation);
            
            if (result instanceof Error) {
                validationError = result;
            }
        }
        return validationError;
    };

export type ValidationMessageProps<A, F> = {
    accessor: AccessorProp<A, F>,
    children?: React.ReactNode | (({ error }: { error: null | Ctx.ValidationError }) => React.ReactNode),
};
export const connectValidationMessage = <A,>(FormContext: Ctx.FormContext<A>) =>
    function ValidationMessage<F>(props: ValidationMessageProps<A, F>): null | JSX.Element {
        const useValidation = React.useMemo(() => useValidationFor(FormContext), [FormContext]);
        
        const validationError = useValidation(props.accessor);
        
        if (typeof props.children === 'function') {
            return props.children({ error: validationError });
        } else {
            if (validationError === null) {
                return null;
            } else {
                return <>{validationError.message}</>;
            }
        }
    };
