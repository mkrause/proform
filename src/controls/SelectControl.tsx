
import { classNames as cx, ComponentPropsWithRef } from '../util/components';
import * as React from 'react';

import type { ControlBufferProps } from '../components/Control';
import { ConnectAccessor } from '../Accessor';


export type OptionKey = string | number;
export type Option = {
    label: string,
};

export type SelectBuffer = OptionKey;

type SelectControlProps = ComponentPropsWithRef<'select'> & ControlBufferProps<SelectBuffer> & {
    options: Record<OptionKey, Option>,
};
export const SelectControl = React.forwardRef<HTMLSelectElement, SelectControlProps>((props, ref) => {
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
SelectControl.displayName = 'SelectControl';

export const connectSelect = ConnectAccessor<SelectBuffer, SelectControlProps>(SelectControl);
