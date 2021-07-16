
import { Updater } from '../../util/types';

import * as React from 'react';

import type { ControlBufferProps } from '../../components/Control';

import * as Ctx from '../../context/FormContext';
import type { OptionKey } from '../CheckboxGroupControl';
import { Accessor, useAccessorFor } from '../../Accessor';

import type { CheckboxIndeterminateBuffer } from '../CheckboxIndeterminateControl';
import { CheckboxIndeterminateControl } from '../CheckboxIndeterminateControl';


// Utilities
type Writable<T> = { -readonly [P in keyof T]: Writable<T[P]> };

// Check if the given arrays have equal values (regardless of ordering)
const arraysSameValues = (arr1: ReadonlyArray<unknown>, arr2: ReadonlyArray<unknown>): boolean => {
    if (arr1.length !== arr2.length) { return false; }
    
    const arr1Sorted = [...arr1].sort();
    const arr2Sorted = [...arr2].sort();
    
    return arr1Sorted.every((value, index) => value === arr2Sorted[index]);
};


type CheckboxIndeterminateControlProps = React.ComponentPropsWithRef<typeof CheckboxIndeterminateControl>;

// Checkbox that selects or deselects all elements in an array. If the array is partially selected, the checkbox
// will be in indeterminate state.
type CheckboxIndeterminateControlRef = React.ElementRef<typeof CheckboxIndeterminateControl>;
export type SelectAllControlProps<A> =
    Omit<CheckboxIndeterminateControlProps, keyof ControlBufferProps<unknown>> & {
        options: ReadonlyArray<OptionKey>, // The total set of possible options
        accessor: Accessor<A, ReadonlyArray<OptionKey>>,
    };
export const connectSelectAll = <A,>(FormContext: Ctx.FormContext<A>) =>
    Object.assign(
        React.forwardRef<CheckboxIndeterminateControlRef, SelectAllControlProps<A>>((props, ref) => {
            const { accessor, options, ...propsRest } = props;
            const useAccessor = React.useMemo(() => useAccessorFor(FormContext), []);
            
            const { formId } = Ctx.useForm(FormContext);
            const { buffer, updateBuffer } = useAccessor(accessor);
            
            const bufferCheckbox: CheckboxIndeterminateBuffer =
                !Array.isArray(buffer) ? false
                : buffer.length === 0 ? false
                : !arraysSameValues(options, buffer as any as ReadonlyArray<OptionKey> /* FIXME */) ? null
                : true;
            const updateBufferCheckbox: CheckboxIndeterminateControlProps['updateBuffer'] =
                (bufferUpdated: CheckboxIndeterminateBuffer): void => {
                    if (bufferUpdated === null) {
                        // The checkbox component should not trigger an indeterminate state on its own accord. We
                        // cannot determine an options list to use as buffer in this case.
                        throw new TypeError(`Cannot determine options list from indeterminate checkbox`);
                    }
                    
                    const bufferUpdatedAsArray: Updater<ReadonlyArray<OptionKey>> =
                        bufferUpdated === true ? options : [];
                    updateBuffer(bufferUpdatedAsArray);
                };
            
            const propsWithRef: CheckboxIndeterminateControlProps = {
                ...propsRest,
                ref,
                buffer: bufferCheckbox,
                updateBuffer: updateBufferCheckbox,
            };
            return (
                <CheckboxIndeterminateControl form={formId ?? undefined} {...propsWithRef}/>
            );
        }),
        { displayName: 'ProformConnect(SelectAllControl)' },
    );
