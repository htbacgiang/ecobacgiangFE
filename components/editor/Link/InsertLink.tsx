import { FC, useState } from "react";
import { BsLink45Deg } from "react-icons/bs";
import Button from "../ToolBar/Button";
import LinkForm, { linkOption } from "./LinkForm";

interface Props {
  onSubmit(link: linkOption): void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const InsertLink: FC<Props> = ({ onSubmit, open, onOpenChange }): JSX.Element => {
  const [internalVisible, setInternalVisible] = useState(false);
  const isControlled = open !== undefined;
  const visible = isControlled ? open : internalVisible;

  const hideForm = () => {
    if (isControlled) onOpenChange?.(false);
    else setInternalVisible(false);
  };
  const showForm = () => {
    if (isControlled) onOpenChange?.(true);
    else setInternalVisible(true);
  };

  const handleSubmit = (link: linkOption) => {
    if (!link.url.trim()) return hideForm();

    onSubmit(link);
    hideForm();
  };

  return (
    <div
      onKeyDown={({ key }) => {
        if (key === "Escape") hideForm();
      }}
      className="relative"
    >
      <Button onClick={visible ? hideForm : showForm}>
        <BsLink45Deg />
      </Button>

      <div className="absolute top-full mt-4 right-0 z-50">
        <LinkForm visible={visible} onSubmit={handleSubmit} />
      </div>
    </div>
  );
};

export default InsertLink;
