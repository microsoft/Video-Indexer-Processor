// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

if (URL.createObjectURL === undefined) {
  Object.defineProperty(URL, 'createObjectURL', {
    writable: true,
    value: () => 'urn:test-blob-url',
  });
}

if (URL.revokeObjectURL === undefined) {
  Object.defineProperty(URL, 'revokeObjectURL', {
    writable: true,
    value: () => {},
  });
}

Object.defineProperty(window, 'scrollTo', {
  writable: true,
  value: () => {},
});

Object.defineProperty(window, 'prompt', {
  writable: true,
  value: () => {},
});
