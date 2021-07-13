
import { generateRandomId } from '../util/random'; // .js

import { classNames as cx, ComponentPropsWithRef } from '../util/components'; // .js
import * as React from 'react';

import type { ControlBufferProps } from '../components/Control'; // .js
import { ConnectAccessor } from '../Accessor'; // .js


export type RadioButtonBuffer = boolean;
type RadioButtonControlProps = ComponentPropsWithRef<'input'> & ControlBufferProps<RadioButtonBuffer>;
export const RadioButtonControl = React.forwardRef<HTMLInputElement, RadioButtonControlProps>((props, ref) => {
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
RadioButtonControl.displayName = 'RadioButtonControl';


export type OptionKey = string | number;
export type Option = {};

// Note: we want to allow either `null`, or a valid option as buffer. The reason we want to allow `null` is:
// - In case we have zero options, we need some "empty" value.
// - We may want to force the user to make the initial selection, rather than choosing something ourselves.
export type RadioBuffer = null | OptionKey;

export type RadioContext<K extends OptionKey> = {
    id: string,
    options: Record<K, Option>,
    optionSelected: null | K,
    updateOptionSelected: ControlBufferProps<null | K>['updateBuffer'],
};
export const RadioContext = React.createContext<null | RadioContext<OptionKey>>(null);
RadioContext.displayName = 'RadioContext';


type RadioButtonControlConnectedProps = Omit<RadioButtonControlProps, keyof ControlBufferProps<RadioButtonBuffer>> & {
    option: OptionKey,
};
const RadioButtonControlConnected = React.forwardRef<
    React.ElementRef<typeof RadioButtonControl>,
    RadioButtonControlConnectedProps
>(
    ({ option, ...propsRest }, ref) => {
        const context = React.useContext(RadioContext);
        
        if (context === null) {
            throw new TypeError(`Missing RadioControl context provider`);
        }
        
        const { id, optionSelected, updateOptionSelected } = context;
        
        return (
            <RadioButtonControl
                ref={ref}
                value={option}
                {...propsRest}
                name={id}
                buffer={optionSelected === option}
                updateBuffer={(buffer: RadioButtonBuffer) => {
                    // If this radio is switched on, update the state to select the corresponding option
                    if (buffer) {
                        updateOptionSelected(option);
                    }
                }}
            />
        );
    },
);
RadioButtonControlConnected.displayName = 'Connected(RadioButtonControl)';


type RadioControlProps<K extends OptionKey> = ControlBufferProps<null | K> & {
    id?: string,
    options: Record<K, Option>,
    children?: React.ReactNode,
};
export const RadioControl = Object.assign(
    <K extends OptionKey>(props: RadioControlProps<K>) => {
        const { id: idOptional, options, buffer, updateBuffer, children } = props;
        const id = React.useMemo(() => idOptional ?? generateRandomId(), [idOptional]);
        
        const context = React.useMemo<RadioContext<K>>(() => ({
            id,
            options,
            optionSelected: buffer,
            updateOptionSelected: updateBuffer,
        }), [
            // Deep compare on `options`, so that children only rerender on a structural `options` change
            JSON.stringify(options),
            buffer,
            updateBuffer,
        ]);
        
        const Context = RadioContext as unknown as React.Context<RadioContext<K>>;
        return (
            <Context.Provider value={context}>
                {children}
            </Context.Provider>
        );
    },
    {
        displayName: 'RadioControl',
        RadioButton: RadioButtonControlConnected,
    },
);
RadioControl.displayName = 'RadioControl';

export const connectRadio = ConnectAccessor<RadioBuffer, RadioControlProps<OptionKey>>(RadioControl);
