const planeController = require('../../../src/controllers/planeController');
const Plane = require('../../../src/models/Plane');

// Mock the Plane model
jest.mock('../../../src/models/Plane');

describe('PlaneController', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      params: {},
      body: {},
      query: {}
    };
    res = {
      status: jest.fn(() => res),
      json: jest.fn(() => res)
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('getAllPlanes', () => {
    it('should return all planes', async () => {
      const mockPlanes = [
        { id: 1, name: 'Boeing 737', category: 'Средний', seats_count: 180 },
        { id: 2, name: 'Airbus A320', category: 'Средний', seats_count: 164 }
      ];

      Plane.getAll.mockResolvedValue(mockPlanes);

      await planeController.getAllPlanes(req, res, next);

      expect(Plane.getAll).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockPlanes
      });
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      Plane.getAll.mockRejectedValue(error);

      await planeController.getAllPlanes(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getPlaneById', () => {
    it('should return plane by id', async () => {
      const mockPlane = { id: 1, name: 'Boeing 737', category: 'Средний', seats_count: 180 };
      req.params.id = '1';

      Plane.getById.mockResolvedValue(mockPlane);

      await planeController.getPlaneById(req, res, next);

      expect(Plane.getById).toHaveBeenCalledWith('1');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockPlane
      });
    });

    it('should return 404 for non-existent plane', async () => {
      req.params.id = '999';
      Plane.getById.mockResolvedValue(null);

      await planeController.getPlaneById(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Plane not found'
      });
    });
  });

  describe('createPlane', () => {
    it('should create new plane', async () => {
      const planeData = {
        name: 'Boeing 777',
        category: 'Дальний',
        seats_count: 350
      };

      req.body = planeData;
      const mockCreatedPlane = { id: 3, ...planeData };

      Plane.create.mockResolvedValue(mockCreatedPlane);

      await planeController.createPlane(req, res, next);

      expect(Plane.create).toHaveBeenCalledWith(planeData);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockCreatedPlane
      });
    });

    it('should validate required fields', async () => {
      req.body = { name: 'Test Plane' }; // Missing category and seats_count

      await planeController.createPlane(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Please provide all required fields'
      });
    });

    it('should validate seats count', async () => {
      req.body = {
        name: 'Test Plane',
        category: 'Средний',
        seats_count: -10
      };

      await planeController.createPlane(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Seats count must be greater than 0'
      });
    });
  });

  describe('updatePlane', () => {
    it('should update existing plane', async () => {
      const planeData = {
        name: 'Updated Plane',
        category: 'Дальний',
        seats_count: 400
      };

      req.params.id = '1';
      req.body = planeData;
      const mockUpdatedPlane = { id: 1, ...planeData };

      Plane.update.mockResolvedValue(mockUpdatedPlane);

      await planeController.updatePlane(req, res, next);

      expect(Plane.update).toHaveBeenCalledWith('1', planeData);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockUpdatedPlane
      });
    });

    it('should handle non-existent plane', async () => {
      req.params.id = '999';
      req.body = {
        name: 'Test Plane',
        category: 'Средний',
        seats_count: 200
      };

      Plane.update.mockRejectedValue(new Error('Plane not found'));

      await planeController.updatePlane(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Plane not found'
      });
    });
  });

  describe('deletePlane', () => {
    it('should delete plane', async () => {
      req.params.id = '1';
      Plane.delete.mockResolvedValue({ id: 1 });

      await planeController.deletePlane(req, res, next);

      expect(Plane.delete).toHaveBeenCalledWith('1');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Plane deleted successfully'
      });
    });

    it('should handle plane used in flights', async () => {
      req.params.id = '1';
      Plane.delete.mockRejectedValue(new Error('Cannot delete plane: It is used in existing flights'));

      await planeController.deletePlane(req, res, next);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Cannot delete plane: It is used in existing flights'
      });
    });
  });
});