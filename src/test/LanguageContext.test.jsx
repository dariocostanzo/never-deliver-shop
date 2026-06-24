import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LanguageProvider, useLanguage } from '../context/LanguageContext';

function LanguageHarness() {
  const { language, t, setLanguage } = useLanguage();

  return (
    <div>
      <p data-testid="language">{language}</p>
      <p data-testid="search-label">{t('searchLabel')}</p>
      <button type="button" onClick={() => setLanguage('it')}>Switch to IT</button>
      <button type="button" onClick={() => setLanguage('de')}>Switch to DE</button>
    </div>
  );
}

describe('LanguageContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('defaults to english and translates labels', () => {
    render(
      <LanguageProvider>
        <LanguageHarness />
      </LanguageProvider>
    );

    expect(screen.getByTestId('language')).toHaveTextContent('en');
    expect(screen.getByTestId('search-label')).toHaveTextContent('Search products');
  });

  it('switches language and persists value', async () => {
    const user = userEvent.setup();

    render(
      <LanguageProvider>
        <LanguageHarness />
      </LanguageProvider>
    );

    await user.click(screen.getByRole('button', { name: 'Switch to IT' }));

    expect(screen.getByTestId('language')).toHaveTextContent('it');
    expect(screen.getByTestId('search-label')).toHaveTextContent('Cerca prodotti');
    expect(localStorage.getItem('nds-language')).toBe('it');
  });
});
