
import * as ObjectUtil from '../util/object_util';

import * as React from 'react';
import * as TL from '@testing-library/react';
import fireUserEvent from '@testing-library/user-event';

import type { RadioButtonBuffer, RadioBuffer } from './RadioControl';
import { RadioButtonControl, RadioControl } from './RadioControl';


// https://stackoverflow.com/questions/43159887/make-a-single-property-optional-in-typescript
type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

describe('RadioButtonControl', () => {
    // Controlled variant of `RadioButtonControl`
    type RadioButtonControlControlledProps =
        Omit<React.ComponentPropsWithRef<typeof RadioButtonControl>, 'buffer' | 'updateBuffer'> & {
            initialBuffer?: RadioButtonBuffer,
        };
    const RadioButtonControlControlled = ({ initialBuffer = false, ...props }: RadioButtonControlControlledProps) => {
        const [buffer, setBuffer] = React.useState(initialBuffer);
        return <RadioButtonControl buffer={buffer} updateBuffer={setBuffer} {...props}/>;
    };
    
    const setup = (props: Partial<React.ComponentPropsWithRef<typeof RadioButtonControl>> = {}) => {
        const utils = TL.render(
            <RadioButtonControl data-label="radio-button-control" buffer={false} updateBuffer={() => {}} {...props}/>
        );
        
        return {
            ...utils,
            element: utils.getByTestId('radio-button-control'),
        };
    };
    const setupControlled = (props: Partial<React.ComponentPropsWithRef<typeof RadioButtonControlControlled>> = {}) => {
        const utils = TL.render(
            <RadioButtonControlControlled data-label="radio-button-control" {...props}/>
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
        const onChangeMock = jest.fn();
        
        const { element } = setup({ onChange: onChangeMock });
        
        TL.fireEvent.click(element);
        
        expect(onChangeMock).toHaveBeenCalledTimes(1);
        expect(onChangeMock).toHaveBeenCalledWith(expect.objectContaining({ target: element }));
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

describe('RadioControl', () => {
    // Controlled variant of `RadioControl`
    type RadioControlControlledProps =
        Omit<React.ComponentPropsWithRef<typeof RadioControl>, 'buffer' | 'updateBuffer'> & {
            initialBuffer?: string,
        };
    const RadioControlControlled = ({ initialBuffer, ...props }: RadioControlControlledProps) => {
        const [buffer, setBuffer] = React.useState(() => {
            return initialBuffer ?? null;
        });
        return <RadioControl buffer={buffer} updateBuffer={setBuffer} {...props}/>;
    };
    
    const setup = (props: PartialBy<React.ComponentPropsWithRef<typeof RadioControl>, 'buffer' | 'updateBuffer'>) => {
        const utils = TL.render(
            <div data-label="radio-control">
                <RadioControl buffer={null} updateBuffer={() => {}} {...props}/>
            </div>
        );
        
        return {
            ...utils,
            element: utils.getByTestId('radio-control'),
        };
    };
    const setupControlled = (props: React.ComponentPropsWithRef<typeof RadioControlControlled>) => {
        const utils = TL.render(
            <div data-label="radio-control">
                <RadioControlControlled data-label="radio-control" {...props}/>
            </div>
        );
        
        return {
            ...utils,
            element: utils.getByTestId('radio-control'),
        };
    };
    
    beforeEach(TL.cleanup);
    
    test('should render a radio control', () => {
        const { queryAllByRole } = setup({
            id: 'test-radio',
            options: { a: {}, b: {}, c: {} },
            children: <>
                <RadioControl.RadioButton option="a"/>
                <RadioControl.RadioButton option="b"/>
                <RadioControl.RadioButton option="c"/>
            </>,
        });
        
        const radioButtons = queryAllByRole('radio');
        
        expect(radioButtons.length).toBe(3);
        
        for (const radioButton of radioButtons) {
            expect(radioButton).toBeInstanceOf(HTMLInputElement);
            expect(radioButton).toHaveClass('', { exact: true });
            expect(radioButton).toHaveAttribute('type', 'radio');
            expect(radioButton).toHaveAttribute('name', 'test-radio');
        }
    });
    
    test('should update buffer on change', () => {
        const updateBufferMock = jest.fn();
        
        const { getByTestId } = setup({
            buffer: 'b',
            updateBuffer: updateBufferMock,
            options: { a: {}, b: {}, c: {} },
            children: <>
                <RadioControl.RadioButton data-label="option-a" option="a"/>
                <RadioControl.RadioButton data-label="option-b" option="b"/>
                <RadioControl.RadioButton data-label="option-c" option="c"/>
            </>,
        });
        
        TL.fireEvent.click(getByTestId('option-c'));
        
        expect(updateBufferMock).toHaveBeenCalledTimes(1);
        expect(updateBufferMock).toHaveBeenCalledWith('c');
    });
    
    test('should update buffer on change (controlled)', () => {
        const updateBufferMock = jest.fn();
        
        const { getByTestId } = setupControlled({
            initialBuffer: 'b',
            options: { a: {}, b: {}, c: {} },
            children: <>
                <RadioControl.RadioButton data-label="option-a" option="a"/>
                <RadioControl.RadioButton data-label="option-b" option="b"/>
                <RadioControl.RadioButton data-label="option-c" option="c"/>
            </>,
        });
        
        // Simulate click to select radio
        fireUserEvent.click(getByTestId('option-c'));
        
        expect(getByTestId('option-a')).not.toBeChecked();
        expect(getByTestId('option-b')).not.toBeChecked();
        expect(getByTestId('option-c')).toBeChecked();
    });
});
