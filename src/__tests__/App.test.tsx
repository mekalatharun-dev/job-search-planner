import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@/context/ThemeContext';
import App from '@/App';
import { STORAGE_KEY } from '@/lib/storage';

function renderApp() {
  return render(
    <ThemeProvider>
      <App />
    </ThemeProvider>,
  );
}

function setToday(iso: string) {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date(`${iso}T10:00:00`));
}

const tasksList = () => screen.getByRole('list', { name: /Tasks for day/ });

describe('Planner app', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });
  afterEach(() => vi.useRealTimers());

  it('before the start, shows day 1 with tasks locked', () => {
    setToday('2026-11-05');
    renderApp();
    expect(screen.getByText(/Your plan starts on/)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Day 1 of 30' })).toBeInTheDocument();
    const boxes = within(tasksList()).getAllByRole('checkbox');
    expect(boxes).toHaveLength(7);
    boxes.forEach((b) => expect(b).toBeDisabled());
  });

  it('shows all 30 days in the calendar', () => {
    setToday('2026-11-10');
    renderApp();
    expect(screen.getAllByRole('button', { name: /^Day \d+,/ })).toHaveLength(30);
  });

  it('ticks a task, updates progress and saves it', async () => {
    setToday('2026-11-10');
    const user = userEvent.setup();
    renderApp();
    expect(screen.getByRole('heading', { name: 'Day 5 of 30' })).toBeInTheDocument();
    await user.click(within(tasksList()).getByLabelText('Practise SQL for 1 hour'));
    expect(within(tasksList()).getByLabelText('Practise SQL for 1 hour')).toBeChecked();
    expect(within(tasksList()).getAllByRole('checkbox').filter((c) => (c as HTMLInputElement).checked)).toHaveLength(1);
    expect(screen.getByText('1 of 7 done')).toBeInTheDocument();
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(saved.days['2026-11-10'].done).toEqual(['sql']);
  });

  it('keeps progress after a reload', async () => {
    setToday('2026-11-10');
    const user = userEvent.setup();
    const { unmount } = renderApp();
    await user.click(within(tasksList()).getByLabelText('Contact 5 recruiters'));
    unmount();
    renderApp();
    expect(within(tasksList()).getByLabelText('Contact 5 recruiters')).toBeChecked();
  });

  it('adds and deletes a custom task', async () => {
    setToday('2026-11-10');
    const user = userEvent.setup();
    renderApp();
    const addButton = screen.getByRole('button', { name: 'Add' });
    expect(addButton).toBeDisabled();
    await user.type(screen.getByPlaceholderText('Add a custom task…'), 'Mock interview with friend');
    await user.click(addButton);
    expect(screen.getByLabelText('Mock interview with friend')).toBeInTheDocument();
    expect(screen.getByText('0 of 8 done')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Delete custom task "Mock interview with friend"' }));
    expect(screen.queryByLabelText('Mock interview with friend')).not.toBeInTheDocument();
  });

  it('lists unticked tasks from past days as missed', () => {
    setToday('2026-11-08');
    renderApp();
    expect(screen.getByText('14 unticked tasks on past days')).toBeInTheDocument();
  });

  it('switches days from the calendar', async () => {
    setToday('2026-11-10');
    const user = userEvent.setup();
    renderApp();
    await user.click(screen.getByRole('button', { name: /^Day 12,/ }));
    expect(screen.getByRole('heading', { name: 'Day 12 of 30' })).toBeInTheDocument();
    within(tasksList()).getAllByRole('checkbox').forEach((b) => expect(b).toBeDisabled());
  });

  it('toggles the dark theme', async () => {
    setToday('2026-11-10');
    const user = userEvent.setup();
    renderApp();
    await user.click(screen.getByRole('button', { name: 'Switch to dark theme' }));
    expect(document.documentElement).toHaveClass('dark');
  });
});
