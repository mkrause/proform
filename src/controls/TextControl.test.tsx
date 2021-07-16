
import * as React from 'react';
import * as TL from '@testing-library/react';
import fireUserEvent from '@testing-library/user-event';

import type { TextBuffer } from './TextControl';
import { TextControl } from './TextControl';


// https://stackoverflow.com/questions/43159887/make-a-single-property-optional-in-typescript
type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

describe('TextControl', () => {
    // Controlled variant of `TextControl`
    type TextControlControlledProps =
        Omit<React.ComponentPropsWithRef<typeof TextControl>, 'buffer' | 'updateBuffer'> & {
            initialBuffer?: TextBuffer,
        };
    const TextControlControlled = ({ initialBuffer = '', ...props }: TextControlControlledProps) => {
        const [buffer, setBuffer] = React.useState(initialBuffer);
        return <TextControl buffer={buffer} updateBuffer={setBuffer} {...props}/>;
    };
    
    const setup = (
        props: PartialBy<React.ComponentPropsWithRef<typeof TextControl>, 'buffer' | 'updateBuffer'> = {},
    ) => {
        const utils = TL.render(
            <TextControl data-label="text-control" buffer="" updateBuffer={() => {}} {...props}/>
        );
        
        return {
            ...utils,
            element: utils.getByTestId('text-control'),
        };
    };
    const setupControlled = (props: React.ComponentPropsWithRef<typeof TextControlControlled> = {}) => {
        const utils = TL.render(
            <TextControlControlled data-label="text-control" {...props}/>
        );
        
        return {
            ...utils,
            element: utils.getByTestId('text-control'),
        };
    };
    beforeEach(TL.cleanup);
    
    test('should render a text control', () => {
        const { element } = setup();
        
        expect(element).toBeInstanceOf(HTMLInputElement);
        expect(element).toHaveClass('', { exact: true });
        expect(element).toHaveValue('');
        expect(element).toHaveAttribute('type', 'text');
    });
    
    test('should accept `ref`', () => {
        const ref = React.createRef<HTMLInputElement>();
        const { element } = setup({ ref });
        
        expect(ref).toHaveProperty('current');
        expect(ref.current).toBeInstanceOf(HTMLInputElement);
        expect(ref.current).toBe(element);
    });
    
    test('should render a text control with the given `className`', () => {
        const { element } = setup({ className: 'foo' });
        expect(element).toHaveClass('foo', { exact: true });
    });
    
    test('should preserve user-defined `onChange`', () => {
        const onChangeMock = jest.fn((event: React.ChangeEvent<HTMLInputElement>) => event.target.value);
        
        const { element } = setup({ onChange: onChangeMock });
        
        TL.fireEvent.change(element, { target: { value: 'updated' } });
        
        expect(element).toHaveValue(''); // Note: updated value was not saved because our `onUpdate` ignores it
        expect(onChangeMock).toHaveBeenCalledTimes(1);
        expect(onChangeMock).toHaveBeenCalledWith(expect.objectContaining({ target: element }));
        expect(onChangeMock).toHaveReturnedWith('updated');
    });
    
    test('should render a text control with the current buffer as value', () => {
        const { element } = setup({ buffer: 'test' });
        
        expect(element).toHaveValue('test');
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
