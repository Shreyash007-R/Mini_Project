/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { apiRequest } from '../lib/api';
import { calculateFineForDate, DAILY_FINE_RATE, getLocalDateString, isActiveLoan, isOverdueLoan } from '../lib/circulation';

const LibraryContext = createContext();

export const useLibrary = () => {
  const context = useContext(LibraryContext);
  if (!context) {
    throw new Error('useLibrary must be used within a LibraryProvider');
  }
  return context;
};

const emptyDashboardStats = {
  totalBooks: 0,
  totalCopies: 0,
  availableCopies: 0,
  issuedCopies: 0,
  totalMembers: 0,
  activeIssues: 0,
  overdueCount: 0,
  pendingFines: 0,
};

export const LibraryProvider = ({ children }) => {
  const [books, setBooks] = useState([]);
  const [members, setMembers] = useState([]);
  const [students, setStudents] = useState([]);
  const [borrowRequests, setBorrowRequests] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [studentProfile, setStudentProfile] = useState(null);
  const [dashboardStats, setDashboardStats] = useState(emptyDashboardStats);
  const [transactionError, setTransactionError] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [toasts, setToasts] = useState([]);
  const [auth, setAuth] = useState({ status: 'loading', user: null, csrfToken: null });
  const [loading, setLoading] = useState(true);

  const userRole = auth.user ? (auth.user.role === 'admin' || auth.user.role === 'librarian' ? 'admin' : 'student') : 'student';

  const notify = (message, type = 'success') => {
    const id = Date.now() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const calculateFine = (dueDate, returnDate = null) => (
    calculateFineForDate(dueDate, returnDate || getLocalDateString())
  );

  const loadSession = async () => {
    try {
      const response = await apiRequest('/api/auth/session');
      if (response.user) {
        setAuth({ status: 'authenticated', user: response.user, csrfToken: response.csrfToken || null });
      } else {
        setAuth({ status: 'unauthenticated', user: null, csrfToken: null });
      }
    } catch (error) {
      setAuth({ status: 'unauthenticated', user: null, csrfToken: null });
      notify(error.message || 'The backend is currently unavailable.', 'error');
    }
  };

  const refreshData = useCallback(async (options = {}) => {
    const { silent = false } = options;
    if (!auth.user) {
      return;
    }

    try {
      setLoading(true);
      if (auth.user.role === 'student') {
        const responses = await Promise.allSettled([
          apiRequest('/api/books', { csrfToken: auth.csrfToken }),
          apiRequest('/api/transactions', { csrfToken: auth.csrfToken }),
          apiRequest('/api/student/profile', { csrfToken: auth.csrfToken }),
          apiRequest('/api/borrow-requests', { csrfToken: auth.csrfToken }),
        ]);
        const [booksResult, transactionsResult, profileResult, requestsResult] = responses;
        const failures = [];
        const reportFailure = (label, result) => {
          const message = result.status === 'rejected' ? result.reason?.message : 'Unexpected response format.';
          failures.push(`${label}: ${message || 'Request failed.'}`);
        };

        if (booksResult.status === 'fulfilled' && Array.isArray(booksResult.value)) {
          setBooks(booksResult.value);
        } else {
          reportFailure('Book catalog', booksResult);
        }
        if (transactionsResult.status === 'fulfilled' && Array.isArray(transactionsResult.value)) {
          setTransactions(transactionsResult.value);
          setTransactionError('');
        } else {
          reportFailure('Borrowing history', transactionsResult);
          setTransactionError(transactionsResult.reason?.message || 'Unable to load borrowing history.');
        }
        if (profileResult.status === 'fulfilled' && profileResult.value && typeof profileResult.value === 'object') {
          setStudentProfile(profileResult.value);
        } else {
          reportFailure('Student profile', profileResult);
        }
        if (requestsResult.status === 'fulfilled' && Array.isArray(requestsResult.value)) {
          setBorrowRequests(requestsResult.value);
        } else {
          reportFailure('Borrowing requests', requestsResult);
        }
        if (failures.length) {
          notify(`Some dashboard data could not be loaded. ${failures.join(' ')}`, 'error');
        }
        setMembers([]);
        setStudents([]);
        setDashboardStats(emptyDashboardStats);
      } else {
        const requests = [
          apiRequest('/api/books', { csrfToken: auth.csrfToken }),
          apiRequest('/api/members', { csrfToken: auth.csrfToken }),
          apiRequest('/api/transactions', { csrfToken: auth.csrfToken }).then((response) => {
            if (!Array.isArray(response)) throw new Error('Borrowing history returned an unexpected response.');
            setTransactionError('');
            return response;
          }).catch((error) => {
            setTransactionError(error.message || 'Unable to load borrowing history.');
            throw error;
          }),
          apiRequest('/api/dashboard', { csrfToken: auth.csrfToken }),
          apiRequest('/api/borrow-requests', { csrfToken: auth.csrfToken }),
        ];
        if (auth.user.role === 'admin') {
          requests.push(apiRequest('/api/students', { csrfToken: auth.csrfToken }));
        }
        const results = await Promise.allSettled(requests);
        const failures = [];
        const applyArrayResponse = (result, label, setter) => {
          if (result.status === 'fulfilled' && Array.isArray(result.value)) {
            setter(result.value);
            return;
          }
          const message = result.status === 'rejected'
            ? result.reason?.message || 'Request failed.'
            : 'Unexpected response format.';
          failures.push(`${label}: ${message}`);
        };

        applyArrayResponse(results[0], 'Book catalog', setBooks);
        applyArrayResponse(results[1], 'Member directory', setMembers);
        applyArrayResponse(results[2], 'Borrowing history', setTransactions);
        if (results[3].status === 'fulfilled' && results[3].value && typeof results[3].value === 'object') {
          setDashboardStats(results[3].value);
        } else {
          const message = results[3].status === 'rejected'
            ? results[3].reason?.message || 'Request failed.'
            : 'Unexpected response format.';
          failures.push(`Circulation summary: ${message}`);
        }
        applyArrayResponse(results[4], 'Borrow requests', setBorrowRequests);
        applyArrayResponse(results[5] || { status: 'fulfilled', value: [] }, 'Student accounts', setStudents);
        setTransactionError(failures.join(' '));
        if (failures.length && !silent) {
          notify(`Some library data could not be refreshed. ${failures.join(' ')}`, 'error');
        }
        setStudentProfile(null);
      }

      if (!silent) {
        notify('Library data refreshed successfully.', 'success');
      }
    } catch (error) {
      if (!silent) {
        notify(error.message || 'Unable to refresh library data.', 'error');
      }
      if (error.message && error.message.toLowerCase().includes('session')) {
        setAuth({ status: 'unauthenticated', user: null, csrfToken: null });
      }
      throw error;
    } finally {
      setLoading(false);
    }
  }, [auth.csrfToken, auth.user]);

  useEffect(() => {
    loadSession();
  }, []);

  useEffect(() => {
    if (auth.status === 'authenticated') {
      refreshData({ silent: true }).catch(() => undefined);
    } else if (auth.status === 'unauthenticated') {
      setBooks([]);
      setMembers([]);
      setStudents([]);
      setBorrowRequests([]);
      setTransactions([]);
      setTransactionError('');
      setStudentProfile(null);
      setDashboardStats(emptyDashboardStats);
    }
  }, [auth.status, refreshData]);

  const login = async (username, password) => {
    try {
      const response = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: { username, password },
      });

      setAuth({
        status: 'authenticated',
        user: response.user,
        csrfToken: response.csrfToken || null,
      });

      await refreshData({ silent: true });
      return response;
    } catch (error) {
      setAuth({ status: 'unauthenticated', user: null, csrfToken: null });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiRequest('/api/auth/logout', {
        method: 'POST',
        csrfToken: auth.csrfToken,
      });
    } catch (error) {
      console.warn('Logout request failed:', error);
    } finally {
      setAuth({ status: 'unauthenticated', user: null, csrfToken: null });
      setBooks([]);
      setMembers([]);
      setStudents([]);
      setBorrowRequests([]);
      setTransactions([]);
      setStudentProfile(null);
      setDashboardStats(emptyDashboardStats);
      notify('Signed out successfully.', 'info');
    }
  };

  const addBook = async (bookData) => {
    try {
      const response = await apiRequest('/api/books', {
        method: 'POST',
        body: bookData,
        csrfToken: auth.csrfToken,
      });
      await refreshData({ silent: true });
      notify(`Book "${response.title}" added to catalog!`, 'success');
      return true;
    } catch (error) {
      notify(error.message || 'Unable to add the book.', 'error');
      return false;
    }
  };

  const updateBook = async (bookId, updatedFields) => {
    try {
      await apiRequest(`/api/books/${bookId}`, {
        method: 'PUT',
        body: updatedFields,
        csrfToken: auth.csrfToken,
      });
      await refreshData({ silent: true });
      notify('Book details updated successfully!', 'info');
      return true;
    } catch (error) {
      notify(error.message || 'Unable to update the book.', 'error');
      return false;
    }
  };

  const deleteBook = async (bookId) => {
    try {
      await apiRequest(`/api/books/${bookId}`, {
        method: 'DELETE',
        csrfToken: auth.csrfToken,
      });
      await refreshData({ silent: true });
      notify('Book deleted successfully.', 'info');
      return true;
    } catch (error) {
      notify(error.message || 'Unable to delete the book.', 'error');
      return false;
    }
  };

  const issueBook = async ({ bookId, memberId, dueDate }) => {
    try {
      await apiRequest('/api/transactions', {
        method: 'POST',
        body: { bookId, memberId, dueDate },
        csrfToken: auth.csrfToken,
      });
    } catch (error) {
      notify(error.message || 'Unable to issue the book.', 'error');
      return false;
    }
    try {
      await refreshData({ silent: true });
      notify('Book issued successfully.', 'success');
    } catch {
      notify('Book issued successfully, but library data could not be refreshed.', 'error');
    }
    return true;
  };

  const returnBook = async (transactionId, finePaid = true) => {
    try {
      await apiRequest(`/api/transactions/${transactionId}/return`, {
        method: 'POST',
        body: { finePaid },
        csrfToken: auth.csrfToken,
      });
    } catch (error) {
      notify(error.message || 'Unable to return the book.', 'error');
      return false;
    }
    try {
      await refreshData({ silent: true });
      notify('Book returned successfully.', 'success');
    } catch {
      notify('Book returned successfully, but library data could not be refreshed.', 'error');
    }
    return true;
  };

  const renewBook = async (transactionId, extraDays = 14) => {
    try {
      await apiRequest(`/api/transactions/${transactionId}/renew`, {
        method: 'POST',
        body: { days: extraDays },
        csrfToken: auth.csrfToken,
      });
      await refreshData({ silent: true });
      notify('Loan renewed successfully.', 'info');
      return true;
    } catch (error) {
      notify(error.message || 'Unable to renew the loan.', 'error');
      return false;
    }
  };

  const addMember = async (memberData) => {
    try {
      const response = await apiRequest('/api/members', {
        method: 'POST',
        body: memberData,
        csrfToken: auth.csrfToken,
      });
      await refreshData({ silent: true });
      notify(`Member "${response.name}" registered successfully!`, 'success');
      return true;
    } catch (error) {
      notify(error.message || 'Unable to register the member.', 'error');
      return false;
    }
  };

  const updateMember = async (memberId, updatedFields) => {
    try {
      await apiRequest(`/api/members/${memberId}`, {
        method: 'PUT',
        body: updatedFields,
        csrfToken: auth.csrfToken,
      });
      await refreshData({ silent: true });
      notify('Member profile updated!', 'info');
      return true;
    } catch (error) {
      notify(error.message || 'Unable to update the member.', 'error');
      return false;
    }
  };

  const deleteMember = async (memberId) => {
    try {
      await apiRequest(`/api/members/${memberId}`, {
        method: 'DELETE',
        csrfToken: auth.csrfToken,
      });
      await refreshData({ silent: true });
      notify('Member deleted successfully.', 'info');
      return true;
    } catch (error) {
      notify(error.message || 'Unable to delete the member.', 'error');
      return false;
    }
  };

  const addStudent = async (studentData) => {
    try {
      const response = await apiRequest('/api/students', {
        method: 'POST',
        body: studentData,
        csrfToken: auth.csrfToken,
      });
      await refreshData({ silent: true });
      notify(`Student account for ${response.name} created.`, 'success');
      return true;
    } catch (error) {
      notify(error.message || 'Unable to create the student account.', 'error');
      return false;
    }
  };

  const updateStudent = async (studentId, studentData) => {
    try {
      await apiRequest(`/api/students/${studentId}`, {
        method: 'PUT',
        body: studentData,
        csrfToken: auth.csrfToken,
      });
      await refreshData({ silent: true });
      notify('Student account updated.', 'info');
      return true;
    } catch (error) {
      notify(error.message || 'Unable to update the student account.', 'error');
      return false;
    }
  };

  const setStudentActive = async (studentId, active) => {
    try {
      await apiRequest(`/api/students/${studentId}/status`, {
        method: 'PATCH',
        body: { active },
        csrfToken: auth.csrfToken,
      });
      await refreshData({ silent: true });
      notify(active ? 'Student account reactivated.' : 'Student account deactivated.', 'info');
      return true;
    } catch (error) {
      notify(error.message || 'Unable to change the account status.', 'error');
      return false;
    }
  };

  const requestBook = async (bookId) => {
    try {
      await apiRequest('/api/borrow-requests', {
        method: 'POST',
        body: { bookId },
        csrfToken: auth.csrfToken,
      });
      await refreshData({ silent: true });
      notify('Borrow request submitted.', 'success');
      return true;
    } catch (error) {
      notify(error.message || 'Unable to request this book.', 'error');
      return false;
    }
  };

  const reviewBorrowRequest = async (requestId, action) => {
    try {
      await apiRequest(`/api/borrow-requests/${requestId}`, {
        method: 'PATCH',
        body: { action },
        csrfToken: auth.csrfToken,
      });
      await refreshData({ silent: true });
      const completionLabel = { approve: 'approved', reject: 'rejected', issue: 'issued' }[action];
      notify(`Borrow request ${completionLabel}.`, 'success');
      return true;
    } catch (error) {
      notify(error.message || 'Unable to update this borrow request.', 'error');
      return false;
    }
  };

  const getStudentDetails = async (studentId) => {
    try {
      return await apiRequest(`/api/students/${studentId}`, { csrfToken: auth.csrfToken });
    } catch (error) {
      notify(error.message || 'Unable to load student details.', 'error');
      return null;
    }
  };

  const resetToDemoData = async () => {
    if (!auth.user) {
      notify('Please sign in before refreshing data.', 'error');
      return false;
    }

    try {
      await refreshData({ silent: false });
      return true;
    } catch (error) {
      notify(error.message || 'Unable to refresh the data.', 'error');
      return false;
    }
  };

  const today = dashboardStats?.asOfDate || getLocalDateString();
  const overdueTransactions = useMemo(() => (
    transactions.filter((transaction) => isOverdueLoan(transaction, today))
  ), [transactions, today]);

  const stats = useMemo(() => {
    const totalCopies = books.reduce((total, book) => total + (book.totalCopies || 0), 0);
    const availableCopies = books.reduce((total, book) => total + (book.availableCopies || 0), 0);
    const totalMembers = members.length;
    const activeIssues = transactions.filter(isActiveLoan).length;
    const overdueCount = overdueTransactions.length;
    const pendingFines = overdueTransactions.reduce((total, transaction) => {
      const accruedFine = calculateFineForDate(transaction.dueDate, today).fine;
      return total + Math.max(Number(transaction.fineAmount) || 0, accruedFine);
    }, 0);

    const dashboard = dashboardStats || emptyDashboardStats;

    return {
      totalBooks: dashboard.totalBooks || books.length,
      totalCopies: dashboard.totalCopies || totalCopies,
      availableCopies: dashboard.availableCopies || availableCopies,
      issuedCopies: dashboard.issuedCopies || Math.max(0, totalCopies - availableCopies),
      totalMembers: dashboard.totalMembers || totalMembers,
      activeIssues,
      overdueCount,
      pendingFines,
    };
  }, [books, members, transactions, dashboardStats, overdueTransactions, today]);

  return (
    <LibraryContext.Provider
      value={{
        auth,
        books,
        members,
        students,
        borrowRequests,
        transactions,
        studentProfile,
        activeTab,
        setActiveTab,
        searchQuery,
        setSearchQuery,
        userRole,
        setUserRole: () => undefined,
        toasts,
        notify,
        removeToast,
        stats,
        dashboardStats,
        transactionError,
        overdueTransactions,
        calculateFine,
        addBook,
        updateBook,
        deleteBook,
        issueBook,
        returnBook,
        renewBook,
        addMember,
        updateMember,
        deleteMember,
        addStudent,
        updateStudent,
        setStudentActive,
        requestBook,
        reviewBorrowRequest,
        getStudentDetails,
        resetToDemoData,
        login,
        logout,
        loading,
        DAILY_FINE_RATE,
      }}
    >
      {children}
    </LibraryContext.Provider>
  );
};

