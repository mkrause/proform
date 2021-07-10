
import * as React from 'react';
import * as TL from '@testing-library/react';
import fireEvent from '@testing-library/user-event';

import { TextControl } from './TextControl';


// Controlled variant of `TextControl`
type TextControlControlledProps = Omit<React.ComponentPropsWithRef<typeof TextControl>, 'buffer' | 'updateBuffer'> & {
    initialBuffer?: string,
};
const TextControlControlled = ({ initialBuffer = '', ...props }: TextControlControlledProps) => {
    const [buffer, setBuffer] = React.useState(initialBuffer);
    return <TextControl buffer={buffer} updateBuffer={setBuffer} {...props}/>;
};

const setup = (props: Partial<React.ComponentPropsWithoutRef<typeof TextControl>> = {}) => {
    const utils = TL.render(
        <TextControl data-label="text-control" buffer="test" updateBuffer={() => {}} {...props}/>
    );
    
    return {
        ...utils,
        element: utils.getByTestId('text-control'),
    };
};
const setupControlled = (props: Partial<React.ComponentPropsWithoutRef<typeof TextControlControlled>> = {}) => {
    const utils = TL.render(
        <TextControlControlled data-label="text-control" {...props}/>
    );
    
    return {
        ...utils,
        element: utils.getByTestId('text-control'),
    };
};

describe('TextControl', () => {
    beforeEach(TL.cleanup);
    
    test('should render a text control', () => {
        const { element } = setup();
        
        expect(element).toBeInstanceOf(HTMLInputElement);
        expect(element).toHaveValue('test');
        expect(element).toHaveClass('', { exact: true });
    });
    
    test('should render a text control with the given `className`', () => {
        const { element } = setup({ className: 'foo' });
        expect(element).toHaveClass('foo', { exact: true });
    });
    
    test('should allow `cx` to override prior classes', () => {
        const { element } = setup({ className: 'foo', cx: { foo: false, bar: true } });
        expect(element).not.toHaveClass('foo');
        expect(element).toHaveClass('bar');
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
        
        const longInput = ' - some longer input';
        fireEvent.type(element, longInput);
        
        expect(element).toHaveValue('test - some longer input');
    });
});
