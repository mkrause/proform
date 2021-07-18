
import { classNames as cx, ComponentPropsWithRef } from '../util/components';
import * as React from 'react';

import type { ControlBufferProps } from './Control';
import { ConnectAccessor } from '../Accessor';


export type OptionKey = string | number;
export type Option = {
    label: string,
};

// Note: we want to allow either `null`, or a valid option as buffer. The reason we want to allow `null` is:
// - In case we have zero options, we need some "empty" value.
// - We may want to force the user to make the initial selection, rather than choosing something ourselves.
export type SelectBuffer = null | OptionKey;

type SelectControlProps = ComponentPropsWithRef<'select'> & ControlBufferProps<SelectBuffer> & {
    placeholder?: string,
    options: Record<OptionKey, Option>,
};
export const SelectControl = React.forwardRef<HTMLSelectElement, SelectControlProps>((props, ref) => {
    const { buffer, updateBuffer, placeholder = 'Select', options, ...propsRest } = props;
    
    const handleChange = React.useCallback((evt: React.ChangeEvent<HTMLSelectElement>) => {
        const optionKey: OptionKey = evt.target.value;
        updateBuffer(optionKey);
        
        // Call user-defined `onChange`, if any
        if (typeof propsRest.onChange === 'function') { propsRest.onChange(evt); }
    }, [updateBuffer, propsRest.onChange]);
    
    return (
        <select
            ref={ref}
            value={buffer ?? ''}
            {...propsRest}
            className={cx(propsRest.className)}
            onChange={handleChange}
        >
            <option value="" disabled hidden>{placeholder}</option>
            {Object.entries(options).map(([optionKey, option]) =>
                <option key={optionKey} value={optionKey}>{option.label}</option>
            )}
        </select>
    );
});
SelectControl.displayName = 'SelectControl';

export const connectSelect = ConnectAccessor<SelectBuffer, SelectControlProps>(
    SelectControl,
    { connectFormProp: true },
);
