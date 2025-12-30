import { FC, useEffect, useState, useRef } from "react";
import { useEditor, EditorContent, getMarkRange, Range } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import Youtube from "@tiptap/extension-youtube";
import TipTapImage from "@tiptap/extension-image";
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import TextAlign from "@tiptap/extension-text-align";
import ToolBar from "../editor/ToolBar";
import EditLink from "../editor/Link/EditLink";
import EditImage from "../editor/Image/EditImage";
import GalleryModal, { ImageSelectionResult } from "../editor/GalleryModal";
import axios from "axios";

interface Props {
  content: string; // Initial content value
  onChange: (content: string) => void; // Callback to update content in parent
}

const Editor: FC<Props> = ({ content, onChange }): JSX.Element => {
  const [selectionRange, setSelectionRange] = useState<Range>();
  const [showGallery, setShowGallery] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState<{ src: string }[]>([]);
  const isInternalUpdateRef = useRef(false);
  const previousContentRef = useRef<string>("");

  const fetchImages = async () => {
    try {
      // Chỉ dùng Server API
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_SERVER_URL;
      if (!apiBaseUrl) {
        throw new Error('NEXT_PUBLIC_API_SERVER_URL is not defined. Please set it in your .env file.');
      }
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const url = `${apiBaseUrl}/image`;
      console.log('Fetching images from:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: headers,
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch images`);
      }
      
      const data = await response.json();
      setImages(data.images || []);
    } catch (error: any) {
      console.error('Error fetching images:', error);
      
      // Hiển thị thông báo lỗi chi tiết hơn
      if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_SERVER_URL;
      if (!apiBaseUrl) {
        throw new Error('NEXT_PUBLIC_API_SERVER_URL is not defined. Please set it in your .env file.');
      }
        console.error(`❌ Không thể kết nối đến Server API tại ${apiBaseUrl}`);
        console.error('Vui lòng kiểm tra:');
        console.error('1. Server API có đang chạy không? (https://ecobacgiang.vn)');
        console.error('2. URL có đúng không?');
        console.error('3. CORS có được cấu hình đúng không?');
      }
      
      setImages([]);
    }
  };

  const handleImageUpload = async (image: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", image);
      
      // Chỉ dùng Server API
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_SERVER_URL;
      if (!apiBaseUrl) {
        throw new Error('NEXT_PUBLIC_API_SERVER_URL is not defined. Please set it in your .env file.');
      }
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${apiBaseUrl}/image`, {
        method: 'POST',
        headers: headers,
        body: formData,
      });
      
      const data = await response.json();
      setUploading(false);
      setImages([data, ...images]);
    } catch (error) {
      console.error('Error uploading image:', error);
      setUploading(false);
    }
  };

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Link.configure({
        autolink: false,
        linkOnPaste: false,
        openOnClick: false,
        HTMLAttributes: {
          target: "",
        },
      }),
      Placeholder.configure({
        placeholder: "Viết mô tả sản phẩm chuẩn SEO",
      }),
      Youtube.configure({
        HTMLAttributes: {
          class: "w-full aspect-video",
        },
      }),
      TipTapImage.configure({
        HTMLAttributes: {
          class: "mx-auto",
        },
        allowBase64: true,
      }).extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            'data-show-caption': {
              default: 'true',
              parseHTML: element => element.getAttribute('data-show-caption'),
              renderHTML: attributes => {
                if (!attributes['data-show-caption']) {
                  return {};
                }
                return {
                  'data-show-caption': attributes['data-show-caption'],
                };
              },
            },
          };
        },
      }),
    ],
    editorProps: {
      handleClick(view, pos, event) {
        const { state } = view;
        const selectionRange = getMarkRange(
          state.doc.resolve(pos),
          state.schema.marks.link
        );
        if (selectionRange) setSelectionRange(selectionRange);
      },
      attributes: {
        class:
          "blog prose prose-lg focus:outline-none dark:prose-invert max-w-full mx-auto h-full",
      },
    },
    content: content, // Set initial content
    onUpdate: ({ editor }) => {
      // Mark this as internal update to prevent sync loop
      isInternalUpdateRef.current = true;
      const newContent = editor.getHTML();
      previousContentRef.current = newContent;
      onChange(newContent); // Update parent on content change
      // Reset flag after a short delay
      setTimeout(() => {
        isInternalUpdateRef.current = false;
      }, 0);
    },
  });

  const handleImageSelection = (result: ImageSelectionResult) => {
    editor
      ?.chain()
      .focus()
      .setImage({ src: result.src, alt: result.altText })
      .run();
  };

  useEffect(() => {
    if (editor && selectionRange) {
      editor.commands.setTextSelection(selectionRange);
    }
  }, [editor, selectionRange]);

  useEffect(() => {
    fetchImages();
  }, []);


  useEffect(() => {
    if (editor) {
      // Only sync content if:
      // 1. It's not an internal update (user typing)
      // 2. Content is different from current editor content
      // 3. Content is different from previous synced content
      const currentContent = editor.getHTML();
      
      // Skip if this is an internal update (user is typing)
      if (isInternalUpdateRef.current) {
        return;
      }
      
      // Only update if content actually changed and is different from editor content
      if (currentContent !== content && content !== previousContentRef.current) {
        // This is an external update (e.g., from parent component reset or initial load)
        // If editor is focused, don't update to avoid interrupting user
        if (editor.isFocused) {
          // User is actively editing, don't sync external changes
          return;
        }
        
        // Save current selection before updating content
        const { from, to } = editor.state.selection;
        
        // Update content without emitting update event
        editor.commands.setContent(content, false);
        previousContentRef.current = content;
        
        // Restore selection
        setTimeout(() => {
          if (editor && !editor.isDestroyed) {
            const docSize = editor.state.doc.content.size;
            const safeFrom = Math.min(from, docSize);
            const safeTo = Math.min(to, docSize);
            editor.commands.setTextSelection({ from: safeFrom, to: safeTo });
          }
        }, 0);
      } else if (currentContent === content) {
        // Content matches, update previousContentRef to prevent unnecessary updates
        previousContentRef.current = content;
      }
    }
  }, [content, editor]);

  return (
    <>
      <div className="editor-container border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-slate-900 transition">
        {/* Fixed Toolbar - Sticky when scrolling content */}
        <div className="sticky top-0 z-20 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
          <ToolBar
            editor={editor}
            onOpenImageClick={() => setShowGallery(true)}
          />
        </div>

        {/* Scrollable Content Area */}
        <div className="overflow-y-auto max-h-[700px] p-4">
          {editor ? (
            <>
              <EditLink editor={editor} />
              <EditImage editor={editor} />
            </>
          ) : null}
          <EditorContent 
            editor={editor} 
            className="min-h-[300px] prose max-w-full mx-auto focus:outline-none" 
          />
        </div>
      </div>

      <GalleryModal
        visible={showGallery}
        onClose={() => setShowGallery(false)}
        onSelect={handleImageSelection}
        onFileSelect={handleImageUpload}
        uploading={uploading}
        images={images}
      />
    </>
  );
};

export default Editor;

