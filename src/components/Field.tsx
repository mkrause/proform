
import * as O from 'optics-ts';

import * as React from 'react';

import * as Ctx from '../context/FormContext.js';
import { Accessor, AccessorProp, parseAccessor } from '../Accessor.js';


export type FieldContext<A, F> = {
    accessor: Accessor<A, F>,
    touched: boolean,
    setTouched: (touched: boolean) => void,
};

export type FieldProps<A, F> = {
    accessor: AccessorProp<A, F>,
    children?: React.ReactNode | ((fieldContext: FieldContext<A, F>) => React.ReactNode),
};
export const connectField = <A,>(FormContext: Ctx.FormContext<A>) =>
    function Field<F>(props: FieldProps<A, F>) {
        const context = Ctx.useForm(FormContext);
        
        const accessor = React.useMemo<Accessor<Ctx.Validation<A>, F>>(
            () => parseAccessor(props.accessor),
            [props.accessor],
        );
        
        const [touched, setTouched] = React.useState<boolean>(false);
        
        const fieldContext: FieldContext<A, F> = {
            accessor,
            touched,
            setTouched,
        };
        
        let children;
        if (typeof props.children === 'function') {
            children = props.children(fieldContext);
        } else {
            children = props.children;
        }
        
        return (
            <FormContext.Provider value={context}>
                {children}
            </FormContext.Provider>
        );
    };
