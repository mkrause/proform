
import * as O from 'optics-ts';

import * as React from 'react';

import { ValidationError } from '../context/Validation';
import * as Ctx from '../context/FormContext';
import { Optic, isLens, Accessor, parseAccessor } from '../Accessor';


// Hook to get the result of an accessor in the current form context
export const useValidationFor = <A,>(FormContext: Ctx.FormContext<A>) =>
    // Named function for DevTools
    function useValidation<F,>(accessorProp: Accessor<A, F>): null | ValidationError {
        const { validation } = Ctx.useForm(FormContext);
        
        const accessor = React.useMemo<Optic<Ctx.Validation<A>, F>>(
            () => parseAccessor(accessorProp),
            [accessorProp],
        );
        
        let validationError: null | ValidationError = null;
        if (validation !== null && isLens(accessor)) {
            const result = O.get(accessor)(validation);
            
            if (result instanceof ValidationError) {
                validationError = result;
            }
        }
        return validationError;
    };

export type ValidationMessageProps<A, F> = {
    accessor: Accessor<A, F>,
    children?: React.ReactNode | (({ error }: { error: null | ValidationError }) => React.ReactNode),
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
