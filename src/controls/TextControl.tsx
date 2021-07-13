
import { classNames as cx, ComponentPropsWithRef } from '../util/components'; // .js
import * as React from 'react';

import type { ControlBufferProps } from '../components/Control'; // .js
import { ConnectAccessor } from '../Accessor'; // .js


export type TextBuffer = string;

type TextControlProps = ComponentPropsWithRef<'input'> & ControlBufferProps<TextBuffer>;
export const TextControl = React.forwardRef<HTMLInputElement, TextControlProps>((props, ref) => {
    const { buffer, updateBuffer, ...propsRest } = props;
    
    const handleChange = React.useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
        updateBuffer(evt.target.value);
        
        // Call user-defined `onChange`, if any
        if (typeof propsRest.onChange === 'function') { propsRest.onChange(evt); }
    }, [updateBuffer, propsRest.onChange]);
    
    return (
        <input
            ref={ref}
            type="text"
            value={buffer}
            {...propsRest}
            className={cx(propsRest.className)}
            onChange={handleChange}
        />
    );
});
TextControl.displayName = 'TextControl';

export const connectText = ConnectAccessor<TextBuffer, TextControlProps>(TextControl);
