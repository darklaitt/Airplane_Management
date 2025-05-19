import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import axios from 'axios';
import Planes from '../pages/Planes';
import PlaneForm from '../components/Planes/PlaneForm';
import PlaneList from '../components/Planes/PlaneList';

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

// Mock store
const mockStore = configureStore({
  reducer: {
    planes: (state = { planes: [], loading: false, error: null }) => state,
  },
});

// Test wrapper component
const TestWrapper = ({ children }) => (
  <Provider store={mockStore}>
    <BrowserRouter>
      {children}
    </BrowserRouter>
  </Provider>
);

describe('Planes Components', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Planes Page', () => {
    it('should render planes list', async () => {
      const mockPlanes = [
        { id: 1, name: 'Boeing 737', category: 'Средний', seats_count: 180 },
        { id: 2, name: 'Airbus A320', category: 'Средний', seats_count: 164 }
      ];

      mockedAxios.get.mockResolvedValue({
        data: { success: true, data: mockPlanes }
      });

      render(
        <TestWrapper>
          <Planes />
        </TestWrapper>
      );

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.getByText('Boeing 737')).toBeInTheDocument();
        expect(screen.getByText('Airbus A320')).toBeInTheDocument();
      });

      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('/planes')
      );
    });

    it('should display error message on API failure', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Network error'));

      render(
        <TestWrapper>
          <Planes />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/ошибка/i)).toBeInTheDocument();
      });
    });

    it('should open add plane modal', async () => {
      mockedAxios.get.mockResolvedValue({
        data: { success: true, data: [] }
      });

      render(
        <TestWrapper>
          <Planes />
        </TestWrapper>
      );

      await waitFor(() => {
        const addButton = screen.getByText(/добавить самолет/i);
        fireEvent.click(addButton);
      });

      expect(screen.getByText(/добавить самолет/i)).toBeInTheDocument();
    });
  });

  describe('PlaneForm Component', () => {
    const mockOnSubmit = jest.fn();
    const mockOnClose = jest.fn();

    beforeEach(() => {
      mockOnSubmit.mockClear();
      mockOnClose.mockClear();
    });

    it('should render form fields', () => {
      render(
        <PlaneForm
          plane={null}
          onSubmit={mockOnSubmit}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByLabelText(/название самолета/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/категория/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/количество мест/i)).toBeInTheDocument();
    });

    it('should validate form fields', async () => {
      render(
        <PlaneForm
          plane={null}
          onSubmit={mockOnSubmit}
          onClose={mockOnClose}
        />
      );

      const submitButton = screen.getByText(/создать/i);
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/название обязательно/i)).toBeInTheDocument();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should submit valid form', async () => {
      render(
        <PlaneForm
          plane={null}
          onSubmit={mockOnSubmit}
          onClose={mockOnClose}
        />
      );

      // Fill form
      fireEvent.change(screen.getByLabelText(/название самолета/i), {
        target: { value: 'Boeing 777' }
      });
      fireEvent.change(screen.getByLabelText(/количество мест/i), {
        target: { value: '350' }
      });

      // Submit form
      fireEvent.click(screen.getByText(/создать/i));

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          name: 'Boeing 777',
          category: 'Региональный', // Default value
          seats_count: 350
        });
      });
    });

    it('should populate form when editing', () => {
      const plane = {
        id: 1,
        name: 'Boeing 737',
        category: 'Средний',
        seats_count: 180
      };

      render(
        <PlaneForm
          plane={plane}
          onSubmit={mockOnSubmit}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByDisplayValue('Boeing 737')).toBeInTheDocument();
      expect(screen.getByDisplayValue('180')).toBeInTheDocument();
      expect(screen.getByText(/обновить/i)).toBeInTheDocument();
    });
  });

  describe('PlaneList Component', () => {
    const mockOnEdit = jest.fn();
    const mockOnDelete = jest.fn();

    beforeEach(() => {
      mockOnEdit.mockClear();
      mockOnDelete.mockClear();
    });

    it('should render empty state', () => {
      render(
        <PlaneList
          planes={[]}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText(/самолеты не найдены/i)).toBeInTheDocument();
    });

    it('should render planes table', () => {
      const planes = [
        { id: 1, name: 'Boeing 737', category: 'Средний', seats_count: 180 },
        { id: 2, name: 'Airbus A320', category: 'Средний', seats_count: 164 }
      ];

      render(
        <PlaneList
          planes={planes}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('Boeing 737')).toBeInTheDocument();
      expect(screen.getByText('Airbus A320')).toBeInTheDocument();
      expect(screen.getByText('180')).toBeInTheDocument();
      expect(screen.getByText('164')).toBeInTheDocument();
    });

    it('should handle edit button click', () => {
      const planes = [
        { id: 1, name: 'Boeing 737', category: 'Средний', seats_count: 180 }
      ];

      render(
        <PlaneList
          planes={planes}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const editButton = screen.getByText(/редактировать/i);
      fireEvent.click(editButton);

      expect(mockOnEdit).toHaveBeenCalledWith(planes[0]);
    });

    it('should handle delete button click with confirmation', () => {
      // Mock window.confirm
      const originalConfirm = window.confirm;
      window.confirm = jest.fn(() => true);

      const planes = [
        { id: 1, name: 'Boeing 737', category: 'Средний', seats_count: 180 }
      ];

      render(
        <PlaneList
          planes={planes}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const deleteButton = screen.getByText(/удалить/i);
      fireEvent.click(deleteButton);

      expect(window.confirm).toHaveBeenCalled();
      expect(mockOnDelete).toHaveBeenCalledWith(1);

      // Restore original confirm
      window.confirm = originalConfirm;
    });
  });
});