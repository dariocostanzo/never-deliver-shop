import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LocaleProvider, useLocale } from '../context/LocaleContext';

function LocaleHarness() {
    const { country, currency, formatCurrency, setCountry, setCurrency } = useLocale();

    return (
        <div>
            <p data-testid="country">{country}</p>
            <p data-testid="currency">{currency}</p>
            <p data-testid="formatted">{formatCurrency(19.99)}</p>
            <button type="button" onClick={() => setCountry('IT')}>Set Italy</button>
            <button type="button" onClick={() => setCurrency('USD')}>Set USD</button>
        </div>
    );
}

describe('LocaleContext', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('defaults to UK with GBP', () => {
        render(
            <LocaleProvider>
                <LocaleHarness />
            </LocaleProvider>
        );

        expect(screen.getByTestId('country')).toHaveTextContent('UK');
        expect(screen.getByTestId('currency')).toHaveTextContent('GBP');
        expect(screen.getByTestId('formatted').textContent).toMatch(/£|GBP/);
    });

    it('changes country and currency and persists state', async () => {
        const user = userEvent.setup();

        render(
            <LocaleProvider>
                <LocaleHarness />
            </LocaleProvider>
        );

        await user.click(screen.getByRole('button', { name: 'Set Italy' }));
        expect(screen.getByTestId('country')).toHaveTextContent('IT');
        expect(screen.getByTestId('currency')).toHaveTextContent('EUR');

        await user.click(screen.getByRole('button', { name: 'Set USD' }));
        expect(screen.getByTestId('currency')).toHaveTextContent('USD');

        const stored = JSON.parse(localStorage.getItem('nds-locale') || '{}');
        expect(stored.country).toBe('IT');
        expect(stored.currency).toBe('USD');
    });
});
