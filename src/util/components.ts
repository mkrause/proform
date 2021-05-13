
// Note: use the `dedupe` variant so that the consumer of a component can overwrite classes from the component
import classNamesDeduped from 'classnames/dedupe';
import type { Argument as ClassNameArgument } from 'classnames';


export type { ClassNameArgument };

export const classNames = (...args: Array<ClassNameArgument>) => {
    // Return `undefined` in case of empty string, so that we don't unnecessarily add a `class` attribute in the DOM
    return classNamesDeduped(...args) || undefined;
};


// Version of `React.ComponentPropsWithX` that supports `classnames`-based `className` props
// https://github.com/DefinitelyTyped/DefinitelyTyped/blob/84d000f858caf/types/react/index.d.ts#L836
export type ComponentPropsWithRef<T extends React.ElementType> =
    Omit<React.ComponentPropsWithRef<T>, 'className'> & {
        className?: ClassNameArgument,
    };
export type ComponentPropsWithoutRef<T extends React.ElementType> =
    Omit<React.ComponentPropsWithoutRef<T>, 'className'> & {
        className?: ClassNameArgument,
    };
