import db from '../../../utils/db';
import RecruitmentApplication from '../../../models/RecruitmentApplication';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Check authentication
    const session = await getServerSession(req, res, authOptions);
    if (!session || session.user.role !== 'admin') {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { applicationId, status, notes } = req.body;

    // Validation
    if (!applicationId) {
      return res.status(400).json({ message: 'Application ID is required' });
    }

    const validStatuses = ['pending', 'reviewing', 'accepted', 'rejected'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    await db.connectDb();

    // Update application
    const application = await RecruitmentApplication.findByIdAndUpdate(
      applicationId,
      {
        status,
        ...(notes !== undefined && { notes })
      },
      { new: true }
    );

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    return res.status(200).json({
      success: true,
      data: application,
      message: 'Trạng thái đã được cập nhật thành công'
    });
  } catch (error) {
    console.error('Error updating application status:', error);
    return res.status(500).json({
      message: error.message || 'Đã xảy ra lỗi khi cập nhật trạng thái.',
    });
  }
}
