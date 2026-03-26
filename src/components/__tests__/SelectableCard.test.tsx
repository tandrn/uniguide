import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SelectableCard } from '../SelectableCard';
describe('SelectableCard', () => {
    it('renders the title correctly', () => {
        render(<SelectableCard title="Test Title" selected={false} onSelect={() => {}} />);
        expect(screen.getByText('Test Title')).toBeInTheDocument();
    });
    it('applies the selected styles when selected is true', () => {
        render(<SelectableCard title="Test Title" selected={true} onSelect={() => {}} />);
        const card = screen.getByText('Test Title').closest('button');
        expect(card).toHaveClass('border-text-primary');
        expect(card).toHaveClass('bg-surface');
    });
    it('calls onSelect handler when clicked', () => {
        const handleSelect = jest.fn();
        render(<SelectableCard title="Test Title" selected={false} onSelect={handleSelect} />);
        const card = screen.getByText('Test Title').closest('button');
        fireEvent.click(card!);
        expect(handleSelect).toHaveBeenCalledTimes(1);
    });
});
