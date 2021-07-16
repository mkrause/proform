
import * as React from 'react';
import * as TL from '@testing-library/react';
import fireUserEvent from '@testing-library/user-event';

import type { CheckboxIndeterminateBuffer } from './CheckboxIndeterminateControl';
import { CheckboxIndeterminateControl } from './CheckboxIndeterminateControl';


// https://stackoverflow.com/questions/43159887/make-a-single-property-optional-in-typescript
type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

type CheckboxIndeterminateControlProps = React.ComponentPropsWithRef<typeof CheckboxIndeterminateControl>;

describe('CheckboxIndeterminateControl', () => {
    // Controlled variant of `CheckboxIndeterminateControl`
    type CheckboxIndeterminateControlControlledProps =
        Omit<CheckboxIndeterminateControlProps, 'buffer' | 'updateBuffer'> & {
            initialBuffer?: CheckboxIndeterminateBuffer,
        };
    const CheckboxIndeterminateControlControlled = ({ initialBuffer = false, ...props }: CheckboxIndeterminateControlControlledProps) => {
        const [buffer, setBuffer] = React.useState(initialBuffer);
        return <CheckboxIndeterminateControl buffer={buffer} updateBuffer={setBuffer} {...props}/>;
    };
    
    const setup = (props: PartialBy<CheckboxIndeterminateControlProps, 'buffer' | 'updateBuffer'> = {}) => {
        const utils = TL.render(
            <CheckboxIndeterminateControl data-label="text-control" buffer={false} updateBuffer={() => {}} {...props}/>
        );
        
        return {
            ...utils,
            element: utils.getByTestId('text-control'),
        };
    };
    const setupControlled = (props: React.ComponentPropsWithRef<typeof CheckboxIndeterminateControlControlled> = {}) => {
        const utils = TL.render(
            <CheckboxIndeterminateControlControlled data-label="text-control" {...props}/>
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
        const onChangeMock = jest.fn((event: React.ChangeEvent<HTMLInputElement>) => event.target.checked);
        
        const { element } = setup({ onChange: onChangeMock });
        
        TL.fireEvent.click(element);
        
        expect(element).not.toBeChecked(); // Note: updated value was not saved because our `onUpdate` ignores it
        expect(onChangeMock).toHaveBeenCalledTimes(1);
        expect(onChangeMock).toHaveBeenCalledWith(expect.objectContaining({ target: element }));
        expect(onChangeMock).toHaveReturnedWith(true);
    });
    
    test('should render an unchecked checkbox control when buffer is `false`', () => {
        const { element } = setup({ buffer: false });
        
        expect(element).toBeInstanceOf(HTMLInputElement);
        expect(element).not.toBeChecked();
        expect(element).not.toBePartiallyChecked();
    });
    
    test('should render a checked checkbox control when buffer is `true`', () => {
        const { element } = setup({ buffer: true });
        
        expect(element).toBeInstanceOf(HTMLInputElement);
        expect(element).toBeChecked();
        expect(element).not.toBePartiallyChecked();
    });
    
    test('should render a partially checked checkbox control when buffer is `null`', () => {
        const { element } = setup({ buffer: null });
        
        expect(element).toBeInstanceOf(HTMLInputElement);
        expect(element).not.toBeChecked();
        expect(element).toBePartiallyChecked();
    });
    
    test('should toggle buffer between false/true on change', () => {
        const updateBufferMock = jest.fn();
        
        const { element } = setup({ buffer: false, updateBuffer: updateBufferMock });
        
        // Note: for checkboxes, we need to use `fireEvent.click`, not `fireEvent.change`. See:
        // https://github.com/testing-library/react-testing-library/issues/175
        TL.fireEvent.click(element);
        
        expect(updateBufferMock).toHaveBeenCalledTimes(1);
        expect(updateBufferMock).toHaveBeenCalledWith(true);
    });
    
    test('should toggle buffer between false/true on change (controlled)', () => {
        // Note: no way to trigger the indeterminate state from the UI (only programmatically through `buffer`)
        
        const { element } = setupControlled({ initialBuffer: false });
        
        // Simulate click to check on
        fireUserEvent.click(element);
        
        expect(element).toBeChecked();
        
        // Simulate click to check off
        fireUserEvent.click(element);
        
        expect(element).not.toBeChecked();
    });
});
