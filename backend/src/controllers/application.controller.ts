import { Request, Response } from 'express';
import StudentApplication from '../models/StudentApplication';

export const getApplications = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, status, opportunityType, page = 1, limit = 20 } = req.query;
    const query: Record<string, unknown> = {};
    if (status) query.status = status;
    if (opportunityType) query.opportunityType = opportunityType;
    if (search) {
      query.$or = [
        { studentName: { $regex: search, $options: 'i' } },
        { studentEmail: { $regex: search, $options: 'i' } },
        { opportunityName: { $regex: search, $options: 'i' } },
      ];
    }
    const skip = (Number(page) - 1) * Number(limit);
    const [applications, total] = await Promise.all([
      StudentApplication.find(query).sort({ updatedAt: -1 }).skip(skip).limit(Number(limit)),
      StudentApplication.countDocuments(query),
    ]);
    res.json({ applications, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get applications', error });
  }
};

export const getApplicationsByStudent = async (req: Request, res: Response): Promise<void> => {
  try {
    const applications = await StudentApplication.find({
      $or: [{ studentId: req.params.studentId }, { studentEmail: req.params.studentId }]
    }).sort({ updatedAt: -1 });
    res.json({ applications });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get applications', error });
  }
};

export const getApplicationById = async (req: Request, res: Response): Promise<void> => {
  try {
    const application = await StudentApplication.findById(req.params.id);
    if (!application) { res.status(404).json({ message: 'Application not found' }); return; }
    res.json({ application });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get application', error });
  }
};

export const createApplication = async (req: Request, res: Response): Promise<void> => {
  try {
    const application = await StudentApplication.create(req.body);
    res.status(201).json({ message: 'Student record created successfully', application });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create application', error });
  }
};

export const createPublicApplication = async (req: Request, res: Response): Promise<void> => {
  try {
    const { studentName, studentEmail, studentPhone, opportunityId, opportunityType, opportunityName, notes } = req.body;
    const application = await StudentApplication.create({
      studentName,
      studentEmail,
      studentPhone,
      opportunityId,
      opportunityType,
      opportunityName,
      notes,
      status: 'Interested',
    });
    res.status(201).json({ message: 'Application assistance request submitted successfully', application });
  } catch (error) {
    res.status(500).json({ message: 'Failed to submit application assistance request', error });
  }
};

export const updateApplication = async (req: Request, res: Response): Promise<void> => {
  try {
    const application = await StudentApplication.findByIdAndUpdate(
      req.params.id, { ...req.body, updatedAt: new Date() }, { new: true, runValidators: true }
    );
    if (!application) { res.status(404).json({ message: 'Application not found' }); return; }
    res.json({ message: 'Application updated successfully', application });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update application', error });
  }
};

export const deleteApplication = async (req: Request, res: Response): Promise<void> => {
  try {
    const application = await StudentApplication.findByIdAndDelete(req.params.id);
    if (!application) { res.status(404).json({ message: 'Application not found' }); return; }
    res.json({ message: 'Application deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete application', error });
  }
};
