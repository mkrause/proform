
import * as React from 'react';

//import * as Ctx from './FormContext.js';
import * as Proform from './proform.js';



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
            const errors = new Map();
            
            if (user.name.trim() === '') { errors.set(O.optic<User>().prop('name'), 'Name is required'); }
            
            return errors;
        }, []);
        
        const handleSubmit = React.useCallback<Proform.FormSubmit<User>>(async (user: User) => {
            console.log('submit', user);
        }, []);
        
        const ref = React.useRef(null);
        // @ts-ignore
        window.ref = ref;
        
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
                        
                        <Form.Text
                            accessor={Form.accessor.path('contact.address')}
                            className={{ address: true }}
                            placeholder="Address"
                        />
                        
                        <Form.Text
                            accessor={['contact', 'postalCode']}
                            placeholder="Postal code"
                        />
                        
                        <Form.Text
                            accessor="contact.phoneNumber"
                            placeholder="Phone number"
                        />
                        
                        <Form.Select
                            ref={ref}
                            accessor="role"
                            options={{
                                user: { label: 'User' },
                                admin: { label: 'Admin' },
                            }}
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
