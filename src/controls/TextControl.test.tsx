
import * as React from 'react';
import * as TL from '@testing-library/react';

import { TextControl } from './TextControl';


describe('TextControl', () => {
    beforeEach(TL.cleanup);
    
    test('should render a text control', () => {
        const { container, ...queries } = TL.render(
            <TextControl
                data-label="text-control"
                buffer="test"
                updateBuffer={() => {}}
            />
        );
        const element = queries.getByTestId('text-control');
        
        expect(element).toBeInstanceOf(HTMLInputElement);
    });
});
