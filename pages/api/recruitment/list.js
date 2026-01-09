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

    // Get query parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const statusFilter = req.query.status || '';
    const jobTitleFilter = req.query.jobTitle || '';

    // Build query
    const query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { jobTitle: { $regex: search, $options: 'i' } }
      ];
    }

    if (statusFilter) {
      query.status = statusFilter;
    }

    if (jobTitleFilter) {
      query.jobTitle = { $regex: jobTitleFilter, $options: 'i' };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    const total = await RecruitmentApplication.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    // Fetch applications
    const applications = await RecruitmentApplication.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return res.status(200).json({
      success: true,
      data: applications,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    });
  } catch (error) {
    console.error('Error fetching recruitment applications:', error);
    return res.status(500).json({
      message: error.message || 'Đã xảy ra lỗi khi lấy danh sách ứng viên.',
    });
  }
}
