
import { classNames as cx, ComponentPropsWithRef } from '../util/components.js';
import * as React from 'react';

import type { FieldBufferProps } from './Field.js';
import { ConnectAccessor } from '../Accessor.js';


export type OptionKey = PropertyKey;
export type Option = {
    label: string,
};

type SelectT = string; // Underlying data type
type SelectProps = ComponentPropsWithRef<'select'> & FieldBufferProps<SelectT> & {
    options: Record<OptionKey, Option>,
};
export const Select = React.forwardRef<HTMLSelectElement, SelectProps>((props, ref) => {
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
Select.displayName = 'Select';

export const SelectFor = ConnectAccessor<SelectT, React.ComponentPropsWithoutRef<typeof Select>>(Select);
