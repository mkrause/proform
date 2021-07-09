
import { classNames as cx, ComponentPropsWithRef } from '../util/components'; // .js
import * as React from 'react';

import * as Ctx from '../context/FormContext'; // .js
import type { ConnectedControlBufferProps } from '../Accessor'; // .js
import type { ControlBufferProps } from '../components/Control'; // .js

import type { OptionKey, Option, SelectBuffer } from '../controls/SelectControl'; // .js


//type ControlComponent<B, P = {}> = React.ComponentType<ControlBufferProps<B> & P>;
type ConnectedControlComponent<A, F, P = {}> = React.ComponentType<ConnectedControlBufferProps<A, F> & P>;


type SelectControlProps<A> = ConnectedControlBufferProps<A, SelectBuffer> & {
    options: Record<OptionKey, Option>,
};
type SelectFieldProps = {
    label: React.ReactNode,
};
export const connectSelectField =
    <A,>(FormContext: Ctx.FormContext<A>) =>
    <P extends SelectControlProps<A>>(Control: React.ComponentType<P>) =>
    function SelectField(props: P & SelectFieldProps) {
        const { label, ...controlProps } = props;
        const { accessor, options } = controlProps;
        
        return (
            <label className="field">
                {label}
                <Control
                    // Cast needed for unclear reason, `controlProps` should be assignable. Possibly due to issue where
                    // `P` might be instantiated with a type that includes some of `SelectFieldProps` (e.g. `label`),
                    // thus TS cannot be sure there's no conflicts ("neither type sufficiently overlaps with the other")
                    {...(controlProps as any as P)}
                />
                <span className="validation-message validation-message--visible">Test</span>
            </label>
        );
    };
