import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

test('login form shows a useful error when credentials fail', async () => {
  localStorage.clear();
  globalThis.fetch = async () => new Response(JSON.stringify({ error: 'Email or password is incorrect.' }), { status: 401 });
  render(<App />);
  await userEvent.click(screen.getByRole('button', { name: /sign in/i }));
  expect(await screen.findByText('Email or password is incorrect.')).toBeInTheDocument();
});
