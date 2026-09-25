import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Testing Library only auto-cleans when test globals are enabled; this project imports
// describe/it explicitly, so unmount after each test by hand.
afterEach(cleanup);
