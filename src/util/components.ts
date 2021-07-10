
// Note: use the `dedupe` variant so that the consumer of a component can overwrite classes from the component
import classNamesDeduped from 'classnames/dedupe';
import type { Argument as ClassNameArgument } from 'classnames';

import type * as React from 'react';
import { forwardRef as reactForwardRef } from 'react';


export type { ClassNameArgument };

export const classNames = (...args: Array<ClassNameArgument>) => {
    // Return `undefined` in case of empty string, so that we don't unnecessarily add a `class` attribute in the DOM
    return classNamesDeduped(...args) || undefined;
};


// Custom version of `Omit` that doesn't use `Pick`, to prevent verbose compiler messages/output. See:
// https://github.com/microsoft/TypeScript/issues/34793
// https://github.com/microsoft/TypeScript/pull/42524
type OmitProps<T, K> = {
    [key in (keyof T extends infer U ? U extends K ? never : U extends keyof T ? U : never : never)]: T[key]
};

type PropsWithoutRef<P> =
    'ref' extends keyof P ? OmitProps<P, 'ref'> : P;

type PropsWithRef<P> =
    'ref' extends keyof P
        ? P extends { ref?: infer R | undefined }
            ? string extends R
                ? PropsWithoutRef<P> & { ref?: Exclude<R, string> | undefined }
                : P
            : P
        : P;

type ComponentPropsWithRefOverride<T extends React.ElementType> =
    T extends React.ComponentClass<infer P>
        ? PropsWithoutRef<P> & React.RefAttributes<InstanceType<T>>
        : PropsWithRef<React.ComponentProps<T>>;

// Version of `React.ComponentPropsWithX` that supports `classnames`-based `className` props
// https://github.com/DefinitelyTyped/DefinitelyTyped/blob/84d000f858caf/types/react/index.d.ts#L836
export type ComponentPropsWithRef<T extends React.ElementType> =
    OmitProps<ComponentPropsWithRefOverride<T>, 'className'> & {
        className?: ClassNameArgument,
    };
export type ComponentPropsWithoutRef<T extends React.ElementType> =
    OmitProps<PropsWithoutRef<React.ComponentProps<T>>, 'className'> & {
        className?: ClassNameArgument,
    };

export const forwardRef = reactForwardRef as
    <T, P = {}>(
        render: React.ForwardRefRenderFunction<T, P>
    ) => React.ForwardRefExoticComponent<PropsWithoutRef<P> & React.RefAttributes<T>>;
