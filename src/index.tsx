
import * as React from 'react';

import { classNames as cx, ComponentPropsWithoutRef } from './util/components.js';

//import * as Ctx from './FormContext.js';
import * as Proform from './proform.js';

import type { FieldProps } from './components/Field.js';
import type { ValidationMessageProps } from './components/ValidationMessage.js';



// const FormContextGeneric = Ctx.createFormContext<unknown>();
// export const FormContext = FormContextGeneric.FormContext;
// export const FormProvider = FormContextGeneric.FormProvider;
// export const FormConsumer = FormContextGeneric.FormConsumer;
// export const useForm = FormContextGeneric.useForm;

// Default form context using a generic (`unknown`) type. Useful for untyped environments.
const FormGeneric = Proform.makeForm<unknown>();
// export const InputText = FormGeneric.InputText;





// Test

import * as O from 'optics-ts';

/*
O.optic<{}>()


// expands object types one level deep
type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never;

// expands object types recursively
type ExpandRecursively<T> = T extends object
  ? T extends infer O ? { [K in keyof O]: ExpandRecursively<O[K]> } : never
  : T;

type Test = O.OpticFor<42>;
*/

export const test = () => {
    //type UserRole = 'user' | 'admin';
    type LegalEntityType = 'private' | 'business';
    type UserInterest = 'music' | 'culture' | 'politics' | 'science' | 'tech';
    type User = {
        //role: UserRole,
        name: string,
        email: string,
        contact: {
            legalEntityType: LegalEntityType,
            address: string,
            postalCode: string,
            phoneNumber: string,
        },
        interests: Array<UserInterest>,
    };
    
    //const Form = Proform.makeForm<User>();
    const TestApp = () => {
        const [buffer, setBuffer] = React.useState<User>({
            //role: 'user',
            name: '',
            email: '',
            contact: {
                legalEntityType: 'private',
                address: '',
                postalCode: '',
                phoneNumber: '',
            },
            interests: [],
        });
        
        const Form = Proform.useFormProvider<User>();
        
        const validate = React.useCallback<Proform.FormValidate<User>>((user: User) => {
            const _ = O.optic<User>();
            
            const errors = new Map();
            
            if (user.name.trim() === '') { errors.set(_.prop('name'), 'Name is required'); }
            if (user.contact.address.trim() === '') {
                errors.set(_.path('contact.address'), 'Address is required');
            }
            
            if (user.contact.postalCode.trim() === '') {
                errors.set(_.path('contact.postalCode'), 'Postal code is required');
            } else if (!/^\s*[0-9]{4}\s*[a-zA-Z]{2}\s*$/.test(user.contact.postalCode)) {
                errors.set(_.path('contact.postalCode'), 'Please enter a valid postal code');
            }
            
            // https://stackoverflow.com/a/53297852/233884
            if (user.contact.phoneNumber.trim() === '') {
                // Optional
            } else if (!/^\s*([+]?[\s0-9]+)?(\d{3}|[(]?[0-9]+[)])?([-]?[\s]?[0-9])+\s*$/.test(user.contact.phoneNumber)) {
                errors.set(_.path('contact.phoneNumber'), 'Please enter a valid phone number');
            }
            
            if (user.email.trim() === '') {
                errors.set(_.prop('email'), 'Email address is required');
            } else if (!/@/.test(user.email)) {
                errors.set(_.prop('email'), 'Please enter a valid email address');
            }
            
            return errors;
        }, []);
        
        const handleSubmit = React.useCallback<Proform.FormSubmit<User>>(async (user: User) => {
            console.log('submit', user);
        }, []);
        
        const ValidationMessage = React.useCallback(Object.assign(
            <A, F>({ visible = true, ...props }: ValidationMessageProps<A, F> & { visible?: boolean }) =>
                <Form.ValidationMessage {...props}>
                    {({ error }) =>
                        <span className={cx('validation-message', { 'validation-message--visible': visible })}>
                            {error !== null && //visible &&
                                error.message
                            }
                        </span>
                    }
                </Form.ValidationMessage>,
                { displayName: 'ValidationMessage' },
            ),
            [],
        );
        
        type TextFieldProps<A> = FieldProps<A, string> & {
            label: string,
            labelProps?: ComponentPropsWithoutRef<'label'>,
            controlProps?: Omit<React.ComponentPropsWithRef<typeof Form.Text>, 'accessor'>,
        };
        const TextField = React.useCallback(Object.assign(
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
            ),
            [],
        );
        
        return (
            <Form.FormProvider
                //nestable
                buffer={buffer}
                updateBuffer={setBuffer}
                validate={validate}
                onSubmit={handleSubmit}
            >
                <Form.Form>
                    <div className="form">
                        {/*
                        <Form.Field accessor={O.optic<User>().prop('name')}>
                            <Form.Text
                                accessor={O.optic<User>().prop('name')}
                                className="name"
                                placeholder="Name"
                                aria-label="Name"
                            />
                            <ValidationMessage
                                accessor={O.optic<User>().prop('name')}
                            />
                        </Form.Field>
                        
                        <Form.Text
                            accessor={Form.accessor.path('contact.address')}
                            className={{ address: true }}
                            placeholder="Address"
                        />
                        <ValidationMessage
                            accessor={Form.accessor.path('contact.address')}
                        />
                        
                        <Form.Text
                            accessor={['contact', 'postalCode']}
                            placeholder="Postal code"
                        />
                        <ValidationMessage
                            accessor={['contact', 'postalCode']}
                        />
                        
                        <Form.Text
                            accessor="contact.phoneNumber"
                            placeholder="Phone number"
                        />
                        <ValidationMessage
                            accessor="contact.phoneNumber"
                        />
                        
                        <Form.Select
                            ref={ref}
                            accessor="role"
                            options={{
                                user: { label: 'User' },
                                admin: { label: 'Admin' },
                            }}
                        />
                        <ValidationMessage
                            accessor="role"
                        />
                        */}
                        
                        <TextField
                            accessor="name"
                            label="Name"
                            controlProps={{
                            }}
                        />
                        
                        <TextField
                            accessor="email"
                            label="Email address"
                            controlProps={{
                                placeholder: 'user@example.com',
                            }}
                        />
                        
                        <fieldset>
                            <legend>Contact information</legend>
                            
                            <label className="field">
                                <Form.Select
                                    accessor="contact.legalEntityType"
                                    options={{
                                        private: { label: 'Private' },
                                        business: { label: 'Business' },
                                    }}
                                />
                                <ValidationMessage
                                    accessor="contact.legalEntityType"
                                />
                            </label>
                            
                            <TextField
                                accessor="contact.address"
                                label="Address"
                                controlProps={{
                                }}
                            />
                            
                            <TextField
                                accessor="contact.postalCode"
                                label="Postal code"
                                controlProps={{
                                    placeholder: '1234 AB',
                                }}
                            />
                            
                            <TextField
                                accessor="contact.phoneNumber"
                                label="Phone number (optional)"
                                controlProps={{
                                    //placeholder: '(000) 000 0000 00',
                                }}
                            />
                        </fieldset>
                        
                        <Form.Select
                            accessor="interests"
                            options={{
                                'music': { label: 'Music' },
                                'culture': { label: 'Culture' },
                                'politics': { label: 'Politics' },
                                'science': { label: 'Science' },
                                'tech': { label: 'Tech' },
                            }}
                        />
                        <ValidationMessage
                            accessor="interests"
                        />
                        
                        <button type="submit">Submit</button>
                    </div>
                </Form.Form>
                <pre>
                    {JSON.stringify(buffer, null, 2)}
                </pre>
            </Form.FormProvider>
        );
    };
    
    return { TestApp };
};
