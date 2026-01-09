import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import { sendEmail } from '../../../utils/sendEmails';
import db from '../../../utils/db';
import RecruitmentApplication from '../../../models/RecruitmentApplication';

// Disable default body parser to handle file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

// Email template for recruitment application
const recruitmentEmailTemplate = (data) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background-color: #009934;
          color: white;
          padding: 20px;
          text-align: center;
          border-radius: 5px 5px 0 0;
        }
        .content {
          background-color: #f9f9f9;
          padding: 30px;
          border-radius: 0 0 5px 5px;
        }
        .info-box {
          background-color: white;
          border-left: 4px solid #009934;
          padding: 15px;
          margin: 15px 0;
        }
        .info-row {
          margin: 10px 0;
        }
        .info-label {
          font-weight: bold;
          color: #009934;
        }
        .footer {
          margin-top: 20px;
          font-size: 12px;
          color: #666;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Hồ sơ ứng tuyển mới</h1>
        </div>
        <div class="content">
          <p>Xin chào,</p>
          <p>Có một hồ sơ ứng tuyển mới từ website Eco Bắc Giang:</p>
          <div class="info-box">
            <div class="info-row">
              <span class="info-label">Vị trí ứng tuyển:</span> ${data.jobTitle || 'N/A'}
            </div>
            <div class="info-row">
              <span class="info-label">Họ và tên:</span> ${data.name}
            </div>
            <div class="info-row">
              <span class="info-label">Email:</span> ${data.email}
            </div>
            <div class="info-row">
              <span class="info-label">Số điện thoại:</span> ${data.phone}
            </div>
            ${data.introduction ? `
            <div class="info-row">
              <span class="info-label">Giới thiệu:</span><br>
              ${data.introduction.replace(/\n/g, '<br>')}
            </div>
            ` : ''}
            ${data.cvFileName ? `
            <div class="info-row">
              <span class="info-label">CV/Portfolio:</span> ${data.cvFileName}
            </div>
            ` : ''}
          </div>
          <p>Vui lòng kiểm tra và liên hệ với ứng viên sớm nhất có thể.</p>
          <div class="footer">
            <p>Trân trọng,<br>Hệ thống EcoBacGiang</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Parse form data with formidable
const parseForm = (req) => {
  return new Promise((resolve, reject) => {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'recruitment');
    
    // Create upload directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const form = formidable({
      uploadDir: uploadDir,
      keepExtensions: true,
      maxFileSize: 5 * 1024 * 1024, // 5MB
      multiples: false,
    });

    form.parse(req, (err, fields, files) => {
      if (err) {
        reject(err);
        return;
      }
      resolve({ fields, files });
    });
  });
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Parse form data
    const { fields, files } = await parseForm(req);

    // Extract form fields - handle both array and string formats from formidable
    const name = (Array.isArray(fields.name) ? fields.name[0] : fields.name)?.trim() || '';
    const phone = (Array.isArray(fields.phone) ? fields.phone[0] : fields.phone)?.trim() || '';
    const email = (Array.isArray(fields.email) ? fields.email[0] : fields.email)?.trim() || '';
    const introduction = (Array.isArray(fields.introduction) ? fields.introduction[0] : fields.introduction)?.trim() || '';
    const jobTitle = (Array.isArray(fields.jobTitle) ? fields.jobTitle[0] : fields.jobTitle)?.trim() || '';
    const jobId = (Array.isArray(fields.jobId) ? fields.jobId[0] : fields.jobId)?.trim() || '';

    // Validation
    if (!name || !phone || !email) {
      return res.status(400).json({
        message: 'Vui lòng điền đầy đủ thông tin bắt buộc (Họ tên, Số điện thoại, Email).',
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: 'Địa chỉ email không hợp lệ.',
      });
    }

    // Handle file upload
    let cvFileName = null;
    let cvFilePath = null;

    if (files.cvFile) {
      const file = Array.isArray(files.cvFile) ? files.cvFile[0] : files.cvFile;
      
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.mimetype)) {
        // Delete uploaded file if invalid
        if (fs.existsSync(file.filepath)) {
          fs.unlinkSync(file.filepath);
        }
        return res.status(400).json({
          message: 'Chỉ chấp nhận file PDF hoặc DOCX.',
        });
      }

      // Generate unique filename
      const fileExt = path.extname(file.originalFilename || 'file');
      const uniqueFileName = `CV_${Date.now()}_${name.replace(/\s+/g, '_')}${fileExt}`;
      const newFilePath = path.join(path.dirname(file.filepath), uniqueFileName);

      // Rename file
      fs.renameSync(file.filepath, newFilePath);
      cvFileName = uniqueFileName;
      // Store relative path from public folder for easy access
      cvFilePath = `/uploads/recruitment/${uniqueFileName}`;
    }

    // Save to database
    await db.connectDb();
    const application = new RecruitmentApplication({
      name,
      phone,
      email,
      introduction,
      jobTitle,
      jobId,
      cvFileName,
      cvFilePath,
      status: 'pending'
    });
    await application.save();

    // Prepare email data
    const emailData = {
      name,
      phone,
      email,
      introduction,
      jobTitle,
      jobId,
      cvFileName,
    };

    // Send notification email to HR/admin
    try {
      const adminEmail = process.env.ADMIN_EMAIL || process.env.SENDER_EMAIL_ADDRESS || 'tuyendung@ecobacgiang.vn';
      await sendEmail(
        adminEmail,
        '',
        '',
        `Hồ sơ ứng tuyển mới - ${jobTitle || 'Vị trí chung'}`,
        recruitmentEmailTemplate(emailData)
      );

      // If CV file exists, attach it to email (optional - can be implemented later)
      // For now, we just save the file and notify admin
    } catch (emailError) {
      console.error('Error sending recruitment email:', emailError);
      // Don't fail the request if email fails, but log it
    }

    // Send confirmation email to applicant
    try {
      const confirmationTemplate = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background-color: #009934;
              color: white;
              padding: 20px;
              text-align: center;
              border-radius: 5px 5px 0 0;
            }
            .content {
              background-color: #f9f9f9;
              padding: 30px;
              border-radius: 0 0 5px 5px;
            }
            .footer {
              margin-top: 20px;
              font-size: 12px;
              color: #666;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Cảm ơn bạn đã ứng tuyển!</h1>
            </div>
            <div class="content">
              <p>Xin chào ${name},</p>
              <p>Cảm ơn bạn đã quan tâm và gửi hồ sơ ứng tuyển cho vị trí <strong>${jobTitle || 'tại Eco Bắc Giang'}</strong>.</p>
              <p>Chúng tôi đã nhận được hồ sơ của bạn và sẽ xem xét trong thời gian sớm nhất. Nếu hồ sơ của bạn phù hợp, chúng tôi sẽ liên hệ với bạn qua email hoặc số điện thoại bạn đã cung cấp.</p>
              <p>Trong thời gian chờ đợi, bạn có thể tìm hiểu thêm về Eco Bắc Giang tại website của chúng tôi.</p>
              <div class="footer">
                <p>Trân trọng,<br>Đội ngũ Tuyển dụng - EcoBacGiang</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;

      await sendEmail(
        email,
        '',
        '',
        'Cảm ơn bạn đã ứng tuyển - Eco Bắc Giang',
        confirmationTemplate
      );
    } catch (emailError) {
      console.error('Error sending confirmation email:', emailError);
      // Don't fail the request if confirmation email fails
    }

    return res.status(200).json({
      success: true,
      message: 'Gửi hồ sơ ứng tuyển thành công! Chúng tôi sẽ liên hệ với bạn sớm nhất.',
    });
  } catch (error) {
    console.error('Recruitment apply error:', error);
    return res.status(500).json({
      message: error.message || 'Đã xảy ra lỗi khi xử lý hồ sơ ứng tuyển. Vui lòng thử lại sau.',
    });
  }
}

