
import { classNames as cx, ComponentPropsWithRef } from '../util/components';
import * as React from 'react';

import type { ControlBufferProps } from '../components/Control';
import { ConnectAccessor } from '../Accessor';


export type TextBuffer = string;

type TextAreaControlProps = ComponentPropsWithRef<'textarea'> & ControlBufferProps<TextBuffer>;
export const TextAreaControl = React.forwardRef<HTMLTextAreaElement, TextAreaControlProps>((props, ref) => {
    const { buffer, updateBuffer, ...propsRest } = props;
    
    const handleChange = React.useCallback((evt: React.ChangeEvent<HTMLTextAreaElement>) => {
        updateBuffer(evt.target.value);
        
        // Call user-defined `onChange`, if any
        if (typeof propsRest.onChange === 'function') { propsRest.onChange(evt); }
    }, [updateBuffer, propsRest.onChange]);
    
    return (
        <textarea
            ref={ref}
            value={buffer}
            {...propsRest}
            className={cx(propsRest.className)}
            onChange={handleChange}
        />
    );
});
TextAreaControl.displayName = 'TextAreaControl';

export const connectTextArea = ConnectAccessor<TextBuffer, TextAreaControlProps>(
    TextAreaControl,
    { connectFormProp: true },
);
