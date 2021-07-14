
import * as ObjectUtil from '../util/object_util';

import * as React from 'react';
import * as TL from '@testing-library/react';
import fireUserEvent from '@testing-library/user-event';

import type { CheckboxBuffer } from './CheckboxControl';
import type { CheckboxGroupBuffer } from './CheckboxGroupControl';
import { CheckboxGroupControl } from './CheckboxGroupControl';


// https://stackoverflow.com/questions/43159887/make-a-single-property-optional-in-typescript
type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

describe('CheckboxGroupControl', () => {
    // Controlled variant of `CheckboxGroupControl`
    type CheckboxGroupControlControlledProps =
        Omit<React.ComponentPropsWithRef<typeof CheckboxGroupControl>, 'buffer' | 'updateBuffer'> & {
            initialBuffer?: Array<string>,
        };
    const CheckboxGroupControlControlled = ({ initialBuffer, ...props }: CheckboxGroupControlControlledProps) => {
        const [buffer, setBuffer] = React.useState(() => {
            return initialBuffer ?? [];
        });
        return <CheckboxGroupControl buffer={buffer} updateBuffer={setBuffer} {...props}/>;
    };
    
    const setup = (props: PartialBy<React.ComponentPropsWithRef<typeof CheckboxGroupControl>, 'buffer' | 'updateBuffer'>) => {
        const utils = TL.render(
            <div data-label="checkbox-control">
                <CheckboxGroupControl buffer={[]} updateBuffer={() => {}} {...props}/>
            </div>
        );
        
        return {
            ...utils,
            element: utils.getByTestId('checkbox-control'),
        };
    };
    const setupControlled = (props: React.ComponentPropsWithRef<typeof CheckboxGroupControlControlled>) => {
        const utils = TL.render(
            <div data-label="checkbox-control">
                <CheckboxGroupControlControlled data-label="checkbox-control" {...props}/>
            </div>
        );
        
        return {
            ...utils,
            element: utils.getByTestId('checkbox-control'),
        };
    };
    
    beforeEach(TL.cleanup);
    
    test('should render a checkbox control', () => {
        const { queryAllByRole } = setup({
            id: 'test-checkbox',
            options: { a: {}, b: {}, c: {} },
            children: <>
                <CheckboxGroupControl.Checkbox option="a"/>
                <CheckboxGroupControl.Checkbox option="b"/>
                <CheckboxGroupControl.Checkbox option="c"/>
            </>,
        });
        
        const checkboxButtons = queryAllByRole('checkbox');
        
        expect(checkboxButtons.length).toBe(3);
        
        for (const checkboxButton of checkboxButtons) {
            expect(checkboxButton).toBeInstanceOf(HTMLInputElement);
            expect(checkboxButton).toHaveClass('', { exact: true });
            expect(checkboxButton).toHaveAttribute('type', 'checkbox');
            expect(checkboxButton).toHaveAttribute('name', 'test-checkbox');
        }
    });
    
    test('should update buffer on change', () => {
        const updateBufferMock = jest.fn();
        
        const { getByTestId } = setup({
            buffer: ['b'],
            updateBuffer: updateBufferMock,
            options: { a: {}, b: {}, c: {} },
            children: <>
                <CheckboxGroupControl.Checkbox data-label="option-a" option="a"/>
                <CheckboxGroupControl.Checkbox data-label="option-b" option="b"/>
                <CheckboxGroupControl.Checkbox data-label="option-c" option="c"/>
            </>,
        });
        
        TL.fireEvent.click(getByTestId('option-c'));
        
        expect(updateBufferMock).toHaveBeenCalledTimes(1);
        expect(updateBufferMock).toHaveBeenCalledWith(['b', 'c']);
    });
    
    test('should update buffer on change (controlled)', () => {
        const updateBufferMock = jest.fn();
        
        const { getByTestId } = setupControlled({
            initialBuffer: ['b'],
            options: { a: {}, b: {}, c: {} },
            children: <>
                <CheckboxGroupControl.Checkbox data-label="option-a" option="a"/>
                <CheckboxGroupControl.Checkbox data-label="option-b" option="b"/>
                <CheckboxGroupControl.Checkbox data-label="option-c" option="c"/>
            </>,
        });
        
        // Simulate click to select checkbox
        fireUserEvent.click(getByTestId('option-c'));
        
        expect(getByTestId('option-a')).not.toBeChecked();
        expect(getByTestId('option-b')).toBeChecked();
        expect(getByTestId('option-c')).toBeChecked();
    });
});
