
import * as O from 'optics-ts';
import type { DottedPath } from 'optics-ts/dist/lib/utils';

import { classNames as cx, ComponentPropsWithoutRef } from './util/components.js';
import type { ClassNameArgument } from './util/components.js';
import * as React from 'react';

import { createFormContext } from './FormContext.js';
//import type {} from './FormContext.js';


type RenderProp<P, C extends React.ReactNode = React.ReactNode> = C | ((props: P) => C);

export type Accessor<A, F> = O.Lens<A, O.OpticParams, F>;
type AccessorResult<L extends Accessor<any, any>> = L extends Accessor<unknown, infer A> ? A : never;

type AccessorProp<A, F> = PropertyKey | Array<PropertyKey> | Accessor<A, F>; // Accessor, or a path (string)
const isPath = <A,>(path: unknown): path is DottedPath<A, string> => typeof path === 'string';

export const makeForm = <A,>() => {
    const { FormProvider, useForm } = createFormContext<A>();
    
    const useAccessor = <F,>(accessor: AccessorProp<A, F>) => {
        const context = useForm();
        
        const accessorParsed: Accessor<A, F> =
            typeof accessor === 'string' || typeof accessor === 'number' || typeof accessor === 'symbol'
                ? (O.optic<A>().path(accessor) as unknown as Accessor<A, F>)
                : Array.isArray(accessor)
                    ? (O.optic<A>().path(...accessor) as unknown as Accessor<A, F>) // FIXME
                    : accessor;
        
        type FieldBuffer = AccessorResult<typeof accessorParsed>;
        
        const buffer = React.useMemo(
            () => O.get(accessorParsed)(context.buffer),
            [context.buffer, accessorParsed]
        );
        const updateBuffer = React.useCallback((fieldBufferUpdated: FieldBuffer) =>
            context.methods.updateBuffer((buffer: A) => O.set(accessorParsed)(fieldBufferUpdated)(context.buffer)),
            [context.buffer, accessorParsed],
        );
        
        return { buffer, updateBuffer };
    };
    
    /*
    type FieldProps<F> = {
        accessor: AccessorProp<A, F>,
        children?: RenderProp<{ buffer: F, updateBuffer: (bufferUpdated: F) => void }>,
    };
    const Field = <F,>({ accessor, children }: FieldProps<F>) => {
        const { fieldBuffer, updateFieldBuffer } = useAccessor(accessor);
        
        return typeof children === 'function'
            ? children({ buffer: fieldBuffer, updateBuffer: updateFieldBuffer })
            : children;
        
        /*
        // Ref: https://github.com/facebook/react/issues/15156#issuecomment-474590693
        const element = React.useMemo(() => {
            return typeof children === 'function'
                ? children({ buffer: fieldBuffer, updateBuffer: updateFieldBuffer })
                : children;
        }, [context.buffer, fieldBuffer]);
        
        return element;
        * /
    };
    */
    
    type FieldBufferProps<F> = {
        buffer: F,
        updateBuffer: (bufferUpdated: F) => void,
    };
    
    type InputTextProps = ComponentPropsWithoutRef<'input'> & FieldBufferProps<string>;
    const InputText = ({ buffer, updateBuffer, ...props }: InputTextProps) => {
        return (
            <input
                type="text"
                value={buffer}
                {...props}
                className={cx(props.className)}
                onChange={(evt: React.ChangeEvent<HTMLInputElement>) => {
                    updateBuffer(evt.target.value);
                    
                    if (typeof props.onChange === 'function') { props.onChange(evt); }
                }}
            />
        );
    };
    
    type InputTextFieldProps = Omit<InputTextProps, keyof FieldBufferProps<string>> & {
        accessor: AccessorProp<A, string>,
    };
    const InputTextField = ({ accessor, ...props }: InputTextFieldProps) => {
        const { buffer: inputBuffer, updateBuffer: updateInputBuffer } = useAccessor(accessor);
        return (
            <InputText {...props} buffer={inputBuffer} updateBuffer={updateInputBuffer}/>
        );
    };
    
    return {
        FormProvider,
        useForm,
        useAccessor,
        accessor: O.optic<A>(),
        path: (path: any) => O.optic<A>().path(path),
        //Field,
        InputText,
        InputTextField,
    };
};


// Default form context using a generic (`unknown`) type. Useful for untyped environments.
const FormContextGeneric = createFormContext<unknown>();
export const FormContext = FormContextGeneric.FormContext;
export const FormProvider = FormContextGeneric.FormProvider;
export const FormConsumer = FormContextGeneric.FormConsumer;
export const useForm = FormContextGeneric.useForm;

const FormGeneric = makeForm<unknown>();
export const InputText = FormGeneric.InputText;




// Test

type Person = {
    name: string,
    contact: {
        address: string,
        postalCode: string,
        phoneNumber: string,
    },
};

const Form = makeForm<Person>();
export const TestApp = () => {
    const [buffer, setBuffer] = React.useState<Person>({
        name: '',
        contact: {
            address: '',
            postalCode: '',
            phoneNumber: '',
        },
    });
    
    return (
        <Form.FormProvider
            buffer={buffer}
            updateBuffer={setBuffer}
        >
            <form>
                <Form.InputTextField
                    accessor={O.optic<Person>().prop('name')}
                    className="name"
                    placeholder="Name"
                />
                
                <Form.InputTextField
                    accessor={Form.path('contact.address')}
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
