import React, { useReducer, useEffect, useCallback, useState } from 'react';
import Image from 'next/image';
import axios from 'axios';
import AdminLayout from '../../../components/layout/AdminLayout';
import { useRouter } from 'next/router';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Editor from '../../../components/editor';
import { debounce } from 'lodash';
import { normalizeUnit } from '../../../utils/normalizeUnit';

// Vietnamese to ASCII for slug generation
const vietnameseToAscii = (str) => {
  const vietnameseMap = {
    'à': 'a', 'á': 'a', 'ả': 'a', 'ã': 'a', 'ạ': 'a',
    'ă': 'a', 'ằ': 'a', 'ắ': 'a', 'ẳ': 'a', 'ẵ': 'a', 'ặ': 'a',
    'â': 'a', 'ầ': 'a', 'ấ': 'a', 'ẩ': 'a', 'ẫ': 'a', 'ậ': 'a',
    'è': 'e', 'é': 'e', 'ẻ': 'e', 'ẽ': 'e', 'ẹ': 'e',
    'ê': 'e', 'ề': 'e', 'ế': 'e', 'ể': 'e', 'ễ': 'e', 'ệ': 'e',
    'ì': 'i', 'í': 'i', 'ỉ': 'i', 'ĩ': 'i', 'ị': 'i',
    'ò': 'o', 'ó': 'o', 'ỏ': 'o', 'õ': 'o', 'ọ': 'o',
    'ô': 'o', 'ồ': 'o', 'ố': 'o', 'ổ': 'o', 'ỗ': 'o', 'ộ': 'o',
    'ơ': 'o', 'ờ': 'o', 'ớ': 'o', 'ở': 'o', 'ỡ': 'o', 'ợ': 'o',
    'ù': 'u', 'ú': 'u', 'ủ': 'u', 'ũ': 'u', 'ụ': 'u',
    'ư': 'u', 'ừ': 'u', 'ứ': 'u', 'ử': 'u', 'ữ': 'u', 'ự': 'u',
    'ỳ': 'y', 'ý': 'y', 'ỷ': 'y', 'ỹ': 'y', 'ỵ': 'y',
    'đ': 'd',
    'À': 'A', 'Á': 'A', 'Ả': 'A', 'Ã': 'A', 'Ạ': 'A',
    'Ă': 'A', 'Ằ': 'A', 'Ắ': 'A', 'Ẳ': 'A', 'Ẵ': 'A', 'Ặ': 'A',
    'Â': 'A', 'Ầ': 'A', 'Ấ': 'A', 'Ẩ': 'A', 'Ẫ': 'A', 'Ậ': 'A',
    'È': 'E', 'É': 'E', 'Ẻ': 'E', 'Ẽ': 'E', 'Ẹ': 'E',
    'Ê': 'E', 'Ề': 'E', 'Ế': 'E', 'Ể': 'E', 'Ễ': 'E', 'Ệ': 'E',
    'Ì': 'I', 'Í': 'I', 'Ỉ': 'I', 'Ĩ': 'I', 'Ị': 'I',
    'Ò': 'O', 'Ó': 'O', 'Ỏ': 'O', 'Õ': 'O', 'Ọ': 'O',
    'Ô': 'O', 'Ồ': 'O', 'Ố': 'O', 'Ổ': 'O', 'Ỗ': 'O', 'Ộ': 'O',
    'Ơ': 'O', 'Ờ': 'O', 'Ớ': 'O', 'Ở': 'O', 'Ỡ': 'O', 'Ợ': 'O',
    'Ù': 'U', 'Ú': 'U', 'Ủ': 'U', 'Ũ': 'U', 'Ụ': 'U',
    'Ư': 'U', 'Ừ': 'U', 'Ứ': 'U', 'Ử': 'U', 'Ữ': 'U', 'Ự': 'U',
    'Ỳ': 'Y', 'Ý': 'Y', 'Ỷ': 'Y', 'Ỹ': 'Y', 'Ỵ': 'Y',
    'Đ': 'D',
  };
  return str.replace(/./g, (char) => vietnameseMap[char] || char);
};

// Generate slug from title
const generateSlug = (title) =>
  vietnameseToAscii(title)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .trim();


// Initial state
const initialState = {
  maSanPham: '',
  name: '',
  image: [],
  slug: '',
  content: '',
  description: '',
  category: '',
  categoryNameVN: '',
  price: 0,
  promotionalPrice: 0,
  isNew: false,
  isFeatured: false,
  rating: 0,
  reviewCount: 0,
  stockStatus: 'Còn hàng',
  unit: 'Kg', // Added unit field
};

// Reducer
function reducer(state, action) {
  switch (action.type) {
    case 'UPDATE_FIELD':
      return { ...state, [action.field]: action.value };
    case 'SET_PRODUCT':
      return { ...action.payload };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

// Categories
const categories = [
  { categoryNameVN: 'Rau ăn lá', category: 'rau-an-la' },
  { categoryNameVN: 'Củ, quả, hạt', category: 'cu-qua-hat' },
  { categoryNameVN: 'Đồ khô', category: 'thuc-pham-kho' },
  { categoryNameVN: 'Rau gia vị', category: 'rau-gia-vi' },
  { categoryNameVN: 'Sản phẩm OCOP', category: 'san-pham-ocop' },


];

export default function CreateProductPage() {
  const router = useRouter();
  const { _id } = router.query;
  const [formData, dispatch] = useReducer(reducer, initialState);
  const [images, setImages] = useState([{ src: '' }]);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState([]);
  const [isSlugEdited, setIsSlugEdited] = useState(false);
  const [originalSlug, setOriginalSlug] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newProductMaSanPham, setNewProductMaSanPham] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Add error helper
  const addError = (message) => {
    setErrors((prev) => (prev.includes(message) ? prev : [...prev, message]));
    toast.error(message, { position: 'top-right', autoClose: 3000 });
  };



  // Fetch product for editing
  const fetchProduct = useCallback(async () => {
    setIsLoading(true);
    try {
      // Chỉ dùng Server API
      const { productService } = await import("../../../lib/api-services");
      const productResponse = await productService.getById(_id);
      const response = { data: productResponse };
      const product = response.data.product || {};
      const selCat = categories.find((c) => c.category === product.category) || {};

      dispatch({
        type: 'SET_PRODUCT',
        payload: {
          maSanPham: product.maSanPham || '',
          name: product.name || '',
          image: Array.isArray(product.image) ? product.image : [],
          slug: product.slug || '',
          content: product.content || '',
          description: product.description || '',
          category: product.category || '',
          categoryNameVN: selCat.categoryNameVN || product.categoryNameVN || '',
          price: product.price || 0,
          promotionalPrice: product.promotionalPrice || 0,
          isNew: product.isNew || false,
          isFeatured: product.isFeatured || false,
          rating: product.rating || 0,
          reviewCount: product.reviewCount || 0,
          stockStatus: product.stockStatus || 'Còn hàng',
          unit: (normalizeUnit(product.unit) && ['Kg', '100g', 'túi', 'hộp', 'chai'].includes(normalizeUnit(product.unit)))
            ? normalizeUnit(product.unit)
            : 'Kg', // Ensure valid unit
        },
      });

      if (Array.isArray(product.image) && product.image.length > 0) {
        setImages(product.image.map((src) => ({ src: src || '' })));
      } else {
        setImages([{ src: '' }]);
      }
      setIsSlugEdited(true);
      setOriginalSlug(product.slug || '');
    } catch (err) {
      console.error('Error fetching product:', err);
      addError('Không thể tải sản phẩm');
    } finally {
      setIsLoading(false);
    }
  }, [_id]);

  useEffect(() => {
    if (_id) fetchProduct();
  }, [_id, fetchProduct]);

  // Handle name change
  const handleNameChange = (e) => {
    const name = e.target.value;
    dispatch({ type: 'UPDATE_FIELD', field: 'name', value: name });
    if (!isSlugEdited) {
      dispatch({ type: 'UPDATE_FIELD', field: 'slug', value: generateSlug(name) });
    }
  };

  // Handle slug change
  const handleSlugChange = (e) => {
    setIsSlugEdited(true);
    dispatch({ type: 'UPDATE_FIELD', field: 'slug', value: e.target.value.trim().toLowerCase() });
  };

  // Handle maSanPham change
  const handleMaSanPhamChange = (e) => {
    dispatch({ type: 'UPDATE_FIELD', field: 'maSanPham', value: e.target.value });
  };

  // Handle description change
  const handleDescriptionChange = (e) => {
    dispatch({ type: 'UPDATE_FIELD', field: 'description', value: e.target.value });
  };

  // Handle content change
  const handleContentChange = (content) => {
    const sanitizedContent = typeof content === 'string' ? content : '';
    dispatch({ type: 'UPDATE_FIELD', field: 'content', value: sanitizedContent });
  };

  // Handle category change
  const handleCategoryChange = (e) => {
    const selectedCategory = categories.find((cat) => cat.category === e.target.value);
    dispatch({
      type: 'UPDATE_FIELD',
      field: 'category',
      value: e.target.value,
    });
    dispatch({
      type: 'UPDATE_FIELD',
      field: 'categoryNameVN',
      value: selectedCategory ? selectedCategory.categoryNameVN : '',
    });
  };

  // Handle image URL change
  const handleImageUrlChange = (index, url) => {
    setImages((prevImages) => {
      const newImages = [...prevImages];
      if (!newImages[index]) {
        newImages[index] = { src: '' };
      }
      newImages[index] = {
        ...newImages[index],
        src: url
      };
      
      // Update formData.image array
      const imageUrls = newImages.map(img => img.src).filter(src => src && src.trim() !== '');
        dispatch({
          type: 'UPDATE_FIELD',
          field: 'image',
        value: imageUrls,
      });
      
      return newImages;
    });
  };

  // Add new image input
  const handleAddImage = () => {
    setImages([...images, { src: '' }]);
  };


  // Check slug availability
  const checkSlug = async (slug, productId = null) => {
    try {
      const normalizedSlug = slug.trim().toLowerCase();
      // Chỉ dùng Server API
      const { productService } = await import("../../../lib/api-services");
      const response = await productService.checkSlug(normalizedSlug, productId);
      // Nếu không có lỗi, slug có thể sử dụng
      return response && response.status === 'success';
    } catch (error) {
      console.error('Error checking slug:', error.message);
      // Nếu có lỗi (slug đã tồn tại), trả về false
      return false;
    }
  };

  // Debounce slug check (debounce returns a function with stable ref; deps intentionally minimal)
  // eslint-disable-next-line react-hooks/exhaustive-deps -- debounce() dependency unknown to ESLint
  const debouncedCheckSlug = useCallback(
    debounce(async (slug, productId) => {
      // Bỏ qua nếu slug rỗng hoặc quá ngắn
      if (!slug || slug.trim().length < 2) {
        return;
      }
      
      const isValid = await checkSlug(slug, productId);
      if (!isValid) {
        addError('Slug đã tồn tại, vui lòng chọn slug khác');
      } else {
        setErrors((prev) => prev.filter((err) => err !== 'Slug đã tồn tại, vui lòng chọn slug khác'));
      }
    }, 500),
    [checkSlug, addError]
  );

  useEffect(() => {
    // Chỉ check slug nếu:
    // 1. Slug không rỗng
    // 2. Slug có ít nhất 2 ký tự
    // 3. Không phải đang edit cùng slug (hoặc đang tạo mới)
    if (formData.slug && formData.slug.trim().length >= 2 && (!_id || formData.slug !== originalSlug)) {
      debouncedCheckSlug(formData.slug, _id);
    }
  }, [formData.slug, _id, originalSlug, debouncedCheckSlug]);

  // Reset form
  const resetForm = () => {
    dispatch({ type: 'RESET' });
    setImages([{ src: '' }]);
    setIsSlugEdited(false);
    setOriginalSlug('');
    setErrors([]);
    setNewProductMaSanPham(null);
  };

  // Handle image removal
  const handleRemoveImage = (index) => {
    setImages((prev) => {
      const newImages = prev.filter((_, i) => i !== index);
      
      // Update formData.image array
      const imageUrls = newImages.map(img => img.src).filter(src => src && src.trim() !== '');
    dispatch({
      type: 'UPDATE_FIELD',
      field: 'image',
        value: imageUrls,
      });
      
      // If no images left, add one empty image input
      if (newImages.length === 0) {
        return [{ src: '' }];
      }
      
      return newImages;
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);
    setIsSubmitting(true);

    try {
      // Client-side validation
      if (!formData.name) {
        addError('Tên sản phẩm là bắt buộc');
        setIsSubmitting(false);
        return;
      }
      if (!formData.maSanPham) {
        addError('Mã sản phẩm là bắt buộc');
        setIsSubmitting(false);
        return;
      }
      if (!/^[A-Za-z0-9_-]+$/.test(formData.maSanPham)) {
        addError('Mã sản phẩm chỉ được chứa chữ cái, số, dấu gạch dưới hoặc gạch ngang');
        setIsSubmitting(false);
        return;
      }
      if (!formData.slug) {
        addError('Slug là bắt buộc');
        setIsSubmitting(false);
        return;
      }
      if (!formData.category) {
        addError('Danh mục là bắt buộc');
        setIsSubmitting(false);
        return;
      }
      if (!formData.categoryNameVN) {
        addError('Tên danh mục là bắt buộc');
        setIsSubmitting(false);
        return;
      }
      if (!formData.description) {
        addError('Mô tả là bắt buộc');
        setIsSubmitting(false);
        return;
      }
      if (!formData.image.length) {
        addError('Vui lòng tải lên ít nhất một ảnh sản phẩm');
        setIsSubmitting(false);
        return;
      }
      if (formData.price < 0) {
        addError('Giá gốc không được âm');
        setIsSubmitting(false);
        return;
      }
      if (formData.promotionalPrice < 0) {
        addError('Giá khuyến mãi không được âm');
        setIsSubmitting(false);
        return;
      }
      if (formData.promotionalPrice && formData.promotionalPrice > formData.price) {
        addError('Giá khuyến mãi không được lớn hơn giá gốc');
        setIsSubmitting(false);
        return;
      }
      if (formData.rating < 0 || formData.rating > 5) {
        addError('Đánh giá phải từ 0 đến 5');
        setIsSubmitting(false);
        return;
      }
      if (formData.reviewCount < 0) {
        addError('Số lượng đánh giá không được âm');
        setIsSubmitting(false);
        return;
      }
      if (!['Còn hàng', 'Hết hàng'].includes(formData.stockStatus)) {
        addError('Tình trạng kho phải là "Còn hàng" hoặc "Hết hàng"');
        setIsSubmitting(false);
        return;
      }
      
      // Validate unit - ensure it exists and is valid
      const validUnits = ['Kg', '100g', 'túi', 'hộp', 'chai'];
      // Normalize unit: trim and check if valid, default to 'Kg'
      let unitValue = (formData.unit || '').toString().trim();
      if (!unitValue || !validUnits.includes(unitValue)) {
        // Try to normalize common variations
        const unitLower = unitValue.toLowerCase();
        if (unitLower === 'kg' || unitLower === 'kilogram' || unitLower === 'kí') {
          unitValue = 'Kg';
        } else if (unitLower === 'g' || unitLower === 'gram' || unitLower === 'gam') {
          unitValue = '100g';
        } else if (unitLower === '100g' || unitLower === '100 g' || unitLower === '100gram' || unitLower === '100 gram') {
          unitValue = '100g';
        } else if (unitLower === 'tui' || unitLower === 'túi' || unitLower === 'bag') {
          unitValue = 'túi';
        } else if (unitLower === 'hop' || unitLower === 'hộp' || unitLower === 'box') {
          unitValue = 'hộp';
        } else if (unitLower === 'chai' || unitLower === 'bottle') {
          unitValue = 'chai';
        } else {
          // If still not valid, use default
          unitValue = 'Kg';
        }
      }
      
      // Final check - if still not valid, show error
      if (!validUnits.includes(unitValue)) {
        addError('Đơn vị phải là Kg, 100g, túi, hộp hoặc chai');
        setIsSubmitting(false);
        return;
      }

      // Validate images
      const validImages = images.map(img => img.src).filter(src => src && src.trim() !== '');
      if (validImages.length === 0) {
        addError('Vui lòng nhập ít nhất một ảnh đại diện');
        setIsSubmitting(false);
        return;
      }

      // Construct product data
      const productData = {
        maSanPham: formData.maSanPham,
        name: formData.name,
        image: validImages,
        slug: formData.slug.trim().toLowerCase(),
        content: formData.content,
        description: formData.description,
        category: formData.category,
        categoryNameVN: formData.categoryNameVN,
        price: formData.price,
        promotionalPrice: formData.promotionalPrice,
        isNew: formData.isNew,
        isFeatured: formData.isFeatured,
        rating: Number(formData.rating),
        reviewCount: formData.reviewCount,
        stockStatus: formData.stockStatus,
        unit: unitValue || 'Kg', // Ensure unit is always valid
      };

      // Validate slug
      let isSlugValid = true;
      if (!_id || formData.slug !== originalSlug) {
        isSlugValid = await checkSlug(formData.slug, _id);
        if (!isSlugValid) {
          addError('Slug đã tồn tại, vui lòng chọn slug khác');
          setIsSubmitting(false);
          return;
        }
      }

      // Submit to backend
      if (_id) {
        // Chỉ dùng Server API - Update existing product
        const { productService } = await import("../../../lib/api-services");
        const response = await productService.update(_id, productData);
        
        // Kiểm tra response status
        if (response && response.status === 'error') {
          throw new Error(response.err || 'Không thể cập nhật sản phẩm');
        }
        
        if (!response || (response.status !== 'success' && !response.product)) {
          throw new Error('Không thể cập nhật sản phẩm. Vui lòng thử lại.');
        }
        
        setErrors([]);
        toast.success('Sản phẩm đã được cập nhật thành công!', {
          position: 'top-right',
          autoClose: 3000,
        });
        
        // Đợi một chút để toast hiển thị trước khi redirect
        setTimeout(() => {
          router.push('/dashboard/san-pham');
        }, 500);
      } else {
        // Chỉ dùng Server API - Create new product
        const { productService } = await import("../../../lib/api-services");
        const response = await productService.create(productData);
        
        // Kiểm tra response status
        if (response && response.status === 'error') {
          throw new Error(response.err || 'Không thể tạo sản phẩm');
        }
        
        if (!response || (response.status !== 'success' && !response.product)) {
          throw new Error('Không thể tạo sản phẩm. Vui lòng thử lại.');
        }
        
        setNewProductMaSanPham(formData.maSanPham);
        setErrors([]);
        toast.success(`Sản phẩm đã được thêm thành công! Mã sản phẩm: ${formData.maSanPham}`, {
          position: 'top-right',
          autoClose: 3000,
        });
        resetForm();
      }
    } catch (error) {
      console.error('API error:', error);
      // Xử lý các loại error khác nhau
      let errorMessage = 'Không thể lưu sản phẩm';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.err) {
        errorMessage = error.err;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      addError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout title={_id ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}>
      <div className="product-form-container">
        <div className="product-form-header">
          <h2 className='uppercase'>{_id ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}</h2>
          <p>Quản lý thông tin sản phẩm của bạn một cách dễ dàng</p>
        </div>

        {errors.length > 0 && (
          <div className="error-messages">
            {errors.map((error, idx) => (
              <div key={idx} className="error-message" id={`error-${idx}`}>
                {error}
              </div>
            ))}
          </div>
        )}

        {newProductMaSanPham && !_id && (
          <div className="success-message">
            Sản phẩm đã được tạo với mã sản phẩm: <strong>{newProductMaSanPham}</strong>
          </div>
        )}

        {isLoading ? (
          <div className="text-center text-black dark:text-white">
            <div className="loading-spinner"></div>
            <span className="ml-2">Đang tải...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="product-form">
            {/* Basic Information Section */}
            <div className="form-section">
              <h3 className="form-section-title">📝 Thông tin cơ bản</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label required" htmlFor="maSanPham">
                    Mã sản phẩm
                  </label>
                  <input
                    id="maSanPham"
                    type="text"
                    value={formData.maSanPham}
                    onChange={handleMaSanPhamChange}
                    className={`form-input ${errors.some((e) => e.includes('Mã sản phẩm')) ? 'error' : ''}`}
                    required
                    placeholder="Ví dụ: SP001"
                    aria-label="Mã sản phẩm"
                    aria-describedby={errors.some((e) => e.includes('Mã sản phẩm')) ? 'error-maSanPham' : undefined}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label required" htmlFor="name">
                    Tên sản phẩm
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={handleNameChange}
                    className={`form-input ${errors.some((e) => e.includes('Tên sản phẩm')) ? 'error' : ''}`}
                    required
                    placeholder="Nhập tên sản phẩm"
                    aria-label="Tên sản phẩm"
                    aria-describedby={errors.some((e) => e.includes('Tên sản phẩm')) ? 'error-name' : undefined}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label required" htmlFor="slug">
                  Slug
                </label>
                <input
                  id="slug"
                  type="text"
                  value={formData.slug}
                  onChange={handleSlugChange}
                  className={`form-input ${errors.some((e) => e.includes('Slug')) ? 'error' : ''}`}
                  required
                  placeholder="slug-san-pham"
                  aria-label="Slug sản phẩm"
                  aria-describedby={errors.some((e) => e.includes('Slug')) ? 'error-slug' : undefined}
                />
              </div>

              <div className="form-group">
                <label className="form-label required" htmlFor="description">
                  Mô tả
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={handleDescriptionChange}
                  className={`form-input form-textarea ${errors.some((e) => e.includes('Mô tả')) ? 'error' : ''}`}
                  rows={3}
                  placeholder="Nhập mô tả sản phẩm"
                  required
                  aria-label="Mô tả sản phẩm"
                  aria-describedby={errors.some((e) => e.includes('Mô tả')) ? 'error-description' : undefined}
                />
              </div>
            </div>

            {/* Image Upload Section */}
            <div className="form-section">
              <h3 className="form-section-title">🖼️ Hình ảnh sản phẩm</h3>
              
              {/* Main Image - First image */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Đường dẫn ảnh chính (Ảnh đại diện) <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2 items-start">
                  <input
                    type="text"
                    value={images[0]?.src || ''}
                    onChange={(e) => handleImageUrlChange(0, e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://flickr.com/photo.jpg hoặc /images/products/product-1.jpg"
                    required
                  />
                  {images[0]?.src && (
                    <div className="relative w-20 h-20 border border-gray-300 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={images[0].src}
                        alt="Preview"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  )}
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Dán đường link hình ảnh từ Flickr, Imgur, hoặc link ngoài khác. Ảnh này sẽ là ảnh đại diện của sản phẩm.
                </p>
              </div>

              {/* Additional Images */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Đường dẫn ảnh bổ sung (tùy chọn)
                </label>
                {images.slice(1).map((img, index) => {
                  const imageIndex = index + 1;
                  return (
                    <div key={imageIndex} className="flex gap-2 mb-3 items-start">
                      <input
                        type="text"
                        value={img.src || ''}
                        onChange={(e) => handleImageUrlChange(imageIndex, e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={`https://flickr.com/photo.jpg hoặc /images/products/gallery-${imageIndex}.jpg`}
                      />
                      {img.src && (
                        <div className="relative w-16 h-16 border border-gray-300 rounded-lg overflow-hidden flex-shrink-0">
                          <Image
                            src={img.src}
                            alt={`Preview ${imageIndex + 1}`}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(imageIndex)}
                        className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                        aria-label={`Xóa ảnh ${imageIndex + 1}`}
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
                <button
                  type="button"
                  onClick={handleAddImage}
                  className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors gap-2"
                >
                  + Thêm ảnh
                </button>
              </div>
            </div>

            {/* Product Details Section */}
            <div className="form-section">
              <h3 className="form-section-title">⚙️ Chi tiết sản phẩm</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="form-group">
                  <label className="form-label required" htmlFor="category">
                    Danh mục
                  </label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={handleCategoryChange}
                    className={`form-input form-select ${errors.some((e) => e.includes('Danh mục')) ? 'error' : ''}`}
                    required
                    aria-label="Danh mục sản phẩm"
                    aria-describedby={errors.some((e) => e.includes('Danh mục')) ? 'error-category' : undefined}
                  >
                    <option value="">Chọn danh mục</option>
                    {categories.map((cat, index) => (
                      <option key={index} value={cat.category}>
                        {cat.categoryNameVN}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label required" htmlFor="stockStatus">
                    Tình trạng kho
                  </label>
                  <select
                    id="stockStatus"
                    value={formData.stockStatus}
                    onChange={(e) => dispatch({ type: 'UPDATE_FIELD', field: 'stockStatus', value: e.target.value })}
                    className={`form-input form-select ${errors.some((e) => e.includes('Tình trạng kho')) ? 'error' : ''}`}
                    required
                    aria-label="Tình trạng kho"
                    aria-describedby={errors.some((e) => e.includes('Tình trạng kho')) ? 'error-stockStatus' : undefined}
                  >
                    <option value="Còn hàng">Còn hàng</option>
                    <option value="Hết hàng">Hết hàng</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label required" htmlFor="unit">
                    Đơn vị
                  </label>
                  <select
                    id="unit"
                    value={formData.unit || 'Kg'}
                    onChange={(e) => dispatch({ type: 'UPDATE_FIELD', field: 'unit', value: e.target.value })}
                    className={`form-input form-select ${errors.some((e) => e.includes('Đơn vị')) ? 'error' : ''}`}
                    required
                    aria-label="Đơn vị sản phẩm"
                    aria-describedby={errors.some((e) => e.includes('Đơn vị')) ? 'error-unit' : undefined}
                  >
                    {['Kg', '100g', 'túi', 'hộp', 'chai'].map((unit) => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label required" htmlFor="price">
                    Giá gốc
                  </label>
                  <input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => dispatch({ type: 'UPDATE_FIELD', field: 'price', value: Number(e.target.value) })}
                    className={`form-input ${errors.some((e) => e.includes('Giá gốc')) ? 'error' : ''}`}
                    min="0"
                    placeholder="0"
                    required
                    aria-label="Giá gốc"
                    aria-describedby={errors.some((e) => e.includes('Giá gốc')) ? 'error-price' : undefined}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="form-group">
                  <label className="form-label" htmlFor="promotionalPrice">
                    Giá khuyến mãi
                  </label>
                  <input
                    id="promotionalPrice"
                    type="number"
                    value={formData.promotionalPrice}
                    onChange={(e) => dispatch({ type: 'UPDATE_FIELD', field: 'promotionalPrice', value: Number(e.target.value) })}
                    className={`form-input ${errors.some((e) => e.includes('Giá khuyến mãi')) ? 'error' : ''}`}
                    min="0"
                    placeholder="0"
                    aria-label="Giá khuyến mãi"
                    aria-describedby={errors.some((e) => e.includes('Giá khuyến mãi')) ? 'error-promotionalPrice' : undefined}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="rating">
                    Đánh giá (0-5)
                  </label>
                  <input
                    id="rating"
                    type="number"
                    value={formData.rating}
                    onChange={(e) => dispatch({ type: 'UPDATE_FIELD', field: 'rating', value: Number(e.target.value) })}
                    className={`form-input ${errors.some((e) => e.includes('Đánh giá')) ? 'error' : ''}`}
                    min="0"
                    max="5"
                    step="0.1"
                    placeholder="0"
                    aria-label="Đánh giá"
                    aria-describedby={errors.some((e) => e.includes('Đánh giá')) ? 'error-rating' : undefined}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="reviewCount">
                    Số lượng đánh giá
                  </label>
                  <input
                    id="reviewCount"
                    type="number"
                    value={formData.reviewCount}
                    onChange={(e) => dispatch({ type: 'UPDATE_FIELD', field: 'reviewCount', value: Number(e.target.value) })}
                    className={`form-input ${errors.some((e) => e.includes('Số lượng đánh giá')) ? 'error' : ''}`}
                    min="0"
                    placeholder="0"
                    aria-label="Số lượng đánh giá"
                    aria-describedby={errors.some((e) => e.includes('Số lượng đánh giá')) ? 'error-reviewCount' : undefined}
                  />
                </div>
              </div>
            </div>

            {/* Product Options Section */}
            <div className="form-section">
              <h3 className="form-section-title">🔧 Tùy chọn sản phẩm</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-checkbox">
                  <input
                    type="checkbox"
                    id="isNew"
                    checked={formData.isNew}
                    onChange={(e) => dispatch({ type: 'UPDATE_FIELD', field: 'isNew', value: e.target.checked })}
                    aria-label="Sản phẩm mới"
                  />
                  <label htmlFor="isNew">Sản phẩm mới</label>
                </div>

                <div className="form-checkbox">
                  <input
                    type="checkbox"
                    id="isFeatured"
                    checked={formData.isFeatured}
                    onChange={(e) => dispatch({ type: 'UPDATE_FIELD', field: 'isFeatured', value: e.target.checked })}
                    aria-label="Sản phẩm nổi bật"
                  />
                  <label htmlFor="isFeatured">Sản phẩm nổi bật</label>
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="form-section editor-form-section">
              <h3 className="form-section-title">📄 Nội dung chi tiết</h3>
              <Editor
                content={formData.content || ''}
                onChange={handleContentChange}
              />
            </div>

            {/* Form Actions */}
            <div className="form-actions">
              <button
                type="button"
                onClick={() => router.push('/dashboard/san-pham')}
                className="btn btn-secondary"
                aria-label="Hủy"
              >
                ❌ Hủy
              </button>
              <button
                type="submit"
                disabled={uploading || isSubmitting}
                className={`btn btn-primary $                {isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                aria-label={_id ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm'}
              >
                {isSubmitting ? (
                  <>
                    <div className="loading-spinner"></div>
                    Đang xử lý...
                  </>
                ) : _id ? (
                  '✅ Cập nhật'
                ) : (
                  '➕ Thêm sản phẩm'
                )}
              </button>
            </div>
          </form>
        )}

        <ToastContainer />
      </div>
    </AdminLayout>
  );
}