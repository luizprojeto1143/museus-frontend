import { render } from '@testing-library/react';
import { describe, it } from 'vitest';
import App from './App';
import { BrowserRouter } from 'react-router-dom';

import { AuthProvider } from './modules/auth/AuthContext';

describe('App Component', () => {
    it('renders without crashing', () => {
        render(
            <BrowserRouter>
                <AuthProvider>
                    <App />
                </AuthProvider>
            </BrowserRouter>
        );
        // Since we don't know the exact content, we just check if it renders.
        // Ideally we would check for a specific element, e.g.:
        // expect(screen.getByText(/Cultura Viva/i)).toBeInTheDocument();
    });
});
