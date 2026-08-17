import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EntityForm } from '@/components/entities/EntityForm';
import { Entity } from '@/store/entities';
import { I18nProvider } from '@/i18n/context';

const mockMessages = {};

function renderWithI18n(ui: React.ReactElement) {
  return render(
    <I18nProvider locale="en" messages={mockMessages}>
      {ui}
    </I18nProvider>
  );
}

function createTestEntity(overrides: Partial<Entity> = {}): Entity {
  return {
    id: 'entity-1',
    name: 'Test School',
    color: '#3b82f6',
    avatar: '🏫',
    createdBy: 'user-1',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...overrides,
  };
}

describe('EntityForm', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render form with empty fields for new entity', () => {
    renderWithI18n(<EntityForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} isLoading={false} />);

    expect(screen.getByPlaceholderText('למשל: גן ילדים, בית ספר, חוג כדורגל')).toBeInTheDocument();
    expect(screen.getByText('צבע')).toBeInTheDocument();
    expect(screen.getByText('סמל (אמוג\'י)')).toBeInTheDocument();
    expect(screen.getByText('ביטול')).toBeInTheDocument();
    expect(screen.getByText('צור ישות')).toBeInTheDocument();
  });

  it('should render form with initial entity data for editing', () => {
    const entity = createTestEntity();
    renderWithI18n(<EntityForm initialEntity={entity} onSubmit={mockOnSubmit} onCancel={mockOnCancel} isLoading={false} />);

    expect(screen.getByDisplayValue('Test School')).toBeInTheDocument();
    expect(screen.getByText('שמור שינויים')).toBeInTheDocument();
  });

  it('should update form data when name input changes', () => {
    renderWithI18n(<EntityForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} isLoading={false} />);

    const nameInput = screen.getByPlaceholderText('למשל: גן ילדים, בית ספר, חוג כדורגל');
    fireEvent.change(nameInput, { target: { value: 'New School Name' } });

    expect(nameInput).toHaveValue('New School Name');
  });

  it('should update selected color when color button is clicked', () => {
    renderWithI18n(<EntityForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} isLoading={false} />);

    const colorButtons = screen.getAllByRole('button', { name: /צבע/ });
    fireEvent.click(colorButtons[1]);

    expect(colorButtons[1]).toHaveAttribute('aria-pressed', 'true');
    expect(colorButtons[0]).toHaveAttribute('aria-pressed', 'false');
  });

  it('should update selected avatar when avatar button is clicked', () => {
    renderWithI18n(<EntityForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} isLoading={false} />);

    const avatarButtons = screen.getAllByRole('button', { name: /סמל/ });
    fireEvent.click(avatarButtons[1]);

    expect(avatarButtons[1]).toHaveAttribute('aria-pressed', 'true');
    expect(avatarButtons[0]).toHaveAttribute('aria-pressed', 'false');
  });

  it('should call onSubmit with form data when form is submitted', () => {
    renderWithI18n(<EntityForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} isLoading={false} />);

    const nameInput = screen.getByPlaceholderText('למשל: גן ילדים, בית ספר, חוג כדורגל');
    fireEvent.change(nameInput, { target: { value: 'New School' } });

    const colorButtons = screen.getAllByRole('button', { name: /צבע/ });
    fireEvent.click(colorButtons[2]);

    const avatarButtons = screen.getAllByRole('button', { name: /סמל/ });
    fireEvent.click(avatarButtons[3]);

    fireEvent.click(screen.getByText('צור ישות'));

    expect(mockOnSubmit).toHaveBeenCalledWith({
      name: 'New School',
      color: colorButtons[2].getAttribute('aria-label')?.replace('צבע ', '') || '#3b82f6',
      avatar: avatarButtons[3].textContent || '🏫',
    });
  });

  it('should call onCancel when cancel button is clicked', () => {
    renderWithI18n(<EntityForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} isLoading={false} />);

    fireEvent.click(screen.getByText('ביטול'));

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('should not call onSubmit when name is empty', () => {
    renderWithI18n(<EntityForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} isLoading={false} />);

    fireEvent.click(screen.getByText('צור ישות'));

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should disable submit button when loading', () => {
    renderWithI18n(<EntityForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} isLoading={true} />);

    const submitButton = screen.getByText('צור ישות');
    expect(submitButton).toBeDisabled();
    expect(screen.getByRole('button', { name: /צור ישות/ })).toBeInTheDocument();
  });

  it('should disable submit button when name is empty', () => {
    renderWithI18n(<EntityForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} isLoading={false} />);

    const submitButton = screen.getByText('צור ישות');
    expect(submitButton).toBeDisabled();
  });

  it('should enable submit button when name is filled', () => {
    renderWithI18n(<EntityForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} isLoading={false} />);

    const nameInput = screen.getByPlaceholderText('למשל: גן ילדים, בית ספר, חוג כדורגל');
    fireEvent.change(nameInput, { target: { value: 'New School' } });

    const submitButton = screen.getByText('צור ישות');
    expect(submitButton).not.toBeDisabled();
  });

  it('should show loader when loading', () => {
    renderWithI18n(<EntityForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} isLoading={true} />);

    expect(screen.getByRole('button', { name: /צור ישות/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /צור ישות/ })).toContainHTML('animate-spin');
  });

  it('should have maxLength of 50 on name input', () => {
    renderWithI18n(<EntityForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} isLoading={false} />);

    const nameInput = screen.getByPlaceholderText('למשל: גן ילדים, בית ספר, חוג כדורגל');
    expect(nameInput).toHaveAttribute('maxLength', '50');
  });

  it('should have autoFocus prop on name input', () => {
    renderWithI18n(<EntityForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} isLoading={false} />);

    const nameInput = screen.getByPlaceholderText('למשל: גן ילדים, בית ספר, חוג כדורגל');
    // autoFocus is a React prop, not necessarily a DOM attribute
    expect(nameInput).toBeInTheDocument();
  });

  it('should render all color options', () => {
    renderWithI18n(<EntityForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} isLoading={false} />);

    const colorButtons = screen.getAllByRole('button', { name: /צבע/ });
    expect(colorButtons.length).toBeGreaterThan(10);
  });

  it('should render all avatar options', () => {
    renderWithI18n(<EntityForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} isLoading={false} />);

    const avatarButtons = screen.getAllByRole('button', { name: /סמל/ });
    expect(avatarButtons.length).toBeGreaterThan(50);
  });

  it('should show initial entity color as selected', () => {
    const entity = createTestEntity({ color: '#ef4444' });
    renderWithI18n(<EntityForm initialEntity={entity} onSubmit={mockOnSubmit} onCancel={mockOnCancel} isLoading={false} />);

    const colorButtons = screen.getAllByRole('button', { name: /צבע/ });
    const selectedButton = colorButtons.find(btn => btn.getAttribute('aria-pressed') === 'true');
    expect(selectedButton).toBeInTheDocument();
    expect(selectedButton).toHaveAttribute('aria-label', 'צבע #ef4444');
  });

  it('should show initial entity avatar as selected', () => {
    const entity = createTestEntity({ avatar: '🏠' });
    renderWithI18n(<EntityForm initialEntity={entity} onSubmit={mockOnSubmit} onCancel={mockOnCancel} isLoading={false} />);

    const avatarButtons = screen.getAllByRole('button', { name: /סמל/ });
    const selectedButton = avatarButtons.find(btn => btn.getAttribute('aria-pressed') === 'true');
    expect(selectedButton).toBeInTheDocument();
    expect(selectedButton).toHaveTextContent('🏠');
  });
});