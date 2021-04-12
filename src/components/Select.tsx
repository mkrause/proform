
import * as O from 'optics-ts';
import type { DottedPath } from 'optics-ts/dist/lib/utils';

import { classNames as cx, ComponentPropsWithRef } from '../util/components.js';
import type { ClassNameArgument } from '../util/components.js';
import * as React from 'react';

import * as Ctx from '../FormContext.js';
import { AccessorProp, useAccessorFor } from '../Accessor.js';
import type { FieldBufferProps } from './Field.js';


export type OptionKey = PropertyKey;
export type Option = {
    label: string,
};

type SelectProps = ComponentPropsWithRef<'select'> & FieldBufferProps<string> & {
    options: Record<OptionKey, Option>,
};
export const Select = React.forwardRef<HTMLSelectElement, SelectProps>((props, ref) => {
    const { buffer, updateBuffer, options, ...propsRest } = props;
    return (
        <select
            ref={ref}
            value={buffer}
            {...propsRest}
            className={cx(propsRest.className)}
            onChange={(evt: React.ChangeEvent<HTMLSelectElement>) => {
                const optionKey: OptionKey = evt.target.value;
                updateBuffer(optionKey);
                
                // Call user-defined `onChange`, if any
                if (typeof propsRest.onChange === 'function') { propsRest.onChange(evt); }
            }}
        >
            {Object.entries(options).map(([optionKey, option]) =>
                <option key={optionKey} value={optionKey}>{option.label}</option>
            )}
        </select>
    );
});
Select.displayName = 'Select';


type SelectForProps<A> = Omit<SelectProps, keyof FieldBufferProps<string>> & {
    accessor: AccessorProp<A, string>,
};
export const SelectFor = <A,>(FormContext: Ctx.FormContext<A>) => {
    type ElementRefT = React.ElementRef<typeof Select>;
    type RefT = React.ComponentPropsWithRef<typeof Select>['ref'];
    type PropsT = SelectForProps<A>; //React.ComponentPropsWithoutRef<typeof Select>;
    
    const forwarder = ({ accessor, ...props }: PropsT, ref: RefT) => {
        const useAccessor = React.useMemo(() => useAccessorFor(FormContext), []);
        
        const { buffer, updateBuffer } = useAccessor(accessor);
        
        return (
            <Select ref={ref} {...props} buffer={buffer} updateBuffer={updateBuffer}/>
        );
    };
    Object.defineProperty(forwarder, 'name', { value: 'ConnectForm(Select)' });
    
    return React.forwardRef<ElementRefT, PropsT>(forwarder);
};

/*
export const ConnectAccessor = <P,>(Component: React.ComponentType<P>) => <A,>(FormContext: Ctx.FormContext<A>) => {
    type ElementRefT = React.ElementRef<typeof Select>;
    type RefT = React.ComponentPropsWithRef<typeof Select>['ref'];
    type PropsT = SelectForProps<A>;
};
*/
