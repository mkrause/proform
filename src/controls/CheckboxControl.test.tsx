
import * as React from 'react';
import * as TL from '@testing-library/react';
import fireUserEvent from '@testing-library/user-event';

import type { CheckboxBuffer } from './CheckboxControl';
import { CheckboxControl } from './CheckboxControl';


// https://stackoverflow.com/questions/43159887/make-a-single-property-optional-in-typescript
type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

describe('CheckboxControl', () => {
    // Controlled variant of `CheckboxControl`
    type CheckboxControlControlledProps =
        Omit<React.ComponentPropsWithRef<typeof CheckboxControl>, 'buffer' | 'updateBuffer'> & {
            initialBuffer?: CheckboxBuffer,
        };
    const CheckboxControlControlled = ({ initialBuffer = false, ...props }: CheckboxControlControlledProps) => {
        const [buffer, setBuffer] = React.useState(initialBuffer);
        return <CheckboxControl buffer={buffer} updateBuffer={setBuffer} {...props}/>;
    };
    
    const setup = (
        props: PartialBy<React.ComponentPropsWithRef<typeof CheckboxControl>, 'buffer' | 'updateBuffer'> = {},
    ) => {
        const utils = TL.render(
            <CheckboxControl data-label="text-control" buffer={false} updateBuffer={() => {}} {...props}/>
        );
        
        return {
            ...utils,
            element: utils.getByTestId('text-control'),
        };
    };
    const setupControlled = (props: React.ComponentPropsWithRef<typeof CheckboxControlControlled> = {}) => {
        const utils = TL.render(
            <CheckboxControlControlled data-label="text-control" {...props}/>
        );
        
        return {
            ...utils,
            element: utils.getByTestId('text-control'),
        };
    };
    
    beforeEach(TL.cleanup);
    
    test('should render a checkbox control', () => {
        const { element } = setup();
        
        expect(element).toBeInstanceOf(HTMLInputElement);
        expect(element).toHaveClass('', { exact: true });
        expect(element).toHaveAttribute('type', 'checkbox');
    });
    
    test('should accept `ref`', () => {
        const ref = React.createRef<HTMLInputElement>();
        const { element } = setup({ ref });
        
        expect(ref.current).toBeInstanceOf(HTMLInputElement);
        expect(ref.current).toBe(element);
    });
    
    test('should render a checkbox control with the given `className`', () => {
        const { element } = setup({ className: 'foo' });
        expect(element).toHaveClass('foo', { exact: true });
    });
    
    test('should preserve user-defined `onChange`', () => {
        const onChangeMock = jest.fn();
        
        const { element } = setup({ onChange: onChangeMock });
        
        TL.fireEvent.click(element);
        
        expect(onChangeMock).toHaveBeenCalledTimes(1);
        expect(onChangeMock).toHaveBeenCalledWith(expect.objectContaining({ target: element }));
    });
    
    test('should update buffer on change', () => {
        const updateBufferMock = jest.fn();
        
        const { element } = setup({ buffer: false, updateBuffer: updateBufferMock });
        
        // Note: for checkboxes, we need to use `fireEvent.click`, not `fireEvent.change`. See:
        // https://github.com/testing-library/react-testing-library/issues/175
        TL.fireEvent.click(element);
        
        expect(updateBufferMock).toHaveBeenCalledTimes(1);
        expect(updateBufferMock).toHaveBeenCalledWith(true);
    });
    
    test('should update buffer on change (controlled)', () => {
        const { element } = setupControlled({ initialBuffer: false });
        
        // Simulate click to check on
        fireUserEvent.click(element);
        
        expect(element).toBeChecked();
        
        // Simulate click to check off
        fireUserEvent.click(element);
        
        expect(element).not.toBeChecked();
    });
});
