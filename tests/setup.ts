import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock localStorage for zustand persist middleware
const localStorageMock = {
  getItem: vi.fn((key: string) => null),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Mock URL.createObjectURL and revokeObjectURL
global.URL.createObjectURL = vi.fn(() => 'mock-url');
global.URL.revokeObjectURL = vi.fn();

// Mock document.createElement for anchor tags
const originalCreateElement = document.createElement.bind(document);
document.createElement = vi.fn((tagName: string) => {
  if (tagName === 'a') {
    const anchor = originalCreateElement('a');
    anchor.href = '';
    anchor.download = '';
    anchor.click = vi.fn();
    return anchor;
  }
  return originalCreateElement(tagName);
});

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3000/',
    assign: vi.fn(),
    replace: vi.fn(),
  },
  writable: true,
});