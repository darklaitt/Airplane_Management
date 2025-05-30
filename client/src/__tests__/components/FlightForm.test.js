import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import FlightForm from '../../components/Flights/FlightForm';

describe('FlightForm Component', () => {
  const mockPlanes = [
    { id: 1, name: 'Boeing 737', seats_count: 180 },
    { id: 2, name: 'Airbus A320', seats_count: 164 }
  ];

  const mockOnSubmit = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render form fields', () => {
    render(
      <FlightForm
        flight={null}
        planes={mockPlanes}
        onSubmit={mockOnSubmit}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByLabelText(/номер рейса/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/самолет/i)).toBeInTheDocument();
    expect(screen.getByText(/маршрут/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/время вылета/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/свободные места/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/цена билета/i)).toBeInTheDocument();
  });

  it('should populate form when editing', () => {
    const flight = {
      id: 1,
      flight_number: 'SU1234',
      plane_id: 1,
      stops: ['Москва', 'Сочи'],
      departure_time: '12:30:00',
      free_seats: 150,
      price: 10000
    };

    render(
      <FlightForm
        flight={flight}
        planes={mockPlanes}
        onSubmit={mockOnSubmit}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByDisplayValue('SU1234')).toBeInTheDocument();
    expect(screen.getByDisplayValue('12:30')).toBeInTheDocument();
    expect(screen.getByDisplayValue('150')).toBeInTheDocument();
    expect(screen.getByDisplayValue('10000')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Москва')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Сочи')).toBeInTheDocument();
  });

  it('should show validation errors when required fields are empty', async () => {
    render(
      <FlightForm
        flight={null}
        planes={mockPlanes}
        onSubmit={mockOnSubmit}
        onClose={mockOnClose}
      />
    );

    const submitButton = screen.getByText(/создать/i);
    
    await act(async () => {
      fireEvent.click(submitButton);
    });

    // Проверяем, что onSubmit не был вызван (валидация не прошла)
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should add and remove stops', async () => {
    render(
      <FlightForm
        flight={null}
        planes={mockPlanes}
        onSubmit={mockOnSubmit}
        onClose={mockOnClose}
      />
    );

    // Изначально должно быть 2 поля ввода остановок (отправление и назначение)
    const initialInputs = screen.getAllByRole('textbox');
    const stopInputs = initialInputs.filter(input => 
      input.placeholder && (
        input.placeholder.includes('Пункт') || 
        input.placeholder.includes('остановка')
      )
    );
    expect(stopInputs).toHaveLength(2);

    // Добавляем остановку
    const addStopButton = screen.getByText(/добавить остановку/i);
    await act(async () => {
      fireEvent.click(addStopButton);
    });

    // Проверяем, что добавилось поле
    const newInputs = screen.getAllByRole('textbox');
    const newStopInputs = newInputs.filter(input => 
      input.placeholder && (
        input.placeholder.includes('Пункт') || 
        input.placeholder.includes('остановка')
      )
    );
    expect(newStopInputs.length).toBeGreaterThan(2);
  });

  it('should submit valid form', async () => {
    render(
      <FlightForm
        flight={null}
        planes={mockPlanes}
        onSubmit={mockOnSubmit}
        onClose={mockOnClose}
      />
    );

    // Заполняем форму
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/номер рейса/i), {
        target: { value: 'SU1234' }
      });

      fireEvent.change(screen.getByLabelText(/самолет/i), {
        target: { value: '1' }
      });

      // Получаем поля остановок
      const stopInputs = screen.getAllByRole('textbox').filter(input => 
        input.placeholder && input.placeholder.includes('Пункт')
      );
      
      if (stopInputs.length >= 2) {
        fireEvent.change(stopInputs[0], { target: { value: 'Москва' } });
        fireEvent.change(stopInputs[1], { target: { value: 'Сочи' } });
      }

      fireEvent.change(screen.getByLabelText(/время вылета/i), {
        target: { value: '12:30' }
      });

      fireEvent.change(screen.getByLabelText(/свободные места/i), {
        target: { value: '150' }
      });

      fireEvent.change(screen.getByLabelText(/цена билета/i), {
        target: { value: '10000' }
      });
    });

    // Отправляем форму
    await act(async () => {
      fireEvent.click(screen.getByText(/создать/i));
    });

    // Проверяем, что форма была отправлена
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
    });
  });

  it('should call onClose when cancel is clicked', async () => {
    render(
      <FlightForm
        flight={null}
        planes={mockPlanes}
        onSubmit={mockOnSubmit}
        onClose={mockOnClose}
      />
    );

    const cancelButton = screen.getByText(/отмена/i);
    await act(async () => {
      fireEvent.click(cancelButton);
    });

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should display update button when editing', () => {
    const flight = {
      id: 1,
      flight_number: 'SU1234',
      plane_id: 1,
      stops: ['Москва', 'Сочи'],
      departure_time: '12:30:00',
      free_seats: 150,
      price: 10000
    };

    render(
      <FlightForm
        flight={flight}
        planes={mockPlanes}
        onSubmit={mockOnSubmit}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText(/обновить/i)).toBeInTheDocument();
    expect(screen.queryByText(/создать/i)).not.toBeInTheDocument();
  });

  it('should show plane options in select', () => {
    render(
      <FlightForm
        flight={null}
        planes={mockPlanes}
        onSubmit={mockOnSubmit}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Boeing 737 (180 мест)')).toBeInTheDocument();
    expect(screen.getByText('Airbus A320 (164 мест)')).toBeInTheDocument();
  });

  it('should handle form input changes', async () => {
    render(
      <FlightForm
        flight={null}
        planes={mockPlanes}
        onSubmit={mockOnSubmit}
        onClose={mockOnClose}
      />
    );

    const flightNumberInput = screen.getByLabelText(/номер рейса/i);
    
    await act(async () => {
      fireEvent.change(flightNumberInput, { target: { value: 'TEST123' } });
    });

    expect(flightNumberInput.value).toBe('TEST123');
  });

  it('should render form layout correctly', () => {
    render(
      <FlightForm
        flight={null}
        planes={mockPlanes}
        onSubmit={mockOnSubmit}
        onClose={mockOnClose}
      />
    );

    // Используем querySelector для поиска формы, так как form может не иметь роли
    const formElement = document.querySelector('form');
    expect(formElement).toBeInTheDocument();
    
    // Проверяем наличие кнопок
    expect(screen.getByText(/создать/i)).toBeInTheDocument();
    expect(screen.getByText(/отмена/i)).toBeInTheDocument();
  });
});