
import * as React from 'react';
import * as TL from '@testing-library/react';

//import { render, fireEvent, within } from '../../../tests/jest/utils/testUtils.js';
import * as Proform from '../../src/proform.tsx';


describe('Proform', () => {
    beforeEach(TL.cleanup);
    
    test('should render', () => {
        const { container, ...queries } = TL.render(
            <Proform.FormProvider>
                <div data-label="form">hello</div>
            </Proform.FormProvider>
        );
        const element = queries.getByTestId('form');
        
        expect(element).toBeInstanceOf(HTMLDivElement);
        expect(element).toHaveTextContent('hello');
    });
});
