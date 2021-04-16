
import * as React from 'react';

//import * as Ctx from './FormContext.js';
import * as Proform from './proform.js';

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
    type UserRole = 'user' | 'admin';
    type UserPermission = 'view' | 'edit' | 'manage';
    type User = {
        name: string,
        contact: {
            address: string,
            postalCode: string,
            phoneNumber: string,
        },
        role: UserRole,
        permissions: Array<UserPermission>,
    };
    
    //const Form = Proform.makeForm<User>();
    const TestApp = () => {
        const [buffer, setBuffer] = React.useState<User>({
            name: '',
            contact: {
                address: '',
                postalCode: '',
                phoneNumber: '',
            },
            role: 'user',
            permissions: [],
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
                errors.set(_.path('contact.postalCode'), 'Invalid postal code');
            }
            
            // https://stackoverflow.com/a/53297852/233884
            if (user.contact.phoneNumber.trim() === '') {
                // Optional
            } else if (!/^\s*([+]?[\s0-9]+)?(\d{3}|[(]?[0-9]+[)])?([-]?[\s]?[0-9])+\s*$/.test(user.contact.phoneNumber)) {
                errors.set(_.path('contact.phoneNumber'), 'Invalid phone number');
            }
            
            return errors;
        }, []);
        
        const handleSubmit = React.useCallback<Proform.FormSubmit<User>>(async (user: User) => {
            console.log('submit', user);
        }, []);
        
        const ref = React.useRef(null);
        // @ts-ignore
        window.ref = ref;
        
        const ValidationMessage = React.useCallback(<A, F>(props: ValidationMessageProps<A, F>) =>
            <Form.ValidationMessage {...props}>
                {({ error }) =>
                    <span className="validation-message">{error && error.message}</span>
                }
            </Form.ValidationMessage>,
            []
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
                        <Form.Text
                            accessor={O.optic<User>().prop('name')}
                            className="name"
                            placeholder="Name"
                            aria-label="Name"
                        />
                        <ValidationMessage
                            accessor={O.optic<User>().prop('name')}
                        />
                        
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
