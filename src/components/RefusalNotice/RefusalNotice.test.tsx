import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import site from '../../mocks/site.json';
import { RefusalNotice } from './RefusalNotice';

describe('RefusalNotice', () => {
  it('renders the reason and every contact detail as a link', () => {
    render(<RefusalNotice reason="I couldn't find that on the crawled pages." contact={site.contact} />);

    expect(screen.getByText("I couldn't find that on the crawled pages.")).toBeTruthy();
    expect(screen.getByRole('link', { name: 'info@aibitsoft.com' }).getAttribute('href')).toBe(
      'mailto:info@aibitsoft.com',
    );
    expect(screen.getByRole('link', { name: '+923008642198' }).getAttribute('href')).toBe('tel:+923008642198');
    expect(screen.getByRole('link', { name: 'Contact page' }).getAttribute('href')).toBe(
      'https://aibitsoft.com/?page=contact',
    );
  });

  it('strips formatting from phone numbers in the tel: link', () => {
    render(<RefusalNotice reason="Not covered." contact={{ phone: '+92 300 864-2198' }} />);
    expect(screen.getByRole('link', { name: '+92 300 864-2198' }).getAttribute('href')).toBe('tel:+923008642198');
  });

  it('omits the contact lead-in when the site listed no contact details', () => {
    render(<RefusalNotice reason="Not covered." contact={{}} />);
    expect(screen.queryByRole('link')).toBeNull();
    expect(screen.queryByText(/ask the site owner/)).toBeNull();
  });

  it('is not styled or announced as an error', () => {
    render(<RefusalNotice reason="Not covered." contact={site.contact} />);
    expect(screen.queryByRole('alert')).toBeNull();
  });
});
