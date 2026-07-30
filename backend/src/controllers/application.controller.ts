import { Request, Response } from 'express';
import StudentApplication from '../models/StudentApplication';
import { AuthRequest } from '../middleware/auth';

export const getApplications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { search, status, opportunityType, assistantId, page = 1, limit = 20 } = req.query;
    const query: Record<string, unknown> = {};
    
    if (status) query.status = status;
    if (opportunityType) query.opportunityType = opportunityType;
    if (assistantId) query.assignedAssistantId = assistantId;

    // If logged in user is an assistant, only show their tasks
    if (req.user?.role === 'assistant') {
      query.assignedAssistantId = req.user._id;
    }

    if (search) {
      query.$or = [
        { studentName: { $regex: search, $options: 'i' } },
        { studentEmail: { $regex: search, $options: 'i' } },
        { opportunityName: { $regex: search, $options: 'i' } },
      ];
    }
    const skip = (Number(page) - 1) * Number(limit);
    const [applications, total] = await Promise.all([
      StudentApplication.find(query)
        .populate('assignedAssistantId', 'name email')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
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
    const application = await StudentApplication.findById(req.params.id).populate('assignedAssistantId', 'name email');
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
    const { studentName, studentEmail, studentPhone, opportunityId, opportunityType, opportunityName, notes, assignedAssistantId } = req.body;
    const application = await StudentApplication.create({
      studentName,
      studentEmail,
      studentPhone,
      opportunityId,
      opportunityType,
      opportunityName,
      notes,
      assignedAssistantId,
      status: 'In Progress',
    });
    res.status(201).json({ message: 'Application assistance request submitted successfully', application });
  } catch (error: any) {
    console.error('Public Application Error:', error);
    res.status(500).json({
      message: 'Failed to submit application assistance request',
      error: error.message || 'Internal server error'
    });
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

export const resolveApplication = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { resolutionProof } = req.body;
    if (!resolutionProof) {
      res.status(400).json({ message: 'Resolution proof is required' });
      return;
    }

    const application = await StudentApplication.findById(req.params.id);
    if (!application) { res.status(404).json({ message: 'Application not found' }); return; }

    // Check if the user is authorized (Admin or the assigned assistant)
    if (req.user?.role !== 'admin' && application.assignedAssistantId?.toString() !== req.user?._id.toString()) {
      res.status(403).json({ message: 'You are not authorized to resolve this task' });
      return;
    }

    application.status = 'Resolved';
    application.resolutionProof = resolutionProof;
    application.updatedAt = new Date();
    await application.save();

    res.json({ message: 'Application task resolved successfully', application });
  } catch (error) {
    res.status(500).json({ message: 'Failed to resolve application', error });
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
