
import * as React from 'react';
import * as TL from '@testing-library/react';
import fireUserEvent from '@testing-library/user-event';

import type { TextBuffer } from './TextControl';
import { TextAreaControl } from './TextAreaControl';


// https://stackoverflow.com/questions/43159887/make-a-single-property-optional-in-typescript
type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

describe('TextAreaControl', () => {
    // Controlled variant of `TextAreaControl`
    type TextAreaControlControlledProps =
        Omit<React.ComponentPropsWithRef<typeof TextAreaControl>, 'buffer' | 'updateBuffer'> & {
            initialBuffer?: TextBuffer,
        };
    const TextAreaControlControlled = ({ initialBuffer = '', ...props }: TextAreaControlControlledProps) => {
        const [buffer, setBuffer] = React.useState(initialBuffer);
        return <TextAreaControl buffer={buffer} updateBuffer={setBuffer} {...props}/>;
    };
    
    const setup = (
        props: PartialBy<React.ComponentPropsWithRef<typeof TextAreaControl>, 'buffer' | 'updateBuffer'> = {},
    ) => {
        const utils = TL.render(
            <TextAreaControl data-label="text-area-control" buffer="test" updateBuffer={() => {}} {...props}/>
        );
        
        return {
            ...utils,
            element: utils.getByTestId('text-area-control'),
        };
    };
    const setupControlled = (props: React.ComponentPropsWithRef<typeof TextAreaControlControlled> = {}) => {
        const utils = TL.render(
            <TextAreaControlControlled data-label="text-area-control" {...props}/>
        );
        
        return {
            ...utils,
            element: utils.getByTestId('text-area-control'),
        };
    };
    
    beforeEach(TL.cleanup);
    
    test('should render a text control', () => {
        const { element } = setup();
        
        expect(element).toBeInstanceOf(HTMLTextAreaElement);
        expect(element).toHaveClass('', { exact: true });
        expect(element).toHaveValue('test');
    });
    
    test('should accept `ref`', () => {
        const ref = React.createRef<HTMLTextAreaElement>();
        const { element } = setup({ ref });
        
        expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
        expect(ref.current).toBe(element);
    });
    
    test('should render a text control with the given `className`', () => {
        const { element } = setup({ className: 'foo' });
        expect(element).toHaveClass('foo', { exact: true });
    });
    
    test('should preserve user-defined `onChange`', () => {
        const onChangeMock = jest.fn();
        
        const { element } = setup({ onChange: onChangeMock });
        
        TL.fireEvent.change(element, { target: { value: 'updated' } });
        
        expect(onChangeMock).toHaveBeenCalledTimes(1);
        expect(onChangeMock).toHaveBeenCalledWith(expect.objectContaining({
            target: element,
        }));
    });
    
    test('should update buffer on input', () => {
        const updateBufferMock = jest.fn();
        
        const { element } = setup({ updateBuffer: updateBufferMock });
        
        TL.fireEvent.change(element, { target: { value: 'updated' } });
        
        expect(updateBufferMock).toHaveBeenCalledTimes(1);
        expect(updateBufferMock).toHaveBeenCalledWith('updated');
    });
    
    test('should update buffer on input (controlled)', () => {
        const { element } = setupControlled({ initialBuffer: 'test' });
        
        // Simulate typing (multiple change events)
        const longInput = ' - some long input';
        fireUserEvent.type(element, longInput);
        
        expect(element).toHaveValue('test - some long input');
    });
});
