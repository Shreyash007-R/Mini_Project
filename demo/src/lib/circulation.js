export const DAILY_FINE_RATE = 5;

export const getLocalDateString = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getDateDifferenceInDays = (startDate, endDate) => {
  const [startYear, startMonth, startDay] = startDate.split('-').map(Number);
  const [endYear, endMonth, endDay] = endDate.split('-').map(Number);
  const start = Date.UTC(startYear, startMonth - 1, startDay);
  const end = Date.UTC(endYear, endMonth - 1, endDay);
  return (end - start) / 86400000;
};

export const calculateFineForDate = (dueDate, endDate = getLocalDateString()) => {
  const overdueDays = Math.max(0, getDateDifferenceInDays(dueDate, endDate));
  return { overdueDays, fine: overdueDays * DAILY_FINE_RATE };
};

export const isActiveLoan = (transaction) => (
  transaction.status !== 'Returned' && !transaction.returnDate
);

export const isOverdueLoan = (transaction, today) => (
  isActiveLoan(transaction) && transaction.dueDate < today
);

export const filterActiveLoans = (transactions, { search = '', filterType = 'all', today }) => {
  const query = search.trim().toLocaleLowerCase();

  return transactions.filter((transaction) => {
    if (!isActiveLoan(transaction)) return false;

    const matchesSearch = !query || [
      transaction.bookTitle,
      transaction.memberName,
      transaction.memberId,
      transaction.id,
    ].some((value) => value?.toLocaleLowerCase().includes(query));
    if (!matchesSearch) return false;

    if (filterType === 'overdue') return isOverdueLoan(transaction, today);
    if (filterType === 'dueSoon') {
      const daysUntilDue = getDateDifferenceInDays(today, transaction.dueDate);
      return daysUntilDue >= 0 && daysUntilDue <= 4;
    }
    return true;
  });
};