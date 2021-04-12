
import { classNames as cx, ComponentPropsWithRef } from '../util/components.js';
import * as React from 'react';

import type { FieldBufferProps } from './Field.js';
import { ConnectAccessor } from '../Accessor.js';


type TextT = string; // Underlying data type
type TextProps = ComponentPropsWithRef<'input'> & FieldBufferProps<TextT>;
export const Text = React.forwardRef<HTMLSelectElement, TextProps>((props, ref) => {
    const { buffer, updateBuffer, ...propsRest } = props;
    return (
        <input
            type="text"
            value={buffer}
            {...propsRest}
            className={cx(propsRest.className)}
            onChange={(evt: React.ChangeEvent<HTMLInputElement>) => {
                updateBuffer(evt.target.value);
                
                // Call user-defined `onChange`, if any
                if (typeof propsRest.onChange === 'function') { propsRest.onChange(evt); }
            }}
        />
    );
});
Text.displayName = 'Text';

export const TextFor = ConnectAccessor<TextT, React.ComponentPropsWithoutRef<typeof Text>>(Text);
