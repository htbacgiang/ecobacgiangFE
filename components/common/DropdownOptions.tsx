import { FC, ReactNode, useState } from "react";
import Button from "../editor/ToolBar/Button";

export type dropDownOptions = { label: string; onClick(): void }[];

interface Props {
  options: dropDownOptions;
  head: ReactNode;
  /** Controlled: khi có thì chỉ mở 1 dropdown tại 1 thời điểm (đóng các toolbar khác) */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const DropdownOptions: FC<Props> = ({ head, options, open, onOpenChange }): JSX.Element => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = open !== undefined;
  const showOptions = isControlled ? open : internalOpen;

  const setShowOptions = (value: boolean) => {
    if (isControlled) onOpenChange?.(value);
    else setInternalOpen(value);
  };

  return (
    <div className="relative">
      <Button
        onMouseDown={() => setShowOptions(!showOptions)}
        onBlur={() => setShowOptions(false)}
      >
        {head}
      </Button>
      {showOptions && (
        <div className="min-w-max absolute top-full mt-2 right-0 z-40 border border-gray-300 dark:border-gray-600 rounded-md text-left bg-white dark:bg-gray-800 shadow-lg">
          <ul className="py-2 space-y-1">
            {options.map(({ label, onClick }, index) => {
              return (
                <li
                  className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                  key={label + index}
                  onMouseDown={() => {
                    onClick();
                    setShowOptions(false);
                  }}
                >
                  {label}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default DropdownOptions;
