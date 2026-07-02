"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { FontFamily } from "@tiptap/extension-font-family";
import { Bold, Italic, Underline as UnderlineIcon, Strikethrough } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { plainTextToHtml } from "@/lib/articleContent";
import { FontSize } from "@/lib/tiptap/fontSize";
import {
 WORD_THEME_COLORS,
 WORD_STANDARD_COLORS,
 normalizeHexColor,
} from "@/lib/wordColors";
import { WORD_FONT_FAMILIES } from "@/lib/wordFonts";

const FONT_FAMILIES = [
 { label: "Varsayılan - İnter", value: "", hint: "Inter — site gövde yazı tipi" },
 { label: "Times New Roman", value: "'Times New Roman', Times, serif" },
 ...WORD_FONT_FAMILIES,
];

const FONT_SIZES = [
 { label: "8px", value: "8px" },
 { label: "9px", value: "9px" },
 { label: "10px", value: "10px" },
 { label: "11px", value: "11px" },
 { label: "12px", value: "12px" },
 { label: "13px", value: "13px" },
 { label: "14px", value: "14px" },
 { label: "15px", value: "15px" },
 { label: "16px", value: "", hint: "Varsayılan gövde boyutu" },
 { label: "17px", value: "17px" },
 { label: "18px", value: "18px" },
 { label: "19px", value: "19px" },
 { label: "20px", value: "20px" },
 { label: "21px", value: "21px" },
 { label: "22px", value: "22px" },
 { label: "23px", value: "23px" },
 { label: "24px", value: "24px" },
 { label: "25px", value: "25px" },
 { label: "26px", value: "26px" },
 { label: "27px", value: "27px" },
 { label: "28px", value: "28px" },
 { label: "29px", value: "29px" },
 { label: "30px", value: "30px" },
 { label: "31px", value: "31px" },
 { label: "32px", value: "32px" },
 { label: "33px", value: "33px" },
 { label: "34px", value: "34px" },
 { label: "35px", value: "35px" },
 { label: "36px", value: "36px" },
 { label: "37px", value: "37px" },
 { label: "38px", value: "38px" },
 { label: "39px", value: "39px" },
 { label: "40px", value: "40px" },
 { label: "41px", value: "41px" },
 { label: "42px", value: "42px" },
 { label: "43px", value: "43px" },
 { label: "44px", value: "44px" },
 { label: "45px", value: "45px" },
 { label: "46px", value: "46px" },
 { label: "47px", value: "47px" },
 { label: "48px", value: "48px" },
 { label: "49px", value: "49px" },
 { label: "50px", value: "50px" },
];


function isLightColor(hex) {
 if (!hex) return false;
 const r = parseInt(hex.slice(1, 3), 16);
 const g = parseInt(hex.slice(3, 5), 16);
 const b = parseInt(hex.slice(5, 7), 16);
 return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.72;
}

const BODY_TEXT_COLOR = "#4f4a3f";
const DEFAULT_FONT_FAMILY = "var(--font-sans), Inter, sans-serif";

function cssColorToHex(color) {
 if (!color) return "";
 if (color.startsWith("#")) return color.toUpperCase();

 const rgb = color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/);
 if (!rgb) return "";

 return `#${[rgb[1], rgb[2], rgb[3]]
  .map((channel) => Number(channel).toString(16).padStart(2, "0"))
  .join("")
  .toUpperCase()}`;
}

function getEditorTextColor(editor) {
 if (!editor) return "";

 const { color } = editor.getAttributes("textStyle");
 if (color) return color.toUpperCase();

 const { from, to } = editor.state.selection;
 if (from === to) return "";

 try {
  const dom = editor.view.domAtPos(from);
  const node =
   dom.node.nodeType === Node.TEXT_NODE ? dom.node.parentElement : dom.node;

  if (!(node instanceof HTMLElement)) return "";

  return cssColorToHex(window.getComputedStyle(node).color);
 } catch {
  return "";
 }
}

function getPrimaryFontFamilyName(fontFamily) {
 if (!fontFamily) return "";

 return fontFamily
  .replace(/['"]/g, "")
  .split(",")[0]
  .trim();
}

function findFontFamilyOption(fontFamily, options) {
 if (!fontFamily) {
  return options.find((option) => !option.value) || options[0];
 }

 const primary = getPrimaryFontFamilyName(fontFamily).toLowerCase();

 return options.find((option) => {
  if (!option.value) return false;

  return getPrimaryFontFamilyName(option.value).toLowerCase() === primary;
 });
}

function FontFamilyToolbarSelect({ value, onValueChange, options, className, listClassName }) {
 const matchedOption = findFontFamilyOption(value, options);
 const selectValue = matchedOption?.value || "__default__";
 const previewFamily = matchedOption?.value || value || DEFAULT_FONT_FAMILY;
 const displayLabel = matchedOption?.label || getPrimaryFontFamilyName(value) || "Varsayılan - İnter";

 return (
  <Select value={selectValue} onValueChange={(v) => onValueChange(v === "__default__" ? "" : v)}>
   <SelectTrigger
    className={cn("h-9 min-w-[168px] max-w-[220px] text-xs", className)}
    aria-label="Yazı tipi"
   >
    <span className="min-w-0 truncate" style={{ fontFamily: previewFamily }}>
     {displayLabel}
    </span>
   </SelectTrigger>
   <SelectContent className={cn("max-h-72 min-w-[240px]", listClassName)}>
    {options.map((option) => {
     const itemFamily = option.value || DEFAULT_FONT_FAMILY;

     return (
      <SelectItem
       key={option.label}
       value={option.value || "__default__"}
       title={option.hint}
       className="pl-8"
      >
       <span className="truncate text-sm" style={{ fontFamily: itemFamily }}>
        {option.label}
       </span>
      </SelectItem>
     );
    })}
   </SelectContent>
  </Select>
 );
}

function ColorSwatch({ color, className, size = "sm", square = false }) {
 const isLight = isLightColor(color);
 const sizeClass = square
  ? size === "lg"
   ? "h-5 w-5"
   : size === "md"
    ? "h-4 w-4"
    : "h-3.5 w-3.5"
  : size === "lg"
   ? "h-6 w-6"
   : size === "md"
    ? "h-5 w-5"
    : "h-3.5 w-3.5";

 return (
  <span
   className={cn(
    "inline-block shrink-0 border shadow-sm transition-all duration-150",
    square ? "rounded-sm" : "rounded-full",
    sizeClass,
    isLight ? "border-gray-400 dark:border-gray-500" : "border-black/10 dark:border-white/20",
    className
   )}
   style={{ backgroundColor: color || BODY_TEXT_COLOR }}
  />
 );
}

function ColorGridButton({ hex, label, selected, onPick }) {
 const isLight = isLightColor(hex);

 return (
  <button
   type="button"
   title={hex}
   aria-label={label || hex}
   aria-pressed={selected}
   onMouseDown={(event) => event.preventDefault()}
   onClick={() => onPick(hex)}
   className={cn(
    "h-5 w-5 cursor-pointer rounded-sm border shadow-sm transition-transform hover:scale-110",
    isLight ? "border-gray-400 dark:border-gray-500" : "border-black/10 dark:border-white/20",
    selected && "ring-2 ring-primary dark:ring-primary-dark"
   )}
   style={{ backgroundColor: hex }}
  />
 );
}

function ColorToolbarSelect({ editor, value, getColor, className }) {
 const [open, setOpen] = useState(false);
 const [hexInput, setHexInput] = useState("");
 const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
 const inputRef = useRef(null);
 const triggerRef = useRef(null);
 const savedSelectionRef = useRef(null);
 const triggerColor = value || BODY_TEXT_COLOR;
 const previewHex = (hexInput ? normalizeHexColor(`#${hexInput}`) : null) || value || BODY_TEXT_COLOR;

 function updateMenuPosition() {
  if (!triggerRef.current) return;

  const rect = triggerRef.current.getBoundingClientRect();
  setMenuPosition({
   top: rect.bottom + 4,
   left: rect.left,
  });
 }

 function captureSelection() {
  if (!editor) return;

  const { from, to } = editor.state.selection;
  savedSelectionRef.current = { from, to };
 }

 function applyColor(color) {
  if (!editor) return;

  const saved = savedSelectionRef.current;
  let chain = editor.chain().focus();

  if (saved && saved.from !== saved.to) {
   chain = chain.setTextSelection(saved);
  }

  if (!color) {
   chain.unsetColor().run();
  } else {
   chain.setColor(color).run();
  }

  setOpen(false);
 }

 function syncHexFromSelection() {
  const color = (getColor?.() || value || "").replace(/^#/, "").toUpperCase();
  setHexInput(color);
 }

 useEffect(() => {
  if (!open) return;
  syncHexFromSelection();
  updateMenuPosition();

  function handleReposition() {
   updateMenuPosition();
  }

  window.addEventListener("resize", handleReposition);
  window.addEventListener("scroll", handleReposition, true);

  return () => {
   window.removeEventListener("resize", handleReposition);
   window.removeEventListener("scroll", handleReposition, true);
  };
 }, [open, value]);

 function toggleOpen() {
  if (!open) {
   captureSelection();
   syncHexFromSelection();
   updateMenuPosition();
  }
  setOpen((current) => !current);
 }

 function applyHexInput() {
  const normalized = hexInput ? normalizeHexColor(`#${hexInput}`) : "";

  if (normalized) {
   applyColor(normalized);
   return;
  }

  if (!hexInput.trim()) {
   applyColor("");
  }
 }

 function pickColor(hex) {
  applyColor(hex);
 }

 const colorMenu = open ? (
  <>
   <button
    type="button"
    aria-label="Renk paletini kapat"
    className="fixed inset-0 z-40 cursor-default"
    onClick={() => setOpen(false)}
   />
   <div
    className="fixed z-50 w-62 rounded-xl border border-gray-200 bg-white p-3 shadow-lg dark:border-dark-500 dark:bg-dark-800"
    style={{ top: menuPosition.top, left: menuPosition.left }}
   >
    <p className="mb-1.5 px-0.5 text-[11px] font-medium text-gray-500 dark:text-dark-200">Varsayılan Renk</p>
    <button
     type="button"
     title={`Varsayılan — ${BODY_TEXT_COLOR}`}
     aria-label="Varsayılan renk"
     aria-pressed={!value}
     onMouseDown={(event) => event.preventDefault()}
     onClick={() => pickColor("")}
     className={cn(
      "mb-3 flex w-full cursor-pointer items-center gap-2 rounded-lg px-1 py-1.5 transition-colors hover:bg-gray-50 dark:hover:bg-dark-700",
      !value && "bg-primary/10 ring-1 ring-primary/30 dark:bg-primary-dark/15 dark:ring-primary-dark/30"
     )}
    >
     <ColorSwatch color={BODY_TEXT_COLOR} size="md" square className="h-5 w-5" />
     <span className="min-w-0 flex-1 text-left text-xs text-gray-900 dark:text-gray-50">Varsayılan</span>
     <span className="font-mono text-[10px] uppercase text-gray-500 dark:text-dark-200">
      {BODY_TEXT_COLOR}
     </span>
    </button>

    <div className="mb-3 flex items-center gap-2">
     <ColorSwatch color={previewHex} size="md" className="h-4 w-4 shrink-0" square />
     <div className="flex min-w-0 flex-1 items-center overflow-hidden rounded-xl border border-gray-300 bg-white focus-within:ring-2 focus-within:ring-primary/40 dark:border-dark-500 dark:bg-dark-800 dark:focus-within:ring-primary-dark/40">
      <span className="pl-2.5 font-mono text-xs text-gray-500 dark:text-dark-200">#</span>
      <input
       ref={inputRef}
       value={hexInput}
       onChange={(event) => {
        setHexInput(
         event.target.value.replace(/[^0-9A-Fa-f]/g, "").slice(0, 6).toUpperCase()
        );
       }}
       onKeyDown={(event) => {
        if (event.key === "Enter") {
         event.preventDefault();
         applyHexInput();
        }
        if (event.key === "Escape") {
         event.preventDefault();
         setOpen(false);
        }
       }}
       spellCheck={false}
       aria-label="Hex renk kodu"
       className="h-8 w-full min-w-0 border-0 bg-transparent px-1.5 font-mono text-xs uppercase text-gray-900 outline-none dark:text-gray-50"
      />
     </div>
    </div>

    <p className="mb-1.5 px-0.5 text-[11px] font-medium text-gray-500 dark:text-dark-200">Tema Renkleri</p>
    <div className="mb-3 grid grid-cols-10 gap-1">
     {WORD_THEME_COLORS.map((hex, index) => (
      <ColorGridButton
       key={`theme-${index}`}
       hex={hex}
       label={`Tema ${index + 1}`}
       selected={value?.toUpperCase() === hex.toUpperCase()}
       onPick={pickColor}
      />
     ))}
    </div>

    <p className="mb-1.5 px-0.5 text-[11px] font-medium text-gray-500 dark:text-dark-200">Standart Renkler</p>
    <div className="grid grid-cols-10 gap-1">
     {WORD_STANDARD_COLORS.map((hex, index) => (
      <ColorGridButton
       key={`standard-${index}`}
       hex={hex}
       label={`Standart ${index + 1}`}
       selected={value?.toUpperCase() === hex.toUpperCase()}
       onPick={pickColor}
      />
     ))}
    </div>
   </div>
  </>
 ) : null;

 return (
  <div className="relative">
   <button
    ref={triggerRef}
    type="button"
    aria-label="Renk"
    title="Renk"
    onMouseDown={(event) => {
     event.preventDefault();
     captureSelection();
    }}
    onClick={toggleOpen}
    className={cn(
     "flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-gray-300 bg-white shadow-none dark:border-dark-500 dark:bg-dark-800",
     "hover:bg-gray-50 dark:hover:bg-dark-700",
     "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 dark:focus-visible:ring-primary-dark/40",
     className
    )}
   >
    <ColorSwatch color={triggerColor} size="md" className="h-4 w-4" />
   </button>

   {typeof document !== "undefined" && colorMenu
    ? createPortal(colorMenu, document.body)
    : null}
  </div>
 );
}

function ToolbarButton({ active, onClick, children, title }) {
 return (
  <Button
   type="button"
   variant={active ? "subtle" : "ghost"}
   size="icon"
   className={cn("h-9 w-9 shrink-0", active && "bg-primary/15 dark:bg-primary-dark/20")}
   onMouseDown={(event) => event.preventDefault()}
   onClick={onClick}
   title={title}
  >
   {children}
  </Button>
 );
}

function ToolbarSelect({ value, onValueChange, ariaLabel, options, className, listClassName }) {
 return (
  <Select value={value || "__default__"} onValueChange={(v) => onValueChange(v === "__default__" ? "" : v)}>
   <SelectTrigger className={cn("h-9 min-w-[168px] max-w-[220px] text-xs", className)} aria-label={ariaLabel}>
    <SelectValue placeholder={ariaLabel} />
   </SelectTrigger>
   <SelectContent className={cn("max-h-72", listClassName)}>
    {options.map((option) => (
     <SelectItem
      key={option.label}
      value={option.value || "__default__"}
      title={option.hint}
     >
      {option.label}
     </SelectItem>
    ))}
   </SelectContent>
  </Select>
 );
}

export default function RichTextEditor({
 value,
 onChange,
 className,
 editorMinHeight = "320px",
}) {
 const [, refreshToolbar] = useState(0);
 const editorContentClass = cn(
  "px-4 py-3 text-sm md:text-base leading-relaxed text-gray-900 dark:text-gray-50 focus:outline-none",
  editorMinHeight === "320px" ? "min-h-[320px]" : null
 );

 const editor = useEditor({
  immediatelyRender: false,
  extensions: [
   StarterKit.configure({
    heading: { levels: [2, 3] },
   }),
   Underline,
   TextStyle,
   Color,
   FontFamily,
   FontSize,
  ],
  content: plainTextToHtml(value || ""),
  editorProps: {
   attributes: {
    class: editorContentClass,
    ...(editorMinHeight !== "320px" ? { style: `min-height: ${editorMinHeight}` } : {}),
   },
  },
  onUpdate: ({ editor: currentEditor }) => {
   onChange(currentEditor.getHTML());
   refreshToolbar((tick) => tick + 1);
  },
  onSelectionUpdate: () => {
   refreshToolbar((tick) => tick + 1);
  },
 });

 useEffect(() => {
  if (!editor) return;

  const nextContent = plainTextToHtml(value || "");
  const currentContent = editor.getHTML();

  if (nextContent !== currentContent) {
   editor.commands.setContent(nextContent, false);
  }
 }, [editor, value]);

 if (!editor) {
  return (
   <div
    className={cn(
     "rounded-xl border border-gray-300 dark:border-dark-500 bg-white dark:bg-dark-800",
     editorMinHeight === "320px" ? "min-h-[380px]" : null,
     className
    )}
    style={editorMinHeight === "320px" ? undefined : { minHeight: `calc(${editorMinHeight} + 60px)` }}
   />
  );
 }

 const currentColor = getEditorTextColor(editor);
 const currentFontFamily = editor.getAttributes("textStyle").fontFamily || "";
 const currentFontSize = editor.getAttributes("textStyle").fontSize || "";

 return (
  <div
   className={cn(
    "rounded-xl border border-gray-300 dark:border-dark-500 bg-white dark:bg-dark-800",
    className
   )}
  >
   <div className="flex flex-wrap items-center gap-1 overflow-visible border-b border-gray-200 dark:border-dark-500/60 bg-gray-50/80 dark:bg-dark-900/40 p-2">
    <ToolbarButton
     active={editor.isActive("bold")}
     onClick={() => editor.chain().focus().toggleBold().run()}
     title="Kalın"
    >
     <Bold />
    </ToolbarButton>
    <ToolbarButton
     active={editor.isActive("italic")}
     onClick={() => editor.chain().focus().toggleItalic().run()}
     title="İtalik"
    >
     <Italic />
    </ToolbarButton>
    <ToolbarButton
     active={editor.isActive("underline")}
     onClick={() => editor.chain().focus().toggleUnderline().run()}
     title="Altı çizili"
    >
     <UnderlineIcon />
    </ToolbarButton>
    <ToolbarButton
     active={editor.isActive("strike")}
     onClick={() => editor.chain().focus().toggleStrike().run()}
     title="Üstü çizili"
    >
     <Strikethrough />
    </ToolbarButton>

    <div className="mx-1 h-6 w-px bg-gray-300 dark:bg-dark-500" />

    <ColorToolbarSelect
     editor={editor}
     value={currentColor}
     getColor={() => getEditorTextColor(editor)}
    />

    <FontFamilyToolbarSelect
     value={currentFontFamily}
     onValueChange={(fontFamily) => {
      if (!fontFamily) {
       editor.chain().focus().unsetFontFamily().run();
       return;
      }
      editor.chain().focus().setFontFamily(fontFamily).run();
     }}
     options={FONT_FAMILIES}
     listClassName="max-h-80"
    />

    <ToolbarSelect
     ariaLabel="Boyut"
     value={currentFontSize}
     onValueChange={(fontSize) => {
      if (!fontSize) {
       editor.chain().focus().unsetFontSize().run();
       return;
      }
      editor.chain().focus().setFontSize(fontSize).run();
     }}
     options={FONT_SIZES}
     className="h-9 w-17 min-w-0 max-w-none shrink-0 px-2"
    />

   </div>
   <div className="overflow-hidden rounded-b-xl">
    <EditorContent editor={editor} />
   </div>
  </div>
 );
}
