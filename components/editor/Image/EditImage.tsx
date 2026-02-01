import { FC, useCallback, useState, useEffect } from "react";
import { Editor } from "@tiptap/react";

interface Props {
  editor: Editor;
}

interface ImageOption {
  src: string;
  alt: string;
  showCaption: boolean;
}

const EditImage: FC<Props> = ({ editor }): JSX.Element | null => {
  const [isImageSelected, setIsImageSelected] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [imageData, setImageData] = useState<ImageOption>({
    src: "",
    alt: "",
    showCaption: true,
  });

  const getImageAttributes = useCallback(() => {
    const attrs = editor.getAttributes("image");
    return {
      src: attrs.src || "",
      alt: attrs.alt || "",
      showCaption: attrs["data-show-caption"] !== "false",
    };
  }, [editor]);

  // Kiểm tra xem có ảnh được chọn không
  useEffect(() => {
    const updateSelection = () => {
      const isActive = editor.isActive("image");
      setIsImageSelected(isActive);
      
      if (isActive && !showEditForm) {
        const attrs = getImageAttributes();
        setImageData(attrs);
      }
    };

    editor.on("selectionUpdate", updateSelection);
    editor.on("transaction", updateSelection);

    return () => {
      editor.off("selectionUpdate", updateSelection);
      editor.off("transaction", updateSelection);
    };
  }, [editor, showEditForm, getImageAttributes]);

  const handleImageDeleteClick = () => {
    editor.chain().focus().deleteSelection().run();
    setIsImageSelected(false);
    setShowEditForm(false);
  };

  const handleSubmit = (data: ImageOption) => {
    const imageAttrs: any = {
      src: data.src,
      alt: data.alt || "",
    };

    // Thêm data attribute để đánh dấu có hiển thị caption hay không
    if (data.showCaption && data.alt) {
      imageAttrs["data-show-caption"] = "true";
    } else {
      imageAttrs["data-show-caption"] = "false";
    }

    editor
      .chain()
      .focus()
      .setImage(imageAttrs)
      .run();
    setShowEditForm(false);
  };

  const handleCancel = () => {
    setShowEditForm(false);
    // Restore original data
    if (isImageSelected) {
      const attrs = getImageAttributes();
      setImageData(attrs);
    }
  };

  const handleEditClick = () => {
    const attrs = getImageAttributes();
    setImageData(attrs);
    setShowEditForm(true);
  };

  const handleCancelSelection = () => {
    editor.chain().focus().blur().run();
    setIsImageSelected(false);
    setShowEditForm(false);
  };

  if (!isImageSelected) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700 rounded-lg p-4 min-w-[320px] max-w-md">
      {!showEditForm ? (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Ảnh đã được chọn
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleEditClick}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition-colors"
              title="Chỉnh sửa ảnh"
            >
              Sửa
            </button>
            <button
              onClick={handleImageDeleteClick}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-medium transition-colors"
              title="Xóa ảnh"
            >
              Xóa
            </button>
            <button
              onClick={handleCancelSelection}
              className="px-3 py-1.5 bg-gray-500 hover:bg-gray-600 text-white rounded text-sm font-medium transition-colors"
              title="Hủy chọn"
            >
              Hủy
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              Chỉnh sửa ảnh
            </h3>
            <button
              onClick={handleCancel}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ✕
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              URL ảnh
            </label>
            <input
              autoFocus
              type="text"
              className="w-full bg-white dark:bg-gray-700 rounded border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 transition p-2 text-gray-800 dark:text-gray-200 text-sm"
              placeholder="https://..."
              value={imageData.src}
              onChange={(e) =>
                setImageData({ ...imageData, src: e.target.value })
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSubmit(imageData);
                }
                if (e.key === "Escape") {
                  handleCancel();
                }
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Mô tả ảnh (Alt text)
            </label>
            <input
              type="text"
              className="w-full bg-white dark:bg-gray-700 rounded border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 transition p-2 text-gray-800 dark:text-gray-200 text-sm"
              placeholder="Mô tả ảnh..."
              value={imageData.alt}
              onChange={(e) =>
                setImageData({ ...imageData, alt: e.target.value })
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSubmit(imageData);
                }
                if (e.key === "Escape") {
                  handleCancel();
                }
              }}
            />
          </div>

          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={imageData.showCaption}
              onChange={(e) =>
                setImageData({ ...imageData, showCaption: e.target.checked })
              }
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Hiển thị tên ảnh bên dưới
            </span>
          </label>

          <div className="flex space-x-2 pt-2">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSubmit(imageData);
              }}
              className="flex-1 bg-blue-600 hover:bg-blue-700 px-3 py-2 text-white rounded text-sm font-medium transition-colors"
            >
              Lưu
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleCancel();
              }}
              className="px-3 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-500 transition"
            >
              Hủy
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditImage;

