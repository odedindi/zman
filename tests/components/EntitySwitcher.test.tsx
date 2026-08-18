import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EntitySwitcher } from '@/components/entities/EntitySwitcher';
import { useEntitiesStore } from '@/store/entities';
import { I18nProvider } from '@/i18n/context';

const mockMessages = {
  entities: {
    addFirst: 'Add first entity',
    select: 'Select',
    addNew: 'Add new',
    manage: 'Manage',
    backToHome: 'Back to home',
  },
};

function renderWithI18n(ui: React.ReactElement) {
  return render(
    <I18nProvider locale="en" messages={mockMessages}>
      {ui}
    </I18nProvider>
  );
}

describe('EntitySwitcher', () => {
  beforeEach(() => {
    useEntitiesStore.getState().reset();
    vi.clearAllMocks();
  });

  it('should show "Add first entity" link when no entities exist', () => {
    renderWithI18n(<EntitySwitcher />);
    expect(screen.getByText('Add first entity')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Add first entity' })).toHaveAttribute('href', '/en/entities/new');
  });

  it('should show active entity when entities exist', () => {
    const id = useEntitiesStore.getState().addEntity({ name: 'Test School', color: '#3b82f6', avatar: '🏫' });
    useEntitiesStore.getState().setActiveEntity(id);

    renderWithI18n(<EntitySwitcher />);
    expect(screen.getByText('Test School')).toBeInTheDocument();
  });

  it('should open dropdown when button is clicked', () => {
    const id = useEntitiesStore.getState().addEntity({ name: 'Test School', color: '#3b82f6', avatar: '🏫' });
    useEntitiesStore.getState().setActiveEntity(id);

    renderWithI18n(<EntitySwitcher />);
    const triggerButton = screen.getByRole('button', { name: /Test School/ });
    fireEvent.click(triggerButton);
    
    expect(screen.getByText('Add new')).toBeInTheDocument();
    expect(screen.getByText('Manage')).toBeInTheDocument();
  });

  it('should show entities in dropdown', () => {
    const id1 = useEntitiesStore.getState().addEntity({ name: 'School 1', color: '#3b82f6', avatar: '🏫' });
    useEntitiesStore.getState().addEntity({ name: 'School 2', color: '#ef4444', avatar: '🏠' });
    useEntitiesStore.getState().setActiveEntity(id1);

    renderWithI18n(<EntitySwitcher />);
    const triggerButton = screen.getByRole('button', { name: /School 1/ });
    fireEvent.click(triggerButton);
    
    expect(screen.getAllByText('School 1').length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText('School 2')).toBeInTheDocument();
  });

  it('should switch active entity when clicking on another entity', () => {
    const id1 = useEntitiesStore.getState().addEntity({ name: 'School 1', color: '#3b82f6', avatar: '🏫' });
    const id2 = useEntitiesStore.getState().addEntity({ name: 'School 2', color: '#ef4444', avatar: '🏠' });
    useEntitiesStore.getState().setActiveEntity(id1);

    renderWithI18n(<EntitySwitcher />);
    const triggerButton = screen.getByRole('button', { name: /School 1/ });
    fireEvent.click(triggerButton);
    
    const entity2Buttons = screen.getAllByText('School 2');
    fireEvent.click(entity2Buttons[entity2Buttons.length - 1]);

    expect(useEntitiesStore.getState().activeEntityId).toBe(id2);
  });

  it('should close dropdown when clicking outside', () => {
    const id = useEntitiesStore.getState().addEntity({ name: 'Test School', color: '#3b82f6', avatar: '🏫' });
    useEntitiesStore.getState().setActiveEntity(id);

    renderWithI18n(<EntitySwitcher />);
    const triggerButton = screen.getByRole('button', { name: /Test School/ });
    fireEvent.click(triggerButton);
    expect(screen.getByText('Add new')).toBeInTheDocument();

    const backdrop = document.querySelector('.fixed.inset-0.z-40');
    if (backdrop) {
      fireEvent.click(backdrop);
    } else {
      fireEvent.click(document.body);
    }
    
    expect(screen.queryByText('Add new')).not.toBeInTheDocument();
  });

  it('should navigate to new entity page when "Add new" is clicked', () => {
    const id = useEntitiesStore.getState().addEntity({ name: 'Test School', color: '#3b82f6', avatar: '🏫' });
    useEntitiesStore.getState().setActiveEntity(id);

    renderWithI18n(<EntitySwitcher />);
    const triggerButton = screen.getByRole('button', { name: /Test School/ });
    fireEvent.click(triggerButton);
    
    const addNewButton = screen.getByRole('button', { name: 'Add new' });
    fireEvent.click(addNewButton);

    expect(window.location.href).toBe('/en/entities/new');
  });

  it('should navigate to manage entities page when "Manage" is clicked', () => {
    const id = useEntitiesStore.getState().addEntity({ name: 'Test School', color: '#3b82f6', avatar: '🏫' });
    useEntitiesStore.getState().setActiveEntity(id);

    renderWithI18n(<EntitySwitcher />);
    const triggerButton = screen.getByRole('button', { name: /Test School/ });
    fireEvent.click(triggerButton);
    
    const manageButton = screen.getByRole('button', { name: 'Manage' });
    fireEvent.click(manageButton);

    expect(window.location.href).toBe('/en/entities');
  });
});
