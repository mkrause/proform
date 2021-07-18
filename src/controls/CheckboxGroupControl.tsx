
import { generateRandomId } from '../util/random';

import { classNames as cx, ComponentPropsWithRef } from '../util/components';
import * as React from 'react';

import type { ControlBufferProps } from './Control';
import { ConnectAccessor } from '../Accessor';

import { CheckboxBuffer, CheckboxControl } from './CheckboxControl';


type CheckboxControlProps = React.ComponentPropsWithRef<typeof CheckboxControl>;

export type OptionKey = string | number;
export type Option = {};

export type CheckboxGroupBuffer = Array<OptionKey>;

export type CheckboxGroupContext<K extends OptionKey> = {
    id: string,
    options: Record<K, Option>,
    optionsSelected: Array<K>,
    updateOptionsSelected: ControlBufferProps<Array<K>>['updateBuffer'],
};
export const CheckboxGroupContext = React.createContext<null | CheckboxGroupContext<OptionKey>>(null);
CheckboxGroupContext.displayName = 'CheckboxGroupContext';


type CheckboxControlConnectedProps = Omit<CheckboxControlProps, keyof ControlBufferProps<CheckboxBuffer>> & {
    option: OptionKey,
};
const CheckboxControlConnected = React.forwardRef<
    React.ElementRef<typeof CheckboxControl>,
    CheckboxControlConnectedProps
>(
    ({ option, ...propsRest }, ref) => {
        const context = React.useContext(CheckboxGroupContext);
        
        if (context === null) {
            throw new TypeError(`Missing CheckboxGroupControl context provider`);
        }
        
        const { id, options, optionsSelected, updateOptionsSelected } = context;
        
        if (!Object.keys(options).includes(String(option))) {
            throw new TypeError(`Invalid option ${option}`);
        }
        
        return (
            <CheckboxControl
                ref={ref}
                value={option}
                {...propsRest}
                name={id}
                buffer={optionsSelected.includes(option)}
                updateBuffer={(buffer: CheckboxBuffer) => {
                    // Note: we want to preserve key order of `options`, so map over `Object.keys(options)`
                    if (buffer) {
                        // FIXME: this should use a state update callback function (need to fix `updateBuffer`)
                        if (!optionsSelected.includes(option)) {
                            const optionsUpdated = Object.keys(options).filter(optionCurrent => {
                                return optionsSelected.includes(optionCurrent) || optionCurrent === option;
                            });
                            updateOptionsSelected(optionsUpdated);
                        }
                    } else {
                        if (optionsSelected.includes(option)) {
                            const optionsUpdated = Object.keys(options).filter(optionCurrent => {
                                return optionsSelected.includes(optionCurrent) && optionCurrent !== option;
                            });
                            updateOptionsSelected(optionsUpdated);
                        }
                    }
                }}
            />
        );
    },
);
CheckboxControlConnected.displayName = 'Connected(CheckboxControl)';


type CheckboxGroupControlProps<K extends OptionKey> = ControlBufferProps<Array<K>> & {
    id?: string,
    options: Record<K, Option>,
    children?: React.ReactNode,
};
export const CheckboxGroupControl = Object.assign(
    <K extends OptionKey>(props: CheckboxGroupControlProps<K>) => {
        const { id: idOptional, options, buffer, updateBuffer, children } = props;
        const id = React.useMemo(() => idOptional ?? generateRandomId(), [idOptional]);
        
        const context = React.useMemo<CheckboxGroupContext<K>>(() => ({
            id,
            options,
            optionsSelected: buffer,
            updateOptionsSelected: updateBuffer,
        }), [
            // Deep compare on `options`, so that children only rerender on a structural `options` change
            JSON.stringify(options),
            buffer,
            updateBuffer,
        ]);
        
        const Context = CheckboxGroupContext as unknown as React.Context<CheckboxGroupContext<K>>;
        return (
            <Context.Provider value={context}>
                {children}
            </Context.Provider>
        );
    },
    {
        displayName: 'CheckboxGroupControl',
        Checkbox: CheckboxControlConnected,
    },
);
CheckboxGroupControl.displayName = 'CheckboxGroupControl';

export const connectCheckboxGroup =
    ConnectAccessor<CheckboxGroupBuffer, CheckboxGroupControlProps<OptionKey>>(CheckboxGroupControl);
