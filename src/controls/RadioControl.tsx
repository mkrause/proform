
import { classNames as cx, ComponentPropsWithRef } from '../util/components';
import * as React from 'react';

import type { ControlBufferProps } from '../components/Control';
import { ConnectAccessor } from '../Accessor';


export type RadioBuffer = boolean;
type RadioControlProps = ComponentPropsWithRef<'input'> & ControlBufferProps<RadioBuffer>;
export const RadioControl = React.forwardRef<HTMLInputElement, RadioControlProps>((props, ref) => {
    const { buffer, updateBuffer, ...propsRest } = props;
    
    const handleChange = React.useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
        updateBuffer(evt.target.checked);
        
        // Call user-defined `onChange`, if any
        if (typeof propsRest.onChange === 'function') { propsRest.onChange(evt); }
    }, [updateBuffer, propsRest.onChange]);
    
    return (
        <input
            ref={ref}
            type="radio"
            checked={buffer}
            {...propsRest}
            className={cx(propsRest.className)}
            onChange={handleChange}
        />
    );
});
RadioControl.displayName = 'RadioControl';

export const connectRadio = ConnectAccessor<RadioBuffer, RadioControlProps>(
    RadioControl,
    { connectFormProp: true },
);
