
import * as O from 'optics-ts';

import * as React from 'react';

import * as Ctx from '../FormContext.js';
import { Accessor, AccessorProp, parseAccessor } from '../Accessor.js';


export type ValidationMessageProps<A, F> = {
    accessor: AccessorProp<A, F>,
    children?: React.ReactNode | (({ error }: { error: null | Ctx.ValidationError }) => React.ReactNode),
};
export const connectValidationMessage = <A,>(FormContext: Ctx.FormContext<A>) =>
    function ValidationMessage<F>(props: ValidationMessageProps<A, F>) {
        const { validation } = Ctx.useForm(FormContext);
        
        const accessor = parseAccessor(props.accessor) as Accessor<Ctx.Validation<A>, F>;
        
        let validationError: null | Ctx.ValidationError = null;
        if (validation !== null) {
            const result = O.get(accessor)(validation);
            
            if (result instanceof Error) {
                validationError = result;
            }
        }
        
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
