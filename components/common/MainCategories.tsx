import { FC, useState } from "react";

interface Props {
  onCategorySelect: (category: string | null) => void;
}

const CATEGORIES: { value: string | null; label: string }[] = [
  { value: null, label: "Tất cả" },
  { value: "Tin tức & Xu hướng", label: "Tin tức & xu hướng" },
  { value: "Chuyện của Farm", label: "Chuyện của Farm" },
  { value: "Công thức nấu ăn", label: "Công thức nấu ăn" },
  { value: "Sống xanh", label: "Sống xanh" },
];

const MainCategories: FC<Props> = ({ onCategorySelect }) => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const handleCategoryClick = (category: string | null) => {
    setActiveCategory(category);
    onCategorySelect(category);
  };

  return (
    <div className="flex items-center justify-center px-2 sm:px-4 mt-5 mb-4">
      <div
        className="w-full max-w-4xl flex flex-wrap items-center justify-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-2xl bg-gray-50/80 border border-gray-200/80 shadow-sm"
        role="tablist"
        aria-label="Lọc bài viết theo danh mục"
      >
        {CATEGORIES.map(({ value, label }) => {
          const isActive = activeCategory === value;
          return (
            <button
              key={label}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => handleCategoryClick(value)}
              className={`
                min-h-[44px] rounded-full px-5 py-2.5 text-sm sm:text-base font-medium
                transition-all duration-200 ease-out
                focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
                active:scale-[0.98]
                ${isActive
                  ? "bg-blue-700 text-white shadow-md shadow-blue-700/25 hover:bg-blue-800"
                  : "bg-white text-gray-700 border border-gray-200 hover:border-blue-200 hover:bg-blue-50/50 hover:text-blue-800"
                }
              `}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MainCategories;
