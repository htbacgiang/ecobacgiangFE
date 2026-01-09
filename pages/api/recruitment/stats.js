import db from '../../../utils/db';
import RecruitmentApplication from '../../../models/RecruitmentApplication';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Check authentication
    const session = await getServerSession(req, res, authOptions);
    if (!session || session.user.role !== 'admin') {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    await db.connectDb();

    const stats = {
      total: await RecruitmentApplication.countDocuments(),
      pending: await RecruitmentApplication.countDocuments({ status: 'pending' }),
      reviewing: await RecruitmentApplication.countDocuments({ status: 'reviewing' }),
      accepted: await RecruitmentApplication.countDocuments({ status: 'accepted' }),
      rejected: await RecruitmentApplication.countDocuments({ status: 'rejected' })
    };

    return res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching recruitment stats:', error);
    return res.status(500).json({
      message: error.message || 'Đã xảy ra lỗi khi lấy thống kê ứng viên.',
    });
  }
}
