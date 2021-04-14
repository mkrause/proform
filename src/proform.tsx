
import * as O from 'optics-ts';

import { classNames as cx, ComponentPropsWithoutRef } from './util/components.js';
import type { ClassNameArgument } from './util/components.js';
import * as React from 'react';

import * as Ctx from './FormContext.js';
import { AccessorProp, useAccessorFor } from './Accessor.js';
import type { ControlBufferProps } from './components/Control.js';

import { connectText } from './controls/Text.js';
import { connectSelect } from './controls/Select.js';
import { connectForm, connectFormNested } from './components/Form.js';


export const makeForm = <A,>() => {
    const { FormContext, FormProvider, useForm } = Ctx.createFormContext<A>();
    const useAccessor = useAccessorFor(FormContext);
    
    /*
    type FieldProps<F> = {
        accessor: AccessorProp<A, F>,
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
        //Field,
        
        // Field components
        Text: connectText(FormContext),
        Select: connectSelect(FormContext),
    };
};
