
import * as React from 'react';


export class ValidationError extends Error {
    constructor(message?: string, public element?: React.ReactElement) {
        super(message);
    }
    
    // Render the validation error as a React element
    render(): React.ReactElement {
        return this.element ?? <>{this.message ?? null}</>;
    }
}
