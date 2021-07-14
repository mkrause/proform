
import { generateRandomId } from '../util/random';

import { classNames as cx, ComponentPropsWithRef } from '../util/components';
import * as React from 'react';

import type { ControlBufferProps } from '../components/Control';
import { ConnectAccessor } from '../Accessor';

import type { RadioBuffer } from './RadioControl';
import { RadioControl } from './RadioControl';


type RadioControlProps = React.ComponentPropsWithRef<typeof RadioControl>;

export type OptionKey = string | number;
export type Option = {};

// Note: we want to allow either `null`, or a valid option as buffer. The reason we want to allow `null` is:
// - In case we have zero options, we need some "empty" value.
// - We may want to force the user to make the initial selection, rather than choosing something ourselves.
export type RadioGroupBuffer = null | OptionKey;

export type RadioGroupContext<K extends OptionKey> = {
    id: string,
    options: Record<K, Option>,
    optionSelected: null | K,
    updateOptionSelected: ControlBufferProps<null | K>['updateBuffer'],
};
export const RadioGroupContext = React.createContext<null | RadioGroupContext<OptionKey>>(null);
RadioGroupContext.displayName = 'RadioGroupContext';


type RadioControlConnectedProps = Omit<RadioControlProps, keyof ControlBufferProps<RadioBuffer>> & {
    option: OptionKey,
};
const RadioControlConnected = React.forwardRef<
    React.ElementRef<typeof RadioControl>,
    RadioControlConnectedProps
>(
    ({ option, ...propsRest }, ref) => {
        const context = React.useContext(RadioGroupContext);
        
        if (context === null) {
            throw new TypeError(`Missing RadioGroupControl context provider`);
        }
        
        const { id, options, optionSelected, updateOptionSelected } = context;
        
        if (!Object.keys(options).includes(String(option))) {
            throw new TypeError(`Invalid option ${option}`);
        }
        
        return (
            <RadioControl
                ref={ref}
                value={option}
                {...propsRest}
                name={id}
                buffer={optionSelected === option}
                updateBuffer={(buffer: RadioBuffer) => {
                    // If this radio is switched on, update the state to select the corresponding option
                    if (buffer) {
                        updateOptionSelected(option);
                    }
                }}
            />
        );
    },
);
RadioControlConnected.displayName = 'Connected(RadioControl)';


type RadioGroupControlProps<K extends OptionKey> = ControlBufferProps<null | K> & {
    id?: string,
    options: Record<K, Option>,
    children?: React.ReactNode,
};
export const RadioGroupControl = Object.assign(
    <K extends OptionKey>(props: RadioGroupControlProps<K>) => {
        const { id: idOptional, options, buffer, updateBuffer, children } = props;
        const id = React.useMemo(() => idOptional ?? generateRandomId(), [idOptional]);
        
        const context = React.useMemo<RadioGroupContext<K>>(() => ({
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
        
        const Context = RadioGroupContext as unknown as React.Context<RadioGroupContext<K>>;
        return (
            <Context.Provider value={context}>
                {children}
            </Context.Provider>
        );
    },
    {
        displayName: 'RadioGroupControl',
        Radio: RadioControlConnected,
    },
);
RadioGroupControl.displayName = 'RadioGroupControl';

export const connectRadioGroup =
    ConnectAccessor<RadioGroupBuffer, RadioGroupControlProps<OptionKey>>(RadioGroupControl);
