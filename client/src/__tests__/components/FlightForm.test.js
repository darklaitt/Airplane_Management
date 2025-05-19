import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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
    expect(screen.getByLabelText(/маршрут/i)).toBeInTheDocument();
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
  });

  it('should validate required fields', async () => {
    render(
      <FlightForm
        flight={null}
        planes={mockPlanes}
        onSubmit={mockOnSubmit}
        onClose={mockOnClose}
      />
    );

    const submitButton = screen.getByText(/создать/i);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/номер рейса обязателен/i)).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should validate flight number format', async () => {
    render(
      <FlightForm
        flight={null}
        planes={mockPlanes}
        onSubmit={mockOnSubmit}
        onClose={mockOnClose}
      />
    );

    const flightNumberInput = screen.getByLabelText(/номер рейса/i);
    fireEvent.change(flightNumberInput, { target: { value: 'invalid123' } });

    const submitButton = screen.getByText(/создать/i);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/неверный формат времени/i)).toBeInTheDocument();
    });
  });

  it('should validate stops', async () => {
    render(
      <FlightForm
        flight={null}
        planes={mockPlanes}
        onSubmit={mockOnSubmit}
        onClose={mockOnClose}
      />
    );

    // Fill required fields except stops
    fireEvent.change(screen.getByLabelText(/номер рейса/i), {
      target: { value: 'SU1234' }
    });

    const submitButton = screen.getByText(/создать/i);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/все пункты маршрута должны быть заполнены/i)).toBeInTheDocument();
    });
  });

  it('should add and remove stops', () => {
    render(
      <FlightForm
        flight={null}
        planes={mockPlanes}
        onSubmit={mockOnSubmit}
        onClose={mockOnClose}
      />
    );

    // Initially should have 2 stop inputs (departure and destination)
    expect(screen.getAllByPlaceholderText(/пункт/i)).toHaveLength(2);

    // Add stop
    const addStopButton = screen.getByText(/добавить остановку/i);
    fireEvent.click(addStopButton);

    // Should now have 3 stop inputs
    expect(screen.getAllByPlaceholderText(/остановка|пункт/i)).toHaveLength(3);

    // Remove intermediate stop
    const removeButtons = screen.getAllByText(/×/);
    if (removeButtons.length > 0) {
      fireEvent.click(removeButtons[0]);
      expect(screen.getAllByPlaceholderText(/остановка|пункт/i)).toHaveLength(2);
    }
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

    // Fill form
    fireEvent.change(screen.getByLabelText(/номер рейса/i), {
      target: { value: 'SU1234' }
    });

    fireEvent.change(screen.getByLabelText(/самолет/i), {
      target: { value: '1' }
    });

    const stopInputs = screen.getAllByPlaceholderText(/пункт/i);
    fireEvent.change(stopInputs[0], { target: { value: 'Москва' } });
    fireEvent.change(stopInputs[1], { target: { value: 'Сочи' } });

    fireEvent.change(screen.getByLabelText(/время вылета/i), {
      target: { value: '12:30' }
    });

    fireEvent.change(screen.getByLabelText(/свободные места/i), {
      target: { value: '150' }
    });

    fireEvent.change(screen.getByLabelText(/цена билета/i), {
      target: { value: '10000' }
    });

    // Submit form
    fireEvent.click(screen.getByText(/создать/i));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        flight_number: 'SU1234',
        plane_id: 1,
        stops: ['Москва', 'Сочи'],
        departure_time: '12:30:00',
        free_seats: 150,
        price: 10000
      });
    });
  });

  it('should call onClose when cancel is clicked', () => {
    render(
      <FlightForm
        flight={null}
        planes={mockPlanes}
        onSubmit={mockOnSubmit}
        onClose={mockOnClose}
      />
    );

    const cancelButton = screen.getByText(/отмена/i);
    fireEvent.click(cancelButton);

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
});