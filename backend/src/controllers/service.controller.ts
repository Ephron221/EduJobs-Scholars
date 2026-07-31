import { Request, Response } from 'express';
import Service from '../models/Service';
import { AuthRequest } from '../middleware/auth';

export const getServices = async (_req: Request, res: Response): Promise<void> => {
  try {
    const services = await Service.find().sort({ order: 1 });
    res.json({ services });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get services', error });
  }
};

export const createService = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const service = await Service.create(req.body);
    res.status(201).json({ message: 'Service created successfully', service });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create service', error });
  }
};

export const updateService = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const service = await Service.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    if (!service) {
      res.status(404).json({ message: 'Service not found' });
      return;
    }
    res.json({ message: 'Service updated successfully', service });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update service', error });
  }
};

export const deleteService = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) {
      res.status(404).json({ message: 'Service not found' });
      return;
    }
    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete service', error });
  }
};
