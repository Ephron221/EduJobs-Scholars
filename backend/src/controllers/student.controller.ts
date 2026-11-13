import { Request, Response } from 'express';
import path from 'path';
import Student from '../models/Student';
import { deleteUploadedFile } from '../utils/uploadPath';
import { getFileUrl } from '../utils/fileHelper';
import sendEmail from '../utils/sendEmail';

export const getStudents = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, status, level, institution, gender, page = 1, limit = 15 } = req.query;
    const query: Record<string, unknown> = {};

    if (status) {
      if (status === 'admitted') {
        query.status = { $in: ['admitted', 'Admitted'] };
      } else if (status === 'rejected') {
        query.status = { $in: ['rejected', 'Rejected'] };
      } else if (status === 'not_admitted') {
        query.status = { $in: ['not_admitted', 'Not Admitted / Not Accepted', 'not-admitted'] };
      } else {
        query.status = status;
      }
    }
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
      const url = getFileUrl(file, isPdf);
      return {
        name: names[index] || file.originalname,
        url: url || '',
        category: selectedCategory,
        uploadedAt: new Date(),
      };
    }).filter(doc => doc.url);

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
    const [total, admitted, active, pending, suspended, graduated, rejected, notAdmitted] = await Promise.all([
      Student.countDocuments(),
      Student.countDocuments({ status: { $in: ['admitted', 'Admitted'] } }),
      Student.countDocuments({ status: { $regex: '^active$', $options: 'i' } }),
      Student.countDocuments({ status: { $regex: '^pending$', $options: 'i' } }),
      Student.countDocuments({ status: { $regex: '^suspended$', $options: 'i' } }),
      Student.countDocuments({ status: { $regex: '^graduated$', $options: 'i' } }),
      Student.countDocuments({ status: { $in: ['rejected', 'Rejected'] } }),
      Student.countDocuments({ status: { $in: ['not_admitted', 'Not Admitted / Not Accepted', 'not-admitted'] } }),
    ]);
    res.json({ total, admitted, active, pending, suspended, graduated, rejected, notAdmitted });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get student stats', error });
  }
};

const resolveDecisionType = (rawDecision: string = ''): 'admitted' | 'conditional' | 'pending' | 'waitlisted' | 'rejected' | 'suspended' | 'graduated' => {
  const d = rawDecision.toLowerCase().trim();
  if (d.includes('reject') || d.includes('not admitted') || d.includes('declined') || d.includes('denied')) {
    return 'rejected';
  }
  if (d.includes('suspend')) {
    return 'suspended';
  }
  if (d.includes('graduate')) {
    return 'graduated';
  }
  if (d.includes('conditional')) {
    return 'conditional';
  }
  if (d.includes('waitlist')) {
    return 'waitlisted';
  }
  if (d.includes('review') || d.includes('pending')) {
    return 'pending';
  }
  if (d.includes('admit') || d.includes('accept') || d.includes('approved') || d.includes('active')) {
    return 'admitted';
  }
  return 'admitted';
};

export const sendStudentDecision = async (req: Request, res: Response): Promise<void> => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      res.status(404).json({ message: 'Student record not found' });
      return;
    }

    const {
      fullName,
      institution,
      registrationNumber,
      trackingCode,
      email,
      phoneNumber,
      nationalId,
      admissionDecision = 'Admitted',
      status,
      remarks = '',
      level,
      channel = 'email',
    } = req.body;

    const recipientEmail = (email || student.email || '').trim();
    if (channel !== 'whatsapp' && !recipientEmail) {
      res.status(400).json({ message: 'Valid applicant email is required to send decision' });
      return;
    }

    // Persist any updated fields to the student record
    if (institution) student.institution = institution.trim();
    if (registrationNumber) student.registrationNumber = registrationNumber.trim();
    if (trackingCode) student.trackingCode = trackingCode.trim();
    if (phoneNumber) student.phoneNumber = phoneNumber.trim();
    if (nationalId) student.nationalId = nationalId.trim();
    if (level) student.level = level.trim();
    student.admissionDecision = admissionDecision;
    student.decisionRemarks = remarks;
    student.decisionSentAt = new Date();
    student.decisionSentBy = (req as any).user?.name || (req as any).user?.email || 'Admissions Directorate';

    const dType = resolveDecisionType(admissionDecision);

    // Synchronize student status appropriately
    const allowedStatuses = [
      'admitted',
      'active',
      'pending',
      'suspended',
      'graduated',
      'rejected',
      'not_admitted',
      'Not Admitted / Not Accepted',
      'Rejected',
      'Admitted',
    ];
    if (status && allowedStatuses.includes(status)) {
      student.status = status;
    } else {
      if (dType === 'admitted') student.status = 'admitted';
      else if (dType === 'conditional' || dType === 'pending' || dType === 'waitlisted') student.status = 'pending';
      else if (dType === 'rejected') student.status = 'not_admitted';
      else if (dType === 'suspended') student.status = 'suspended';
      else if (dType === 'graduated') student.status = 'graduated';
    }

    await student.save();

    if (channel === 'whatsapp') {
      res.json({
        message: `Applicant credentials and admission decision updated for WhatsApp dispatch to ${phoneNumber || student.phoneNumber || 'student'}`,
        student,
      });
      return;
    }

    const displayFullName = fullName || `${student.firstName} ${student.lastName}`;
    const displayInstitution = institution || student.institution || 'University';
    // Clean institution name for spam-free subject lines and email headers (e.g. remove raw internal IDs like "(PUR-2026-D6D0152B)")
    const cleanInstitution = displayInstitution.replace(/\s*\([^)]*\d+[^)]*\)/g, '').trim() || displayInstitution;
    const displayRegNo = registrationNumber || student.registrationNumber || 'Pending University Issue';
    const displayTrackingPin = trackingCode || student.trackingCode || (student as any).password || 'N/A';
    const displayPhone = phoneNumber || student.phoneNumber || 'Not provided';
    const displayNationalId = nationalId || student.nationalId || 'Not provided';
    const displayLevel = level || student.level || 'Level 1';
    const displayStatus =
      student.status === 'not_admitted' || student.status === 'Not Admitted / Not Accepted'
        ? 'NOT ADMITTED / NOT ACCEPTED'
        : (student.status || 'active').toUpperCase();
    const senderName = student.decisionSentBy;

    // Build context-specific decision banner & email styling
    let decisionHeading = 'Official Admission Decision';
    let decisionTitle = 'Admitted / Accepted';
    let decisionColor = '#15803d';
    let decisionBg = '#f0fdf4';
    let decisionBorder = '#86efac';
    let introText = `We are pleased to officially congratulate you on your admission to <strong>${cleanInstitution}</strong> through the EduJobs Scholars Directorate.`;
    let subject = `Official Admission Decision: ${cleanInstitution} - ${displayFullName}`;

    if (dType === 'rejected') {
      decisionHeading = 'Application Decision Notice';
      decisionTitle = 'Not Admitted / Rejected';
      decisionColor = '#b91c1c';
      decisionBg = '#fef2f2';
      decisionBorder = '#fca5a5';
      introText = `Thank you for your interest and application to <strong>${cleanInstitution}</strong>. Following a comprehensive review of this cycle's applicants, we are writing to communicate the official outcome of your application.`;
      subject = `Official Application Decision: ${cleanInstitution} - ${displayFullName}`;
    } else if (dType === 'suspended') {
      decisionHeading = 'Student Status Notice';
      decisionTitle = 'Student Suspended';
      decisionColor = '#b91c1c';
      decisionBg = '#fef2f2';
      decisionBorder = '#fca5a5';
      introText = `We are writing to officially communicate an important update regarding your student enrollment status at <strong>${cleanInstitution}</strong>.`;
      subject = `Official Student Status Notice: ${cleanInstitution} - ${displayFullName}`;
    } else if (dType === 'graduated') {
      decisionHeading = 'Graduation & Degree Certification';
      decisionTitle = 'Graduated / Alumnus';
      decisionColor = '#6b21a8';
      decisionBg = '#faf5ff';
      decisionBorder = '#d8b4fe';
      introText = `We are proud to celebrate your academic achievement and officially certify your graduation from <strong>${cleanInstitution}</strong>.`;
      subject = `Official Graduation Certification: ${cleanInstitution} - ${displayFullName}`;
    } else if (dType === 'conditional') {
      decisionHeading = 'Conditional Admission Offer';
      decisionTitle = 'Conditional Offer';
      decisionColor = '#b45309';
      decisionBg = '#fffbeb';
      decisionBorder = '#fde68a';
      introText = `We are pleased to communicate your Conditional Admission Offer for <strong>${cleanInstitution}</strong> through EduJobs Scholars.`;
      subject = `Conditional Admission Offer: ${cleanInstitution} - ${displayFullName}`;
    } else if (dType === 'waitlisted') {
      decisionHeading = 'Admissions Waitlist Notification';
      decisionTitle = 'Waitlisted (Next Intake)';
      decisionColor = '#1d4ed8';
      decisionBg = '#eff6ff';
      decisionBorder = '#bfdbfe';
      introText = `We are writing to inform you that your application for admission to <strong>${cleanInstitution}</strong> has been placed on the official admissions waitlist.`;
      subject = `Admissions Waitlist Notification: ${cleanInstitution} - ${displayFullName}`;
    } else if (dType === 'pending') {
      decisionHeading = 'Application Review Notice';
      decisionTitle = 'Under Review / Pending';
      decisionColor = '#0369a1';
      decisionBg = '#f0f9ff';
      decisionBorder = '#bae6fd';
      introText = `We are writing to confirm that your application for admission to <strong>${cleanInstitution}</strong> is currently under active evaluation by the academic admissions committee.`;
      subject = `Application Status Update: ${cleanInstitution} - ${displayFullName}`;
    }

    // Build status-specific appreciation / encouragement from Mr. Esron (Application Assistant)
    let assistantTag = 'Special Appreciation • EduJobs Scholars';
    let assistantTitle = 'A Personal Congratulations & Thank You from Mr. Esron (Application Assistant)';
    let assistantMessage = `Dear <strong>${displayFullName}</strong>, congratulations on your official admission offer to <strong>${cleanInstitution}</strong>! Thank you so much for putting your trust and belief in me, <strong>Mr. Esron (Application Assistant)</strong>, to handle and guide your academic application journey with <strong>EduJobs Scholars</strong>. It has been a true honor working on your behalf toward this milestone, and I celebrate your admission success! Step forward with confidence and achieve great things in your studies!`;
    let assistantAdvice = `Keep your University Registration Number and Tracking PIN safe. Present them at the campus admissions desk or during online registration and loan application.`;
    let assistantBg = '#f0fdfa';
    let assistantBorder = '#2dd4bf';
    let assistantColor = '#0d9488';
    let assistantHeadingColor = '#134e4a';
    let assistantTextColor = '#115e59';

    if (dType === 'rejected') {
      assistantTag = 'Heartfelt Encouragement • EduJobs Scholars';
      assistantTitle = 'A Word of Heartfelt Encouragement from Mr. Esron (Application Assistant)';
      assistantMessage = `Dear <strong>${displayFullName}</strong>, thank you sincerely for placing your trust and belief in me, <strong>Mr. Esron (Application Assistant)</strong>, to prepare and advocate for your application through <strong>EduJobs Scholars</strong>. While this specific university intake did not result in an offer from ${cleanInstitution}, please never give up on your academic dreams! Every challenge is a stepping stone toward a greater breakthrough. EduJobs Scholars and I remain fully committed by your side to explore new university intakes, open scholarship opportunities, and alternative academic pathways for you. Your bright future is still ahead, and we will find the right open door together!`;
      assistantAdvice = `Don't be discouraged! EduJobs Scholars is actively processing applications for upcoming intakes, partner polytechnics, and scholarship programs. Contact Mr. Esron or reply directly to this email to apply for other open universities.`;
      assistantBg = '#fffbeb';
      assistantBorder = '#fcd34d';
      assistantColor = '#d97706';
      assistantHeadingColor = '#92400e';
      assistantTextColor = '#78350f';
    } else if (dType === 'conditional') {
      assistantTag = 'Conditional Milestone • EduJobs Scholars';
      assistantTitle = 'Next Steps & Appreciation from Mr. Esron (Application Assistant)';
      assistantMessage = `Dear <strong>${displayFullName}</strong>, congratulations on securing your Conditional Admission Offer for <strong>${cleanInstitution}</strong>! Thank you for placing your trust and belief in me, <strong>Mr. Esron (Application Assistant)</strong>, to navigate your application with <strong>EduJobs Scholars</strong>. You are almost at the finish line—please fulfill the specified requirements or submit outstanding documents promptly, and I will be right here with you to finalize your full enrollment!`;
      assistantAdvice = `Review the conditional remarks carefully and upload or submit the requested verification documents to secure your unconditional admission offer.`;
      assistantBg = '#fefce8';
      assistantBorder = '#fde047';
      assistantColor = '#ca8a04';
      assistantHeadingColor = '#854d0e';
      assistantTextColor = '#713f12';
    } else if (dType === 'waitlisted') {
      assistantTag = 'Admissions Waitlist Update • EduJobs Scholars';
      assistantTitle = 'Keep Hope Alive — Message from Mr. Esron (Application Assistant)';
      assistantMessage = `Dear <strong>${displayFullName}</strong>, thank you for placing your trust and belief in me, <strong>Mr. Esron (Application Assistant)</strong>, throughout your EduJobs Scholars application. Being placed on the official waitlist for ${cleanInstitution} is proof of your strong academic merit. Keep hope alive! Admissions lists update regularly as seats open, and I am continuously monitoring your status while keeping open backup opportunities ready for you!`;
      assistantAdvice = `Stay reachable on phone and email. As university slots open during orientation and registration, waitlisted applicants are prioritized for confirmation.`;
      assistantBg = '#eff6ff';
      assistantBorder = '#93c5fd';
      assistantColor = '#2563eb';
      assistantHeadingColor = '#1e40af';
      assistantTextColor = '#1e3a8a';
    } else if (dType === 'pending') {
      assistantTag = 'Review In Progress • EduJobs Scholars';
      assistantTitle = 'Application Progress Update from Mr. Esron (Application Assistant)';
      assistantMessage = `Dear <strong>${displayFullName}</strong>, thank you for placing your trust and belief in me, <strong>Mr. Esron (Application Assistant)</strong>, to manage your application with EduJobs Scholars. Your file is actively under thorough evaluation by the admissions committee for ${cleanInstitution}. I am following up closely on your file every step of the way, so stay optimistic while we await the final official decision!`;
      assistantAdvice = `Ensure all your contact details and academic certificates are up to date. We will notify you immediately once the admissions board concludes review.`;
      assistantBg = '#f0f9ff';
      assistantBorder = '#7dd3fc';
      assistantColor = '#0284c7';
      assistantHeadingColor = '#0369a1';
      assistantTextColor = '#075985';
    } else if (dType === 'suspended') {
      assistantTag = 'Academic Support Notice • EduJobs Scholars';
      assistantTitle = 'Important Support Note from Mr. Esron (Application Assistant)';
      assistantMessage = `Dear <strong>${displayFullName}</strong>, thank you for working with EduJobs Scholars. Regarding your current status update at ${cleanInstitution}, please remember that academic setbacks can be addressed through proper institutional procedures. I, <strong>Mr. Esron (Application Assistant)</strong>, along with EduJobs Scholars, stand ready to help guide you through the review, appeal, or reinstatement process.`;
      assistantAdvice = `Contact the admissions and guidance office immediately to discuss remedies, clearance, or academic appeals.`;
      assistantBg = '#fff1f2';
      assistantBorder = '#fda4af';
      assistantColor = '#e11d48';
      assistantHeadingColor = '#9f1239';
      assistantTextColor = '#881337';
    } else if (dType === 'graduated') {
      assistantTag = 'Alumni Achievement • EduJobs Scholars';
      assistantTitle = 'Graduation Honors & Celebration from Mr. Esron (Application Assistant)';
      assistantMessage = `Dear <strong>${displayFullName}</strong>, what an incredible academic milestone! Huge congratulations on officially graduating from <strong>${cleanInstitution}</strong>! Thank you for allowing me, <strong>Mr. Esron (Application Assistant)</strong>, and EduJobs Scholars to be part of your educational journey. Wishing you abundant career breakthroughs, impactful leadership, and endless opportunities ahead!`;
      assistantAdvice = `Visit the EduJobs Scholars Jobs portal to explore graduate jobs, internships, and professional career placement programs.`;
      assistantBg = '#faf5ff';
      assistantBorder = '#d8b4fe';
      assistantColor = '#9333ea';
      assistantHeadingColor = '#6b21a8';
      assistantTextColor = '#581c87';
    }

    // High Deliverability, Anti-Spam Clean Institutional HTML Email Template
    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${decisionHeading}: ${cleanInstitution}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f1f5f9; padding: 24px 12px;">
        <tr>
          <td align="center">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0;">
              
              <!-- Clean Navy Institutional Header -->
              <tr>
                <td style="background-color: #0f2744; padding: 28px 24px; text-align: center; color: #ffffff;">
                  <div style="display: inline-block; background-color: rgba(255, 255, 255, 0.15); border: 1px solid rgba(255, 255, 255, 0.25); border-radius: 20px; padding: 4px 14px; margin-bottom: 10px;">
                    <span style="font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #38bdf8;">Admissions Directorate</span>
                  </div>
                  <h1 style="margin: 0; font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: -0.01em;">EduJobs Scholars</h1>
                  <p style="margin: 4px 0 0 0; font-size: 14px; color: #cbd5e1;">${decisionHeading}</p>
                  <p style="margin: 6px 0 0 0; font-size: 14px; color: #7dd3fc; font-weight: 600;">Partner Institution: ${cleanInstitution}</p>
                </td>
              </tr>

              <!-- Admission Decision Banner -->
              <tr>
                <td style="padding: 20px 24px 8px 24px;">
                  <div style="background-color: ${decisionBg}; border: 1.5px solid ${decisionBorder}; border-radius: 10px; padding: 16px 20px; text-align: center;">
                    <span style="font-size: 11px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; color: ${decisionColor}; display: block; margin-bottom: 4px;">
                      ${decisionHeading}
                    </span>
                    <span style="font-size: 20px; font-weight: 800; color: ${decisionColor}; display: block;">
                      ${decisionTitle}
                    </span>
                  </div>
                </td>
              </tr>

              <!-- Greeting & Official Statement -->
              <tr>
                <td style="padding: 12px 24px 16px 24px; line-height: 1.6; color: #334155; font-size: 14px;">
                  <p style="margin: 0 0 10px 0;">Dear <strong>${displayFullName}</strong>,</p>
                  <p style="margin: 0;">
                    ${introText}
                  </p>
                </td>
              </tr>

              <!-- Interactive Appreciation / Encouragement Note from Mr. Esron Application Assistant -->
              <tr>
                <td style="padding: 0 24px 18px 24px;">
                  <div style="background-color: ${assistantBg}; border: 1.5px solid ${assistantBorder}; border-radius: 10px; padding: 16px 18px;">
                    <div style="font-size: 11px; font-weight: 800; color: ${assistantColor}; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 3px;">
                      ${assistantTag}
                    </div>
                    <div style="font-size: 15px; font-weight: 800; color: ${assistantHeadingColor}; margin-bottom: 6px;">
                      ${assistantTitle}
                    </div>
                    <div style="font-size: 13.5px; color: ${assistantTextColor}; line-height: 1.6; margin-bottom: 8px;">
                      ${assistantMessage}
                    </div>
                    <div style="font-size: 12px; color: ${assistantHeadingColor}; font-weight: 600; padding-top: 8px; border-top: 1px dashed ${assistantBorder};">
                      <strong>Recommended Next Step:</strong> ${assistantAdvice}
                    </div>
                  </div>
                </td>
              </tr>

              <!-- Official Applicant Credentials Summary Table -->
              <tr>
                <td style="padding: 0 24px 20px 24px;">
                  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 10px; overflow: hidden; border-collapse: collapse;">
                    
                    <tr>
                      <td colspan="2" style="background-color: #1e293b; color: #ffffff; padding: 11px 16px; font-size: 12px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase;">
                        Applicant Credentials &amp; University Record
                      </td>
                    </tr>

                    <tr>
                      <td style="padding: 11px 16px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #64748b; width: 44%; font-weight: 600;">Full Name:</td>
                      <td style="padding: 11px 16px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #0f172a; font-weight: 700;">${displayFullName}</td>
                    </tr>

                    <tr>
                      <td style="padding: 11px 16px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #64748b; font-weight: 600;">University / Institution:</td>
                      <td style="padding: 11px 16px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #0369a1; font-weight: 700;">${cleanInstitution}</td>
                    </tr>

                    <tr>
                      <td style="padding: 11px 16px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #64748b; font-weight: 600;">Decision Status:</td>
                      <td style="padding: 11px 16px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: ${decisionColor}; font-weight: 800;">${decisionTitle}</td>
                    </tr>

                    <tr>
                      <td style="padding: 11px 16px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #64748b; font-weight: 600;">Student Record Status:</td>
                      <td style="padding: 11px 16px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #0f172a; font-weight: 700;">${displayStatus}</td>
                    </tr>

                    <!-- University Reg Number -->
                    <tr style="background-color: #f0fdf4;">
                      <td style="padding: 11px 16px; border-bottom: 1px solid #bbf7d0; font-size: 13px; color: #166534; font-weight: 700;">University Reg Number:</td>
                      <td style="padding: 11px 16px; border-bottom: 1px solid #bbf7d0; font-size: 15px; font-family: 'Courier New', Courier, monospace; color: #15803d; font-weight: 800;">
                        ${displayRegNo}
                      </td>
                    </tr>

                    <!-- Highlighted Security PIN / Tracking Code -->
                    <tr style="background-color: #f0f9ff;">
                      <td style="padding: 11px 16px; border-bottom: 1px solid #bae6fd; font-size: 13px; color: #0369a1; font-weight: 700;">Tracking Code / PIN:</td>
                      <td style="padding: 11px 16px; border-bottom: 1px solid #bae6fd; font-size: 15px; font-family: 'Courier New', Courier, monospace; color: #0284c7; font-weight: 800;">
                        ${displayTrackingPin}
                      </td>
                    </tr>

                    <tr>
                      <td style="padding: 11px 16px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #64748b; font-weight: 600;">National ID / Passport:</td>
                      <td style="padding: 11px 16px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #0f172a; font-weight: 600;">${displayNationalId}</td>
                    </tr>

                    <tr>
                      <td style="padding: 11px 16px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #64748b; font-weight: 600;">Registered Email:</td>
                      <td style="padding: 11px 16px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #0f172a; font-weight: 600;">${recipientEmail}</td>
                    </tr>

                    <tr>
                      <td style="padding: 11px 16px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #64748b; font-weight: 600;">Contact Phone:</td>
                      <td style="padding: 11px 16px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #0f172a; font-weight: 600;">${displayPhone}</td>
                    </tr>

                    <tr>
                      <td style="padding: 11px 16px; font-size: 13px; color: #64748b; font-weight: 600;">Academic Level:</td>
                      <td style="padding: 11px 16px; font-size: 13px; color: #0f172a; font-weight: 600;">${displayLevel}</td>
                    </tr>

                  </table>
                </td>
              </tr>

              <!-- Admissions Office Remarks / Next Steps (if provided) -->
              ${remarks ? `
              <tr>
                <td style="padding: 0 24px 20px 24px;">
                  <div style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 14px 18px;">
                    <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: #92400e; margin-bottom: 4px;">
                      Instructions &amp; Next Steps:
                    </div>
                    <div style="font-size: 13px; color: #78350f; line-height: 1.5; white-space: pre-line;">
                      ${remarks}
                    </div>
                  </div>
                </td>
              </tr>
              ` : ''}

              <!-- Portal Access Button -->
              <tr>
                <td align="center" style="padding: 4px 24px 24px 24px;">
                  <a href="${process.env.FRONTEND_URL || 'https://edujobsscholars.vercel.app'}/login" style="display: inline-block; background-color: #0284c7; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-size: 14px; font-weight: 700;">
                    Log In to Download Official PDF Card
                  </a>
                </td>
              </tr>

              <!-- Instructions & Disclaimer -->
              <tr>
                <td style="padding: 16px 24px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; line-height: 1.5;">
                  <p style="margin: 0 0 6px 0;"><strong style="color: #334155;">Verification Notice:</strong> Please present your Registration Number (${displayRegNo}) and Tracking PIN when reporting to ${cleanInstitution}.</p>
                  <p style="margin: 0;">Dispatched on behalf of: <strong>${senderName}</strong> &bull; EduJobs Scholars Admissions &amp; Records.</p>
                </td>
              </tr>

              <!-- Anti-Spam Compliance Footer -->
              <tr>
                <td style="background-color: #ffffff; padding: 16px 24px; border-top: 1px solid #f1f5f9; text-align: center; font-size: 11px; color: #94a3b8; line-height: 1.5;">
                  You received this transactional service email because your address (${recipientEmail}) was registered for an application on EduJobs Scholars.<br>
                  EduJobs Scholars &bull; Academic Admissions &amp; Records Directorate &bull; Kigali, Rwanda<br>
                  Have questions? Simply reply directly to this email or visit <a href="https://edujobsscholars.vercel.app" style="color: #0284c7; text-decoration: underline;">edujobsscholars.vercel.app</a>.
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
    `;

    // Matched plain text alternative for high spam-filter deliverability
    const plainTextMessage = `Dear ${displayFullName},\n\n${introText.replace(/<[^>]+>/g, '')}\n\n${assistantTitle.toUpperCase()}:\n"${assistantMessage.replace(/<[^>]+>/g, '')}"\nRecommended Next Step: ${assistantAdvice}\n\nDECISION STATUS: ${decisionTitle.toUpperCase()}\nSTUDENT RECORD STATUS: ${displayStatus}\n\nAPPLICANT CREDENTIALS:\n- Full Name: ${displayFullName}\n- University / Institution: ${cleanInstitution}\n- University Reg Number: ${displayRegNo}\n- Tracking Code / PIN: ${displayTrackingPin}\n- National ID / Passport: ${displayNationalId}\n- Academic Level: ${displayLevel}\n- Contact Phone: ${displayPhone}\n- Registered Email: ${recipientEmail}\n\n${remarks ? `INSTRUCTIONS & NEXT STEPS:\n${remarks}\n\n` : ''}Access the EduJobs Scholars student portal to view credentials & download official PDF card: ${process.env.FRONTEND_URL || 'https://edujobsscholars.vercel.app'}/login\n\nPlease present your Registration Number (${displayRegNo}) and Tracking PIN when reporting to ${cleanInstitution}.\n\nDispatched on behalf of: Mr. Esron (Application Assistant) & ${senderName}\nEduJobs Scholars Admissions & Records Directorate, Kigali, Rwanda\nIf you have questions, please reply directly to this email.`;

    await sendEmail({
      email: recipientEmail,
      subject,
      message: plainTextMessage,
      html,
    });

    res.json({
      message:
        channel === 'both'
          ? `Decision dispatched to ${recipientEmail} and student record prepared for WhatsApp`
          : `Applicant information & admission decision sent successfully to ${recipientEmail}`,
      student,
    });
  } catch (error: any) {
    console.error('Error sending admission decision:', error);
    res.status(500).json({
      message: 'Failed to send admission decision email',
      error: error.message || error,
    });
  }
};
