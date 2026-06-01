import { Request, Response } from 'express';
import path from 'path';
import Student from '../models/Student';
import { deleteUploadedFile } from '../utils/uploadPath';

export const getStudents = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, status, level, institution, gender, page = 1, limit = 15 } = req.query;
    const query: Record<string, unknown> = {};

    if (status) query.status = status;
    if (level) query.level = level;
    if (institution) query.institution = institution;
    if (gender) query.gender = gender;
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { registrationNumber: { $regex: search, $options: 'i' } },
        { nationalId: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [students, total] = await Promise.all([
      Student.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Student.countDocuments(query),
    ]);

    res.json({ students, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get students', error });
  }
};

export const getStudentById = async (req: Request, res: Response): Promise<void> => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) { res.status(404).json({ message: 'Student not found' }); return; }
    res.json({ student });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get student', error });
  }
};

export const createStudent = async (req: Request, res: Response): Promise<void> => {
  try {
    const existing = await Student.findOne({
      $or: [
        { email: req.body.email },
        { registrationNumber: req.body.registrationNumber },
      ],
    });
    if (existing) {
      res.status(400).json({ message: 'A student with this email or registration number already exists' });
      return;
    }
    const student = await Student.create(req.body);
    res.status(201).json({ message: 'Student created successfully', student });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create student', error });
  }
};

export const updateStudent = async (req: Request, res: Response): Promise<void> => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!student) { res.status(404).json({ message: 'Student not found' }); return; }
    res.json({ message: 'Student updated successfully', student });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update student', error });
  }
};

export const deleteStudent = async (req: Request, res: Response): Promise<void> => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) { res.status(404).json({ message: 'Student not found' }); return; }
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete student', error });
  }
};

export const uploadStudentFiles = async (req: Request, res: Response): Promise<void> => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) { res.status(404).json({ message: 'Student not found' }); return; }

    const files = req.files as Express.Multer.File[] | undefined;
    if (!files || files.length === 0) {
      res.status(400).json({ message: 'No files uploaded' });
      return;
    }

    const category = req.body.category as 'nationalId' | 'passportPhoto' | 'diploma' | 'other' | undefined;
    const allowedCategories = ['nationalId', 'passportPhoto', 'diploma', 'other'] as const;
    const selectedCategory: 'nationalId' | 'passportPhoto' | 'diploma' | 'other' =
      allowedCategories.includes(category as any) ? category! : 'other';
    const baseUrl = `${req.protocol}://${req.get('host')}`;

    const names = Array.isArray(req.body.names)
      ? req.body.names
      : req.body.names
      ? [req.body.names]
      : [];

    const newDocuments = files.map((file, index) => {
      const isPdf = file.mimetype === 'application/pdf' || path.extname(file.originalname).toLowerCase() === '.pdf';
      const relativePath = isPdf ? `/uploads/documents/${file.filename}` : `/uploads/images/${file.filename}`;
      return {
        name: names[index] || file.originalname,
        url: `${baseUrl}${relativePath}`,
        category: selectedCategory,
        uploadedAt: new Date(),
      };
    });

    student.documents.push(...newDocuments);
    await student.save();

    res.json({ message: 'Files uploaded successfully', documents: newDocuments, student });
  } catch (error) {
    res.status(500).json({ message: 'Failed to upload student files', error });
  }
};

export const deleteStudentFile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fileUrl } = req.body as { fileUrl: string };
    const student = await Student.findById(req.params.id);
    if (!student) { res.status(404).json({ message: 'Student not found' }); return; }

    student.documents = student.documents.filter((doc) => doc.url !== fileUrl);
    await student.save();

    deleteUploadedFile(fileUrl);

    res.json({ message: 'File deleted successfully', student });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete file', error });
  }
};

export const renameStudentFile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fileUrl, name } = req.body as { fileUrl: string; name: string };
    const student = await Student.findById(req.params.id);
    if (!student) { res.status(404).json({ message: 'Student not found' }); return; }

    const document = student.documents.find((doc) => doc.url === fileUrl);
    if (!document) { res.status(404).json({ message: 'Document not found' }); return; }

    document.name = name;
    await student.save();

    res.json({ message: 'Document renamed successfully', student });
  } catch (error) {
    res.status(500).json({ message: 'Failed to rename document', error });
  }
};

export const toggleStudentStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) { res.status(404).json({ message: 'Student not found' }); return; }
    student.status = student.status === 'active' ? 'suspended' : 'active';
    await student.save();
    res.json({ message: `Student ${student.status}`, student });
  } catch (error) {
    res.status(500).json({ message: 'Failed to toggle student status', error });
  }
};

export const getStudentStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [total, active, pending, suspended, graduated] = await Promise.all([
      Student.countDocuments(),
      Student.countDocuments({ status: 'active' }),
      Student.countDocuments({ status: 'pending' }),
      Student.countDocuments({ status: 'suspended' }),
      Student.countDocuments({ status: 'graduated' }),
    ]);
    res.json({ total, active, pending, suspended, graduated });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get student stats', error });
  }
};
