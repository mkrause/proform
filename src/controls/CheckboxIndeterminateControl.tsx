
import { classNames as cx, ComponentPropsWithRef } from '../util/components';
import * as React from 'react';

import type { ControlBufferProps } from '../components/Control';
import { ConnectAccessor } from '../Accessor';


type Ref<T> = null | React.RefCallback<T> | React.MutableRefObject<T>;

const useCombinedRefs = (...refs: Array<Ref<null | HTMLInputElement>>): React.RefObject<HTMLInputElement> => {
    const refCombined = React.useRef<HTMLInputElement>(null);
    
    React.useEffect(() => {
        for (const ref of refs) {
            if (!ref) {
                return;
            } else if (typeof ref === 'function') {
                ref(refCombined.current);
            } else {
                ref.current = refCombined.current;
            }
        }
    }, [refs]);
    
    return refCombined;
};

export type CheckboxIndeterminateBuffer = null | boolean;

type CheckboxIndeterminateControlProps = ComponentPropsWithRef<'input'> & ControlBufferProps<CheckboxIndeterminateBuffer>;
export const CheckboxIndeterminateControl = React.forwardRef<HTMLInputElement, CheckboxIndeterminateControlProps>(
    (props, refForwarded) => {
        const { buffer, updateBuffer, ...propsRest } = props;
        
        const refCheckboxIndeterminate = React.useRef<HTMLInputElement>(null);
        const ref = useCombinedRefs(refCheckboxIndeterminate, refForwarded);
        
        const handleChange = React.useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
            updateBuffer(evt.target.checked);
            
            // Call user-defined `onChange`, if any
            if (typeof propsRest.onChange === 'function') { propsRest.onChange(evt); }
        }, [updateBuffer, propsRest.onChange]);
        
        React.useEffect(() => {
            if (ref.current === null) { return; }
            
            if (buffer === null) {
                ref.current.indeterminate = true;
            } else {
                ref.current.indeterminate = false;
            }
        }, [buffer, ref.current]);
        
        return (
            <input
                ref={ref}
                type="checkbox"
                checked={buffer ?? false}
                {...propsRest}
                className={cx(propsRest.className)}
                onChange={handleChange}
            />
        );
    },
);
CheckboxIndeterminateControl.displayName = 'CheckboxIndeterminateControl';

export const connectCheckboxIndeterminate =
    ConnectAccessor<CheckboxIndeterminateBuffer, CheckboxIndeterminateControlProps>(CheckboxIndeterminateControl);
