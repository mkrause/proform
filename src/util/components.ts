
// Note: use the `dedupe` variant so that the consumer of a component can overwrite classes from the component
import classNamesDeduped from 'classnames/dedupe';
import type { Argument as ClassNameArgument } from 'classnames';

import type * as React from 'react';


export type { ClassNameArgument };

export const classNames = (...args: Array<ClassNameArgument>) => {
    // Return `undefined` in case of empty string, so that we don't unnecessarily add a `class` attribute in the DOM
    return classNamesDeduped(...args) || undefined;
};


// Note: unfortunately, `Omit` gives us some pretty bad/verbose d.ts build and compiler messages right now, due to
// `Omit` using `Pick`, and that type alias then getting expanded. We can try to use PR 42524's `Omit` implementation,
// but that still doesn't fix the type alias expansion problem in the case of `forwardRef` for example.
// https://github.com/microsoft/TypeScript/issues/31104
// https://github.com/microsoft/TypeScript/issues/34793
// https://github.com/microsoft/TypeScript/issues/34556
// https://github.com/microsoft/TypeScript/pull/42524

// Version of `React.ComponentPropsWithX` that supports `classnames`-based `className` props
// https://github.com/DefinitelyTyped/DefinitelyTyped/blob/84d000f858caf/types/react/index.d.ts#L836
export type ComponentPropsWithRef<T extends React.ElementType> =
    //Omit<React.ComponentPropsWithRef<T>, 'className'> & { className?: ClassNameArgument };
    React.ComponentPropsWithRef<T>;
export type ComponentPropsWithoutRef<T extends React.ElementType> =
    //Omit<React.ComponentPropsWithoutRef<T>, 'className'> & { className?: ClassNameArgument };
    React.ComponentPropsWithoutRef<T>;
