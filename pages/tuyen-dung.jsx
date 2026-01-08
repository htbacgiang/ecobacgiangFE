import { useState, useRef } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Briefcase, 
  MapPin, 
  Clock, 
  Users, 
  Leaf, 
  TrendingUp, 
  CheckCircle, 
  ChevronRight,
  Send,
  Upload,
  X
} from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Mock data cho danh sách công việc
const jobs = [
  {
    id: 1,
    title: 'Kỹ sư Nông nghiệp Công nghệ cao',
    department: 'Sản xuất',
    location: 'Yên Dũng, Bắc Giang',
    type: 'Toàn thời gian',
    salary: '12 - 18 triệu',
    description: 'Quản lý quy trình canh tác hữu cơ, theo dõi hệ thống cảm biến IoT và tối ưu năng suất cây trồng.',
  },
  {
    id: 2,
    title: 'Nhân viên Kế toán Nội bộ',
    department: 'Văn phòng',
    location: 'TP. Bắc Giang',
    type: 'Toàn thời gian',
    salary: '8 - 12 triệu',
    description: 'Quản lý thu chi, công nợ và vận hành module kế toán trên hệ thống Eco Platform.',
  },
  {
    id: 3,
    title: 'Chuyên viên Marketing & Nội dung',
    department: 'Sales & Marketing',
    location: 'Hybrid (Bắc Giang/Bắc Ninh)',
    type: 'Toàn thời gian',
    salary: '10 - 15 triệu',
    description: 'Xây dựng câu chuyện thương hiệu, quản lý Blog SEO và các chiến dịch quảng bá nông sản sạch.',
  },
  {
    id: 4,
    title: 'Nhân viên Vận hành Kho & Logistics',
    department: 'Vận hành',
    location: 'Thành phố Bắc Giang',
    type: 'Toàn thời gian',
    salary: '7 - 10 triệu',
    description: 'Quản lý xuất nhập tồn hàng hóa, đóng gói theo tiêu chuẩn Eco-friendly.',
  }
];

export default function TuyenDung() {
  const [selectedJob, setSelectedJob] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    introduction: '',
    cvFile: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filter, setFilter] = useState('all');
  const fileInputRef = useRef(null);

  const openApplyModal = (job) => {
    setSelectedJob(job);
    setIsModalOpen(true);
    setFormData({
      name: '',
      phone: '',
      email: '',
      introduction: '',
      cvFile: null,
    });
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedJob(null);
    setFormData({
      name: '',
      phone: '',
      email: '',
      introduction: '',
      cvFile: null,
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Chỉ chấp nhận file PDF hoặc DOCX');
        return;
      }
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File không được vượt quá 5MB');
        return;
      }
      setFormData((prev) => ({ ...prev, cvFile: file }));
    }
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Chỉ chấp nhận file PDF hoặc DOCX');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File không được vượt quá 5MB');
        return;
      }
      setFormData((prev) => ({ ...prev, cvFile: file }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      toast.error('Vui lòng nhập họ và tên');
      return;
    }
    if (!formData.phone.trim()) {
      toast.error('Vui lòng nhập số điện thoại');
      return;
    }
    if (!formData.email.trim()) {
      toast.error('Vui lòng nhập email');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Email không hợp lệ');
      return;
    }

    try {
      setIsSubmitting(true);

      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('phone', formData.phone);
      submitData.append('email', formData.email);
      submitData.append('introduction', formData.introduction || '');
      submitData.append('jobTitle', selectedJob?.title || '');
      submitData.append('jobId', selectedJob?.id?.toString() || '');
      
      if (formData.cvFile) {
        submitData.append('cvFile', formData.cvFile);
      }

      const response = await fetch('/api/recruitment/apply', {
        method: 'POST',
        body: submitData,
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(result.message || 'Gửi hồ sơ ứng tuyển thành công! Chúng tôi sẽ liên hệ với bạn sớm nhất.');
        closeModal();
      } else {
        throw new Error(result.message || 'Đã xảy ra lỗi khi gửi hồ sơ');
      }
    } catch (error) {
      console.error('Apply error:', error);
      toast.error(error.message || 'Đã xảy ra lỗi. Vui lòng thử lại sau.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredJobs = filter === 'all' 
    ? jobs 
    : jobs.filter(job => {
        if (filter === 'Farm') return job.department === 'Sản xuất';
        if (filter === 'Văn phòng') return job.department === 'Văn phòng';
        return true;
      });

  return (
    <>
      <Head>
        <title>Tuyển dụng - Eco Bắc Giang</title>
        <meta name="description" content="Cùng Eco Bắc Giang kiến tạo nền nông nghiệp tử tế. Tìm hiểu các vị trí đang tuyển dụng và cơ hội nghề nghiệp tại Eco Bắc Giang." />
      </Head>

      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
      />

      <div className="min-h-screen bg-gray-50 text-slate-800 font-sans">
        {/* 1. Hero Section */}
        <section className="relative py-20 bg-green-900 overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <Image 
              src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1600&q=80" 
              alt="Farm Background" 
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
            <span className="inline-block py-1 px-3 rounded-full bg-green-500/20 text-green-300 text-sm font-medium mb-4 border border-green-500/30">
              Chúng tôi đang tuyển dụng!
            </span>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Cùng Eco Bắc Giang Kiến Tạo <br />
              <span className="text-green-400">Nền Nông Nghiệp Tử Tế</span>
            </h1>
            <p className="text-lg text-green-100 max-w-2xl mx-auto mb-10">
              Chúng tôi không chỉ trồng rau, chúng tôi xây dựng một hệ sinh thái minh bạch và bền vững. 
              Gia nhập đội ngũ để cùng nhau thay đổi cách thế giới nhìn nhận về nông sản Việt.
            </p>
            <a 
              href="#openings" 
              className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-xl font-bold transition-all transform hover:scale-105 shadow-lg inline-flex items-center gap-2"
            >
              Xem các vị trí đang tuyển <ChevronRight size={20} />
            </a>
          </div>
        </section>

        {/* 2. Why Eco Bac Giang? */}
        <section className="py-20 max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Tại sao bạn nên làm việc tại Eco Bắc Giang?</h2>
            <div className="w-20 h-1.5 bg-green-500 mx-auto rounded-full"></div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-6">
                <Leaf size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">Môi trường Xanh</h3>
              <p className="text-gray-600">Làm việc trực tiếp tại Farm với không khí trong lành, gần gũi thiên nhiên và thực phẩm sạch mỗi ngày.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                <TrendingUp size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">Lộ trình thăng tiến</h3>
              <p className="text-gray-600">Chúng tôi đánh giá cao sự sáng tạo và nỗ lực. Cơ hội lên các vị trí quản lý Farm hoặc bộ phận chuyên trách.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center mb-6">
                <Users size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">Văn hóa Tử tế</h3>
              <p className="text-gray-600">Môi trường làm việc thân thiện, coi nhau như gia đình. Sự minh bạch là giá trị cốt lõi hàng đầu.</p>
            </div>
          </div>
        </section>

        {/* 3. Job Openings */}
        <section id="openings" className="py-20 bg-gray-100">
          <div className="max-w-5xl mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
              <div>
                <h2 className="text-3xl font-bold mb-2 text-slate-900">Vị trí đang chờ đón bạn</h2>
                <p className="text-gray-500">Hãy chọn một vị trí phù hợp với năng lực và đam mê của bạn.</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    filter === 'all' 
                      ? 'bg-green-500 text-white border-green-500' 
                      : 'bg-white border-gray-200 hover:border-green-500 hover:text-green-600'
                  }`}
                >
                  Tất cả
                </button>
                <button 
                  onClick={() => setFilter('Farm')}
                  className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    filter === 'Farm' 
                      ? 'bg-green-500 text-white border-green-500' 
                      : 'bg-white border-gray-200 hover:border-green-500 hover:text-green-600'
                  }`}
                >
                  Farm
                </button>
                <button 
                  onClick={() => setFilter('Văn phòng')}
                  className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    filter === 'Văn phòng' 
                      ? 'bg-green-500 text-white border-green-500' 
                      : 'bg-white border-gray-200 hover:border-green-500 hover:text-green-600'
                  }`}
                >
                  Văn phòng
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {filteredJobs.map((job) => (
                <div 
                  key={job.id} 
                  className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-green-200 transition-all group"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-green-600 bg-green-50 px-2 py-1 rounded">
                        {job.department}
                      </span>
                      <span className="text-xs font-medium text-gray-400">•</span>
                      <span className="text-xs font-medium text-gray-500 inline-flex items-center gap-1">
                        <Clock size={12} /> {job.type}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-green-600 transition-colors">
                      {job.title}
                    </h3>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <MapPin size={14} /> {job.location}
                      </span>
                      <span className="flex items-center gap-1 font-semibold text-green-700 underline underline-offset-4 decoration-green-200">
                        <Briefcase size={14} /> {job.salary}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <button 
                      onClick={() => openApplyModal(job)}
                      className="w-full md:w-auto bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                    >
                      Ứng tuyển ngay
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. Contact/Footer */}
        <section className="py-20 max-w-7xl mx-auto px-4 text-center">
          <div className="bg-green-600 rounded-[2rem] p-12 text-white relative overflow-hidden shadow-2xl shadow-green-200">
            <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-4">Chưa tìm thấy vị trí phù hợp?</h2>
              <p className="text-green-100 mb-8 max-w-xl mx-auto">
                Đừng ngần ngại gửi CV cho chúng tôi. Eco Bắc Giang luôn tìm kiếm những con người &quot;Tử tế&quot; để cùng phát triển dự án.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <a 
                  href="mailto:tuyendung@ecobacgiang.vn" 
                  className="bg-white text-green-700 px-8 py-3 rounded-xl font-bold hover:bg-green-50 transition-colors"
                >
                  Gửi CV qua Email
                </a>
                <a 
                  href="tel:0987654321" 
                  className="bg-green-700 text-white px-8 py-3 rounded-xl font-bold border border-green-500 hover:bg-green-800 transition-colors"
                >
                  Hotline Tuyển dụng
                </a>
              </div>
            </div>
            {/* Decorative element */}
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-green-500 rounded-full opacity-50 blur-3xl"></div>
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-green-400 rounded-full opacity-30 blur-3xl"></div>
          </div>
        </section>

        {/* Footer Minimal */}
        <footer className="py-10 border-t border-gray-200 bg-white">
          <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-gray-500 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center text-white font-bold text-xs">E</div>
              <span className="font-bold text-slate-800">Eco Bắc Giang Platform</span>
            </div>
            <p>© 2025 Eco Bac Giang. Nông nghiệp tử tế - Đội ngũ tử tế.</p>
            <div className="flex gap-6">
              <Link href="/chinh-sach-bao-mat" className="hover:text-green-600 transition-colors">
                Chính sách bảo mật
              </Link>
              <Link href="/dieu-khoan-su-dung" className="hover:text-green-600 transition-colors">
                Điều khoản làm việc
              </Link>
            </div>
          </div>
        </footer>

        {/* 5. Modal Apply */}
        {isModalOpen && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
            onClick={closeModal}
          >
            <div 
              className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-green-600 p-6 text-white flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold">Ứng tuyển vị trí</h3>
                  <p className="text-green-100 text-sm">{selectedJob?.title}</p>
                </div>
                <button 
                  onClick={closeModal}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-green-500/30 hover:bg-green-500/50 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <form className="p-8 space-y-4" onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
                      Họ và tên <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="text" 
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required 
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all" 
                      placeholder="Nguyễn Văn A" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
                      Số điện thoại <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="tel" 
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required 
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all" 
                      placeholder="09xx xxx xxx" 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
                    Email cá nhân <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required 
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all" 
                    placeholder="email@example.com" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
                    Tải hồ sơ (CV/Portfolio)
                  </label>
                  <div 
                    className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-green-500 hover:bg-green-50 transition-all cursor-pointer group"
                    onDrop={handleFileDrop}
                    onDragOver={(e) => e.preventDefault()}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="text-gray-400 group-hover:text-green-600 transition-colors" />
                      <span className="text-sm font-medium text-gray-600">
                        {formData.cvFile ? formData.cvFile.name : 'Chọn file hoặc kéo thả vào đây'}
                      </span>
                      <span className="text-xs text-gray-400">PDF, DOCX (Tối đa 5MB)</span>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
                    Giới thiệu ngắn gọn
                  </label>
                  <textarea 
                    rows="3" 
                    name="introduction"
                    value={formData.introduction}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all resize-none" 
                    placeholder="Tại sao bạn muốn làm việc cùng Eco Bắc Giang?"
                  ></textarea>
                </div>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-green-600 text-white py-4 rounded-xl font-bold hover:bg-green-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Đang gửi...' : (
                    <>
                      Gửi hồ sơ ứng tuyển <Send size={18} />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

