
import * as React from 'react';

import { classNames as cx, ComponentPropsWithoutRef } from './util/components';

//import * as Ctx from './FormContext';
import * as Proform from './proform';

import type { FieldProps } from './components/Field';
import type { ValidationMessageProps } from './components/ValidationMessage';



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
    const capitalize = (string: string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
    };
    
    //type UserRole = 'user' | 'admin';
    type LegalEntityType = 'private' | 'business';
    type UserInterest = 'music' | 'culture' | 'politics' | 'science' | 'tech';
    type User = {
        gender: null | 'male' | 'female' | 'other',
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
        remarks: string,
        termsAndConditions: boolean,
    };
    
    //const Form = Proform.makeForm<User>();
    const TestApp = () => {
        const interests = ['music', 'culture', 'politics', 'science', 'tech'] as const;
        
        const [buffer, setBuffer] = React.useState<User>({
            gender: null,
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
            remarks: '',
            termsAndConditions: false,
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
                errors.set(_.prop('email'), <>Email address is required</>);
            } else if (!/@/.test(user.email)) {
                // Multiline error message for testing purposes
                errors.set(_.prop('email'), <>
                    Please enter a valid email address.<br/>
                    A valid email address should include at least an "@"-sign.
                </>);
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
                            {error !== null && visible &&
                                error.render()
                            }
                        </span>
                    }
                </Form.ValidationMessage>,
            { displayName: 'ValidationMessage' },
        ), []);
        
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
        ), []);
        
        return (
            <Form.FormProvider
                //nestable
                buffer={buffer}
                updateBuffer={setBuffer}
                validate={validate}
                onSubmit={handleSubmit}
            >
                <Form.Form>
                    <h1>Survey</h1>
                    
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
                        
                        <div className="radio-group">
                            <span className="radio-group__label">Gender</span>
                            <Form.RadioGroup accessor="gender" id="gender"
                                options={{ male: {}, female: {}, other: {} }}
                            >
                                <label>
                                    <Form.RadioGroup.Radio option="male"/>
                                    Male
                                </label>
                                <label>
                                    <Form.RadioGroup.Radio option="female"/>
                                    Female
                                </label>
                                <label>
                                    <Form.RadioGroup.Radio option="other"/>
                                    Prefer not to say
                                </label>
                            </Form.RadioGroup>
                        </div>
                        
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
                                placeholder: 'you@example.com',
                            }}
                        />
                        
                        <fieldset>
                            <legend>Contact information</legend>
                            
                            <Form.SelectField
                                accessor="contact.legalEntityType"
                                label="Type"
                                options={{
                                    private: { label: 'Private' },
                                    business: { label: 'Business' },
                                }}
                            />
                            
                            <label className="field field--valid">
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
                                    placeholder: '(000) 000-0000',
                                }}
                            />
                        </fieldset>
                        
                        <label className="field field--valid">
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
                        </label>
                        
                        <div className="checkbox-group">
                            <span className="radio-group__label">Interests</span>
                            <label>
                                <Form.SelectAll
                                    accessor="interests"
                                    options={interests}
                                />
                                
                                Select all
                            </label>
                            
                            <Form.CheckboxGroup accessor="interests" id="interests"
                                options={Object.fromEntries(interests.map(interest => [interest, {}]))}
                            >
                                {interests.map(interest =>
                                    <label key={interest}>
                                        <Form.CheckboxGroup.Checkbox option={interest}/>
                                        {capitalize(interest)}
                                    </label>
                                )}
                            </Form.CheckboxGroup>
                        </div>
                        
                        <label>
                            Additional remarks
                            
                            <Form.TextArea accessor="remarks" rows={4}/>
                        </label>
                        
                        <label className="field field--checkbox">
                            <Form.Checkbox accessor="termsAndConditions"/>
                            I agree to the terms and conditions
                        </label>
                        
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
