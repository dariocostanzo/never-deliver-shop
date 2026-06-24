import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StarRating } from '../components/StarRating';
import { vi } from 'vitest';

describe('StarRating', () => {
    it('renders rating label and review count', () => {
        render(<StarRating rating={4.5} count={1234} />);

        expect(screen.getByLabelText('Rated 4.5 out of 5')).toBeInTheDocument();
        expect(screen.getByText('(1,234)')).toBeInTheDocument();
    });

    it('calls onReviewClick when review count is clicked', async () => {
        const user = userEvent.setup();
        const onReviewClick = vi.fn();

        render(<StarRating rating={4.2} count={75} onReviewClick={onReviewClick} />);

        await user.click(screen.getByRole('button', { name: 'Open customer reviews' }));
        expect(onReviewClick).toHaveBeenCalledTimes(1);
    });
});
