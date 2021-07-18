
import { classNames as cx, ComponentPropsWithRef } from '../util/components';
import * as React from 'react';

import type { ControlBufferProps } from './Control';
import { ConnectAccessor } from '../Accessor';


export type CheckboxBuffer = boolean;

type CheckboxControlProps = ComponentPropsWithRef<'input'> & ControlBufferProps<CheckboxBuffer>;
export const CheckboxControl = React.forwardRef<HTMLInputElement, CheckboxControlProps>((props, ref) => {
    const { buffer, updateBuffer, ...propsRest } = props;
    
    const handleChange = React.useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
        updateBuffer(evt.target.checked);
        
        // Call user-defined `onChange`, if any
        if (typeof propsRest.onChange === 'function') { propsRest.onChange(evt); }
    }, [updateBuffer, propsRest.onChange]);
    
    return (
        <input
            ref={ref}
            type="checkbox"
            checked={buffer}
            {...propsRest}
            className={cx(propsRest.className)}
            onChange={handleChange}
        />
    );
});
CheckboxControl.displayName = 'CheckboxControl';

export const connectCheckbox = ConnectAccessor<CheckboxBuffer, CheckboxControlProps>(
    CheckboxControl,
    { connectFormProp: true },
);
