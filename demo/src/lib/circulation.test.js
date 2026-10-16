import assert from 'node:assert/strict';
import test from 'node:test';
import {
  calculateFineForDate,
  filterActiveLoans,
  getDateDifferenceInDays,
  getLocalDateString,
} from './circulation.js';

const loans = [
  { id: 'late', bookTitle: 'The Late Book', memberName: 'Alex Member', dueDate: '2026-10-14', status: 'Overdue' },
  { id: 'today', bookTitle: 'Today Book', memberName: 'Sam Student', dueDate: '2026-10-15', status: 'Issued' },
  { id: 'soon', bookTitle: 'Soon Book', memberName: 'Riley Reader', dueDate: '2026-10-19', status: 'Issued' },
  { id: 'later', bookTitle: 'Later Book', memberName: 'Morgan Member', dueDate: '2026-10-20', status: 'Issued' },
  { id: 'returned', bookTitle: 'Late Returned Book', memberName: 'Alex Member', dueDate: '2026-10-12', returnDate: '2026-10-14', status: 'Returned' },
];

test('filters active, overdue, due-soon, and returned loans consistently', () => {
  const options = { today: '2026-10-15' };
  assert.deepEqual(filterActiveLoans(loans, options).map((loan) => loan.id), ['late', 'today', 'soon', 'later']);
  assert.deepEqual(filterActiveLoans(loans, { ...options, filterType: 'overdue' }).map((loan) => loan.id), ['late']);
  assert.deepEqual(filterActiveLoans(loans, { ...options, filterType: 'dueSoon' }).map((loan) => loan.id), ['today', 'soon']);
});

test('search applies alongside every filter', () => {
  assert.deepEqual(filterActiveLoans(loans, {
    today: '2026-10-15', filterType: 'overdue', search: 'alex member',
  }).map((loan) => loan.id), ['late']);
  assert.deepEqual(filterActiveLoans(loans, {
    today: '2026-10-15', filterType: 'dueSoon', search: 'soon book',
  }).map((loan) => loan.id), ['soon']);
});

test('date calculations keep exact-day boundaries without timezone parsing', () => {
  assert.equal(getDateDifferenceInDays('2026-10-15', '2026-10-19'), 4);
  assert.deepEqual(calculateFineForDate('2026-10-15', '2026-10-15'), { overdueDays: 0, fine: 0 });
  assert.deepEqual(calculateFineForDate('2026-10-14', '2026-10-15'), { overdueDays: 1, fine: 5 });
  assert.match(getLocalDateString(new Date(2026, 9, 15)), /^2026-10-15$/);
});