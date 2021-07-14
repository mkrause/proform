/*
import { classNames as cx, ComponentPropsWithoutRef } from '../util/components';
import * as React from 'react';

import type { ControlBufferProps } from '../components/Control';
import { ConnectAccessor } from '../Accessor';


type TextFieldProps<A> = FieldProps<A, string> & {
  label: string,
  labelProps?: ComponentPropsWithoutRef<'label'>,
  controlProps?: Omit<React.ComponentPropsWithRef<typeof Form.Text>, 'accessor'>,
};
export const TextField = Object.assign(
    <A,>({ label, labelProps = {}, controlProps = {}, ...props }: TextFieldProps<A>) =>
        <Form.Field<string> {...props}>
            {({ accessor, touched, setTouched }) => {
                const [focused, setFocused] = React.useState<boolean>(false);
                const { buffer } = Form.useAccessor(accessor);
                const validationError = Form.useValidation(accessor);
                
                const hasInteracted = touched || focused;
                
                // Note: can also be neither of the two, if the user has not interacted with the field yet
                const isValid = hasInteracted && validationError === null;
                const isInvalid = hasInteracted && validationError !== null;
                
                return (
                    <label {...labelProps}
                        className={cx('field',
                            { 'field--valid': isValid },
                            { 'field--invalid': isInvalid },
                            labelProps.className,
                        )}
                    >
                        <span className={cx('input-text', { 'input-text--empty': buffer === '' })}>
                            <span className="label">{label}</span>
                            <Form.Text
                                accessor={accessor}
                                {...controlProps}
                                onFocus={() => {
                                    setFocused(true);
                                }}
                                onBlur={() => {
                                    setTouched(true);
                                    setFocused(false);
                                }}
                                aria-invalid={isInvalid ? 'true' : 'false'}
                            />
                        </span>
                        <ValidationMessage
                            accessor={accessor}
                            visible={touched && !focused}
                        />
                    </label>
                );
            }}
        </Form.Field>,
    { displayName: 'TextField' },
);
*/
