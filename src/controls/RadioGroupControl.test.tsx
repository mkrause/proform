
import * as ObjectUtil from '../util/object_util';

import * as React from 'react';
import * as TL from '@testing-library/react';
import fireUserEvent from '@testing-library/user-event';

import type { RadioBuffer } from './RadioControl';
import type { RadioGroupBuffer } from './RadioGroupControl';
import { RadioGroupControl } from './RadioGroupControl';


// https://stackoverflow.com/questions/43159887/make-a-single-property-optional-in-typescript
type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

describe('RadioGroupControl', () => {
    // Controlled variant of `RadioGroupControl`
    type RadioGroupControlControlledProps =
        Omit<React.ComponentPropsWithRef<typeof RadioGroupControl>, 'buffer' | 'updateBuffer'> & {
            initialBuffer?: string,
        };
    const RadioGroupControlControlled = ({ initialBuffer, ...props }: RadioGroupControlControlledProps) => {
        const [buffer, setBuffer] = React.useState(() => {
            return initialBuffer ?? null;
        });
        return <RadioGroupControl buffer={buffer} updateBuffer={setBuffer} {...props}/>;
    };
    
    const setup = (props: PartialBy<React.ComponentPropsWithRef<typeof RadioGroupControl>, 'buffer' | 'updateBuffer'>) => {
        const utils = TL.render(
            <div data-label="radio-control">
                <RadioGroupControl buffer={null} updateBuffer={() => {}} {...props}/>
            </div>
        );
        
        return {
            ...utils,
            element: utils.getByTestId('radio-control'),
        };
    };
    const setupControlled = (props: React.ComponentPropsWithRef<typeof RadioGroupControlControlled>) => {
        const utils = TL.render(
            <div data-label="radio-control">
                <RadioGroupControlControlled data-label="radio-control" {...props}/>
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
                <RadioGroupControl.Radio option="a"/>
                <RadioGroupControl.Radio option="b"/>
                <RadioGroupControl.Radio option="c"/>
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
                <RadioGroupControl.Radio data-label="option-a" option="a"/>
                <RadioGroupControl.Radio data-label="option-b" option="b"/>
                <RadioGroupControl.Radio data-label="option-c" option="c"/>
            </>,
        });
        
        TL.fireEvent.click(getByTestId('option-c'));
        
        expect(updateBufferMock).toHaveBeenCalledTimes(1);
        expect(updateBufferMock).toHaveBeenCalledWith('c');
    });
    
    test('should update buffer on change (controlled)', () => {
        const { getByTestId } = setupControlled({
            initialBuffer: 'b',
            options: { a: {}, b: {}, c: {} },
            children: <>
                <RadioGroupControl.Radio data-label="option-a" option="a"/>
                <RadioGroupControl.Radio data-label="option-b" option="b"/>
                <RadioGroupControl.Radio data-label="option-c" option="c"/>
            </>,
        });
        
        // Simulate click to select radio
        fireUserEvent.click(getByTestId('option-c'));
        
        expect(getByTestId('option-a')).not.toBeChecked();
        expect(getByTestId('option-b')).not.toBeChecked();
        expect(getByTestId('option-c')).toBeChecked();
    });
});
