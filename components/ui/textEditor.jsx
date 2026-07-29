"use client";

import React, { useState, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import Underline from "@tiptap/extension-underline";
import { ImagePlus, ImageUp } from "lucide-react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import DOMPurify from "dompurify";

const TextEditor = ({ value, onChange, className }) => {
  const [isMounted, setIsMounted] = useState(false);
  const [uploadedHTML, setUploadedHTML] = useState(null);

  useEffect(() => setIsMounted(true), []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Underline,
      Link.configure({ openOnClick: false }),
      Image.configure({
        allowBase64: true,
        HTMLAttributes: { style: "max-width: 100%; height: auto;" },
      }),
    ],
    content: value || "",
    editable: !uploadedHTML, // disable editor if HTML uploaded
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      if (!uploadedHTML && onChange) onChange(editor.getHTML());
    },
    editorProps: {
      handlePaste(view, event) {
        const items = event.clipboardData?.items;

        for (const item of items || []) {
          if (item.type.startsWith("image")) {
            const file = item.getAsFile();
            const reader = new FileReader();
            reader.onload = () => {
              const src = reader.result;
              const node = view.state.schema.nodes.image.create({ src });
              view.dispatch(view.state.tr.replaceSelectionWith(node));
            };
            reader.readAsDataURL(file);
            return true;
          }
        }

        const html = event.clipboardData.getData("text/html");
        if (html) {
          editor.chain().focus().insertContent(html).run();
          return true;
        }

        const text = event.clipboardData.getData("text/plain");
        if (text) {
          editor.chain().focus().insertContent(text).run();
          return true;
        }

        return false;
      },
    },
  });

  const handleHTMLUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.includes("html")) {
      alert("Please upload a valid HTML file.");
      return;
    }
    const text = await file.text();
    const sanitized = DOMPurify.sanitize(text, {
      USE_PROFILES: { html: true },
    });
    setUploadedHTML(sanitized);
    onChange && onChange(sanitized);
  };

  if (!isMounted || !editor) return null;

  const ToolbarButton = ({ onClick, title, children, isActive = false }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`px-2 py-1 text-sm rounded transition-colors ${
        isActive
          ? "bg-blue-100 dark:bg-blue-900"
          : "hover:bg-gray-200 dark:hover:bg-gray-700"
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="relative border rounded-lg overflow-hidden dark:border-gray-700">
      {/* Upload HTML */}
      <div className="p-2 bg-gray-50 dark:bg-gray-800 border-b flex items-center gap-2">
        <label className="px-3 py-1 bg-blue-500 text-white rounded cursor-pointer hover:bg-blue-600">
          Upload HTML
          <input
            type="file"
            accept=".html,.htm"
            className="hidden"
            onChange={handleHTMLUpload}
          />
        </label>
        {uploadedHTML && (
          <span className="text-sm text-red-600 dark:text-red-400">
            HTML uploaded — editor is disabled.
          </span>
        )}
      </div>

      {/* Toolbar */}
      {!uploadedHTML && (
        <div className="flex gap-1 p-2 bg-gray-50 dark:bg-gray-800 border-b">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            title="Bold"
            isActive={editor.isActive("bold")}
          >
            <strong>B</strong>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            title="Italic"
            isActive={editor.isActive("italic")}
          >
            <em>I</em>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            title="Underline"
            isActive={editor.isActive("underline")}
          >
            <u>U</u>
          </ToolbarButton>
          <div className="w-px bg-gray-300 dark:bg-gray-600 mx-1" />
          <ToolbarButton
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
            title="Heading 1"
            isActive={editor.isActive("heading", { level: 1 })}
          >
            H1
          </ToolbarButton>
          <ToolbarButton
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            title="Heading 2"
            isActive={editor.isActive("heading", { level: 2 })}
          >
            H2
          </ToolbarButton>
          <ToolbarButton
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
            title="Heading 3"
            isActive={editor.isActive("heading", { level: 3 })}
          >
            H3
          </ToolbarButton>
          <div className="w-px bg-gray-300 dark:bg-gray-600 mx-1" />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            title="Bullet List"
            isActive={editor.isActive("bulletList")}
          >
            • List
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            title="Ordered List"
            isActive={editor.isActive("orderedList")}
          >
            1. List
          </ToolbarButton>
          <div className="w-px bg-gray-300 dark:bg-gray-600 mx-1" />
          <ToolbarButton
            onClick={() => {
              const url = prompt("Enter URL:");
              if (url) {
                editor.chain().focus().setLink({ href: url }).run();
              }
            }}
            title="Add Link"
            isActive={editor.isActive("link")}
          >
            Link
          </ToolbarButton>
          <ToolbarButton
            onClick={() => {
              const url = prompt("Enter image URL or base64:");
              if (url) {
                editor.chain().focus().setImage({ src: url }).run();
              }
            }}
            title="Add Image"
          >
            <ImagePlus className="size-5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => {
              const input = document.createElement("input");
              input.type = "file";
              input.accept = "image/*";
              input.onchange = async (e) => {
                const file = e.target.files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = () => {
                    editor
                      .chain()
                      .focus()
                      .setImage({ src: reader.result })
                      .run();
                  };
                  reader.readAsDataURL(file);
                }
              };
              input.click();
            }}
            title="Upload Image"
          >
            <ImageUp className="size-5" />
          </ToolbarButton>
        </div>
      )}

      {/* Editor or uploaded HTML */}
      <div
        className={`bg-white dark:bg-gray-900 flex-1 ${className} p-3 min-h-[200px] overflow-auto`}
      >
        {uploadedHTML ? (
          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: uploadedHTML }}
          />
        ) : (
          <EditorContent editor={editor} />
        )}
      </div>
    </div>
  );
};

export default TextEditor;
