
import * as ObjectUtil from '../util/object_util';

import * as React from 'react';
import * as TL from '@testing-library/react';
import fireUserEvent from '@testing-library/user-event';

import type { RadioBuffer } from './RadioControl';
import { RadioControl } from './RadioControl';


// https://stackoverflow.com/questions/43159887/make-a-single-property-optional-in-typescript
type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

type RadioControlProps = React.ComponentPropsWithRef<typeof RadioControl>;

describe('RadioControl', () => {
    // Controlled variant of `RadioControl`
    type RadioControlControlledProps = Omit<RadioControlProps, 'buffer' | 'updateBuffer'> & {
        initialBuffer?: RadioBuffer,
    };
    const RadioControlControlled = ({ initialBuffer = false, ...props }: RadioControlControlledProps) => {
        const [buffer, setBuffer] = React.useState(initialBuffer);
        return <RadioControl buffer={buffer} updateBuffer={setBuffer} {...props}/>;
    };
    
    const setup = (props: Partial<RadioControlProps> = {}) => {
        const utils = TL.render(
            <RadioControl data-label="radio-button-control" buffer={false} updateBuffer={() => {}} {...props}/>
        );
        
        return {
            ...utils,
            element: utils.getByTestId('radio-button-control'),
        };
    };
    const setupControlled = (props: RadioControlControlledProps = {}) => {
        const utils = TL.render(
            <RadioControlControlled data-label="radio-button-control" {...props}/>
        );
        
        return {
            ...utils,
            element: utils.getByTestId('radio-button-control'),
        };
    };
    
    beforeEach(TL.cleanup);
    
    test('should render a radio control', () => {
        const { element } = setup();
        
        expect(element).toBeInstanceOf(HTMLInputElement);
        expect(element).toHaveClass('', { exact: true });
        expect(element).toHaveAttribute('type', 'radio');
    });
    
    test('should accept `ref`', () => {
        const ref = React.createRef<HTMLInputElement>();
        const { element } = setup({ ref });
        
        expect(ref.current).toBeInstanceOf(HTMLInputElement);
        expect(ref.current).toBe(element);
    });
    
    test('should render a radio control with the given `className`', () => {
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
    
    test('should render an unchecked radio control when buffer is `false`', () => {
        const { element } = setup({ buffer: false });
        
        expect(element).not.toBeChecked();
    });
    
    test('should render a checked radio control when buffer is `true`', () => {
        const { element } = setup({ buffer: true });
        
        expect(element).toBeChecked();
    });
    
    test('should update buffer on input', () => {
        const updateBufferMock = jest.fn();
        
        const { element } = setup({ buffer: false, updateBuffer: updateBufferMock });
        
        // Note: for radioes, we need to use `fireEvent.click`, not `fireEvent.change`. See:
        // https://github.com/testing-library/react-testing-library/issues/175
        TL.fireEvent.click(element);
        
        expect(updateBufferMock).toHaveBeenCalledTimes(1);
        expect(updateBufferMock).toHaveBeenCalledWith(true);
    });
    
    test('should update buffer on input (controlled)', () => {
        const { element } = setupControlled({ initialBuffer: false });
        
        // Simulate click to check on
        fireUserEvent.click(element);
        
        expect(element).toBeChecked();
        
        // On subsequent click, should remain on
        fireUserEvent.click(element);
        
        expect(element).toBeChecked();
    });
});
