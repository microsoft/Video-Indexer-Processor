import { parseArrayToString } from '../../helpers';

describe('stringHelper', () => {
  test('parseArrayToString should returns a correct string from an array', () => {
    let t = ['A', 'B', 'C'];

    let r = parseArrayToString(t, ',');

    expect(r).toBe('A, B, C');
  });

  test('parseArrayToString should returns a correct string from string', () => {
    let t = 'ABC';

    let r = parseArrayToString(t, ',');

    expect(r).toBe('ABC');
  });

  test('parseArrayToString should returns a correct string from anything else', () => {
    let t = 12;

    let r = parseArrayToString(t as any, ',');

    expect(r).toBe('12');
  });

  test('parseArrayToString should returns a correct string from empty array', () => {
    let t = [];

    let r = parseArrayToString(t, ',');

    expect(r).toBe('');
  });

  test('parseArrayToString should returns a correct string from null value', () => {
    let r = parseArrayToString(null, ',');
    expect(r).toBe('');
  });

  test('parseArrayToString should returns a correct string from undefined value', () => {
    let r = parseArrayToString(undefined, ',');
    expect(r).toBe('');
  });
});
