
import { classNames as cx, ComponentPropsWithRef } from '../util/components.js';
import * as React from 'react';

import type { ControlBufferProps } from '../components/Control.js';
import { ConnectAccessor } from '../Accessor.js';


export type OptionKey = string | number; // TODO: symbol?
export type Option = {
    label: string,
};

type SelectBuffer = Array<OptionKey>;

type SelectMultipleControlProps = ComponentPropsWithRef<'select'> & ControlBufferProps<SelectBuffer> & {
    options: Record<OptionKey, Option>,
};
export const SelectMultipleControl = React.forwardRef<HTMLSelectElement, SelectMultipleControlProps>((props, ref) => {
    const { buffer, updateBuffer, options, ...propsRest } = props;
    
    const handleChange = React.useCallback((evt: React.ChangeEvent<HTMLSelectElement>) => {
        const optionKey: OptionKey = evt.target.value;
        updateBuffer(optionKey);
        
        // Call user-defined `onChange`, if any
        if (typeof propsRest.onChange === 'function') { propsRest.onChange(evt); }
    }, [updateBuffer, propsRest.onChange]);
    
    return (
        <select
            ref={ref}
            value={buffer}
            {...propsRest}
            className={cx(propsRest.className)}
            onChange={handleChange}
        >
            {Object.entries(options).map(([optionKey, option]) =>
                <option key={optionKey} value={optionKey}>{option.label}</option>
            )}
        </select>
    );
});
SelectMultipleControl.displayName = 'SelectMultipleControl';

export const connectSelectMultiple = ConnectAccessor<SelectBuffer, SelectMultipleControlProps>(SelectMultipleControl);
