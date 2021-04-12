
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
    type UserPermission = 'view' | 'edit' | 'manage';
    type User = {
        name: string,
        contact: {
            address: string,
            postalCode: string,
            phoneNumber: string,
        },
        permissions: Array<UserPermission>,
    };
    
    const Form = Proform.makeForm<User>();
    const TestApp = () => {
        const [buffer, setBuffer] = React.useState<User>({
            name: '',
            contact: {
                address: '',
                postalCode: '',
                phoneNumber: '',
            },
            permissions: [],
        });
        
        return (
            <Form.FormProvider
                buffer={buffer}
                updateBuffer={setBuffer}
            >
                <form
                    //onSubmit={() => { submit(); }}
                >
                    <Form.InputTextField
                        accessor={O.optic<User>().prop('name')}
                        className="name"
                        placeholder="Name"
                    />
                    
                    <Form.InputTextField
                        accessor={Form.accessor.path('contact.address')}
                        className={{ address: true }}
                        placeholder="Address"
                    />
                    
                    <Form.InputTextField
                        accessor={['contact', 'postalCode']}
                        placeholder="Postal code"
                    />
                    
                    <Form.InputTextField
                        accessor="contact.phoneNumber"
                        placeholder="Phone number"
                    />
                </form>
                
                <pre>
                    {JSON.stringify(buffer, null, 2)}
                </pre>
            </Form.FormProvider>
        );
    };
    
    return { TestApp };
};
