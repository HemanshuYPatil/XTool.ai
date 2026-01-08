"use client";

import React, { useState } from "react";
import { useCanvas } from "@/context/canvas-context";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import { ScrollArea } from "../ui/scroll-area";
import { 
  Type, 
  Layout as LayoutIcon, 
  Palette, 
  MousePointer2, 
  X, 
  Settings2, 
  Box, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  ArrowRight,
  Smile,
  ChevronDown,
  ChevronRight,
  EyeOff
} from "lucide-react";
import { cn } from "@/lib/utils";
import Script from "next/script";

type TabType = "design" | "layout" | "content";

const colorSwatches = [
  "#0f172a",
  "#111827",
  "#1f2937",
  "#ffffff",
  "#f97316",
  "#22c55e",
  "#3b82f6",
  "#a855f7",
  "#ec4899",
];

const CollapsibleSection = ({ 
  title, 
  icon: Icon, 
  children, 
  defaultOpen = true 
}: { 
  title: string; 
  icon: React.ElementType; 
  children: React.ReactNode; 
  defaultOpen?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="space-y-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-1 text-muted-foreground hover:text-foreground transition-colors group"
      >
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-muted/30 group-hover:bg-muted/50 transition-colors">
            <Icon className="size-3.5" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider">{title}</span>
        </div>
        {isOpen ? <ChevronDown className="size-3" /> : <ChevronRight className="size-3" />}
      </button>
      {isOpen && <div className="space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">{children}</div>}
    </div>
  );
};

const TabButton = ({ 
  id, 
  label, 
  icon: Icon, 
  isActive, 
  onClick 
}: { 
  id: TabType; 
  label: string; 
  icon: React.ElementType; 
  isActive: boolean; 
  onClick: (id: TabType) => void;
}) => (
  <button
    onClick={() => onClick(id)}
    className={cn(
      "flex-1 flex flex-col items-center gap-1 py-2 text-[10px] font-medium transition-all border-b-2",
      isActive
        ? "border-primary text-primary bg-primary/5" 
        : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
    )}
  >
    <Icon className="size-3.5" />
    {label}
  </button>
);

const ColorSwatchGrid = ({ 
  currentValue, 
  onSelect, 
  prefix 
}: { 
  currentValue: string; 
  onSelect: (color: string) => void; 
  prefix: string;
}) => (
  <div className="grid grid-cols-9 gap-1.5 py-1">
    {colorSwatches.map((color) => (
      <button
        key={`${prefix}-${color}`}
        type="button"
        onClick={() => onSelect(color)}
        className={cn(
          "size-5 rounded-full border shadow-sm hover:scale-110 transition-all relative",
          currentValue === color && "ring-2 ring-primary ring-offset-1 ring-offset-background"
        )}
        style={{ backgroundColor: color }}
        title={color}
      >
        {currentValue === color && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={cn("size-1 rounded-full", color === "#ffffff" ? "bg-black" : "bg-white")} />
          </div>
        )}
      </button>
    ))}
  </div>
);

export const EditingSidebar = ({ isEditMode }: { isEditMode: boolean }) => {
  const { selectedElement, setSelectedElement, updateElement } = useCanvas();
  const [activeTab, setActiveTab] = useState<TabType>("design");
  const [panelMode, setPanelMode] = useState<"simple" | "advanced">("simple");
  const [isVisible, setIsVisible] = useState(true);

  if (!isEditMode) return null;

  const { frameId, elementInfo } = selectedElement || {};
  const { tagName, styles, text, type, attributes } = elementInfo || {};
  const safeStyles = styles || {};
  const safeAttributes = attributes || {};

  const handleStyleChange = (key: string, value: string) => {
    if (!frameId) return;
    updateElement(frameId, {
      styles: { [key]: value },
    });
  };

  const handleAttributeChange = (key: string, value: string) => {
    if (!frameId) return;
    updateElement(frameId, {
      attributes: { [key]: value },
    });
  };

  const handleTextChange = (value: string) => {
    if (!frameId) return;
    updateElement(frameId, {
      text: value,
    });
  };

  if (!isVisible && selectedElement) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed right-4 top-20 z-60 p-3 bg-background/80 backdrop-blur-xl border border-primary/20 rounded-full shadow-xl hover:bg-primary/10 transition-all group"
      >
        <Settings2 className="size-5 text-primary group-hover:rotate-90 transition-transform duration-300" />
      </button>
    );
  }

  return (
    <>
      <Script src="https://code.iconify.design/iconify-icon/3.0.0/iconify-icon.min.js" strategy="afterInteractive" />
      <div className="fixed right-0 top-0 h-screen w-80 bg-background/80 backdrop-blur-xl border-l border-border/40 shadow-2xl z-60 flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-4 border-b border-border/40 flex items-center justify-between bg-muted/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl border border-primary/20 shadow-inner">
              <Settings2 className="size-4 text-primary" />
            </div>
            <div>
              <h2 className="font-bold text-sm leading-none tracking-tight">Properties</h2>
              <p className="text-[9px] text-muted-foreground uppercase tracking-[0.2em] mt-1.5 font-black opacity-70">
                {selectedElement ? type || tagName : "No selection"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsVisible(false)}
              className="p-2 hover:bg-muted/50 rounded-lg transition-colors text-muted-foreground hover:text-foreground"
              title="Hide Sidebar"
            >
              <EyeOff className="size-3.5" />
            </button>
            <button
              onClick={() => setSelectedElement(null)}
              className="p-2 hover:bg-destructive/10 rounded-lg transition-colors text-muted-foreground hover:text-destructive"
              title="Close"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border/40 bg-background/40">
          <button
            onClick={() => setPanelMode("simple")}
            className={cn(
              "flex-1 rounded-lg border px-3 py-1.5 text-[11px] font-bold transition-all",
              panelMode === "simple"
                ? "border-primary/30 bg-primary/10 text-primary shadow-sm"
                : "border-transparent text-muted-foreground hover:bg-muted/50"
            )}
          >
            Simple
          </button>
          <button
            onClick={() => setPanelMode("advanced")}
            className={cn(
              "flex-1 rounded-lg border px-3 py-1.5 text-[11px] font-bold transition-all",
              panelMode === "advanced"
                ? "border-primary/30 bg-primary/10 text-primary shadow-sm"
                : "border-transparent text-muted-foreground hover:bg-muted/50"
            )}
          >
            Advanced
          </button>
        </div>

        {/* Tabs */}
        {panelMode === "advanced" && (
          <div className="flex border-b border-border/40 bg-muted/5">
            <TabButton id="design" label="Design" icon={Palette} isActive={activeTab === "design"} onClick={setActiveTab} />
            <TabButton id="layout" label="Layout" icon={LayoutIcon} isActive={activeTab === "layout"} onClick={setActiveTab} />
            <TabButton id="content" label="Content" icon={Type} isActive={activeTab === "content"} onClick={setActiveTab} />
          </div>
        )}

        <ScrollArea className="flex-1">
          {!selectedElement ? (
            <div className="p-8">
              <div className="rounded-3xl border border-dashed border-border/60 bg-muted/10 p-8 text-center space-y-4">
                <div className="size-12 bg-muted/20 rounded-2xl flex items-center justify-center mx-auto">
                  <MousePointer2 className="size-6 text-muted-foreground/60" />
                </div>
                <div>
                  <p className="text-sm font-bold">Select an element</p>
                  <p className="mt-2 text-[11px] text-muted-foreground leading-relaxed">
                    Click any element inside the frame to edit its design, layout,
                    or content.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-5 space-y-8">
              {panelMode === "simple" ? (
                <div className="space-y-8">
                  <CollapsibleSection title="Content" icon={Type}>
                    <div className="space-y-3">
                      <Input
                        value={text || ""}
                        onChange={(e) => handleTextChange(e.target.value)}
                        className="bg-muted/30 border-border/40 focus-visible:ring-1 ring-primary/30 text-xs h-9 rounded-lg"
                        placeholder="Edit text..."
                      />
                      {type === "link" && (
                        <Input
                          value={safeAttributes.href || ""}
                          onChange={(e) => handleAttributeChange("href", e.target.value)}
                          className="bg-muted/30 border-border/40 text-xs font-mono h-9 rounded-lg"
                          placeholder="Link URL"
                        />
                      )}
                    </div>
                  </CollapsibleSection>

                  <Separator className="opacity-30" />

                  <CollapsibleSection title="Colors" icon={Palette}>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Background</Label>
                          <Input
                            value={safeStyles.backgroundColor || ""}
                            onChange={(e) => handleStyleChange("backgroundColor", e.target.value)}
                            className="h-7 w-28 text-[10px] font-mono px-2 bg-muted/30 border-border/40 rounded-md"
                          />
                        </div>
                        <ColorSwatchGrid 
                          currentValue={safeStyles.backgroundColor} 
                          onSelect={(color) => handleStyleChange("backgroundColor", color)} 
                          prefix="simple-bg"
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Text</Label>
                          <Input
                            value={safeStyles.color || ""}
                            onChange={(e) => handleStyleChange("color", e.target.value)}
                            className="h-7 w-28 text-[10px] font-mono px-2 bg-muted/30 border-border/40 rounded-md"
                          />
                        </div>
                        <ColorSwatchGrid 
                          currentValue={safeStyles.color} 
                          onSelect={(color) => handleStyleChange("color", color)} 
                          prefix="simple-text"
                        />
                      </div>
                    </div>
                  </CollapsibleSection>

                  <Separator className="opacity-30" />

                  <CollapsibleSection title="Spacing" icon={Box}>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Padding</Label>
                        <Input
                          value={safeStyles.padding || ""}
                          onChange={(e) => handleStyleChange("padding", e.target.value)}
                          className="h-8 text-[10px] px-2 bg-muted/30 border-border/40 rounded-md"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Radius</Label>
                        <Input
                          value={safeStyles.borderRadius || ""}
                          onChange={(e) => handleStyleChange("borderRadius", e.target.value)}
                          className="h-8 text-[10px] px-2 bg-muted/30 border-border/40 rounded-md"
                        />
                      </div>
                      <div className="space-y-2 col-span-2">
                        <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Gap</Label>
                        <Input
                          value={safeStyles.gap || ""}
                          onChange={(e) => handleStyleChange("gap", e.target.value)}
                          className="h-8 text-[10px] px-2 bg-muted/30 border-border/40 rounded-md"
                        />
                      </div>
                    </div>
                  </CollapsibleSection>
                </div>
              ) : (
                <div className="space-y-8">
                  {activeTab === "design" && (
                    <div className="space-y-8">
                      <CollapsibleSection title="Appearance" icon={Palette}>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Background</Label>
                              <div className="flex items-center gap-2">
                                <div 
                                  className="size-5 rounded border border-border/60 shadow-sm" 
                                  style={{ backgroundColor: safeStyles.backgroundColor }}
                                />
                                <Input
                                  value={safeStyles.backgroundColor || ""}
                                  onChange={(e) => handleStyleChange("backgroundColor", e.target.value)}
                                  className="h-7 w-24 text-[10px] font-mono px-2 bg-muted/30 border-border/40 rounded-md"
                                />
                              </div>
                            </div>
                            <ColorSwatchGrid 
                              currentValue={safeStyles.backgroundColor} 
                              onSelect={(color) => handleStyleChange("backgroundColor", color)} 
                              prefix="adv-bg"
                            />
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Text Color</Label>
                              <div className="flex items-center gap-2">
                                <div 
                                  className="size-5 rounded border border-border/60 shadow-sm" 
                                  style={{ backgroundColor: safeStyles.color }}
                                />
                                <Input
                                  value={safeStyles.color || ""}
                                  onChange={(e) => handleStyleChange("color", e.target.value)}
                                  className="h-7 w-24 text-[10px] font-mono px-2 bg-muted/30 border-border/40 rounded-md"
                                />
                              </div>
                            </div>
                            <ColorSwatchGrid 
                              currentValue={safeStyles.color} 
                              onSelect={(color) => handleStyleChange("color", color)} 
                              prefix="adv-text"
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Radius</Label>
                            <Input
                              value={safeStyles.borderRadius || ""}
                              onChange={(e) => handleStyleChange("borderRadius", e.target.value)}
                              className="h-7 w-24 text-[10px] px-2 bg-muted/30 border-border/40 rounded-md"
                            />
                          </div>
                        </div>
                      </CollapsibleSection>

                      <Separator className="opacity-30" />

                      <CollapsibleSection title="Typography" icon={Type}>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                              <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Size</Label>
                              <Input
                                value={safeStyles.fontSize || ""}
                                onChange={(e) => handleStyleChange("fontSize", e.target.value)}
                                className="h-8 text-[10px] px-2 bg-muted/30 border-border/40 rounded-md"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Weight</Label>
                              <Input
                                value={safeStyles.fontWeight || ""}
                                onChange={(e) => handleStyleChange("fontWeight", e.target.value)}
                                className="h-8 text-[10px] px-2 bg-muted/30 border-border/40 rounded-md"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Line</Label>
                              <Input
                                value={safeStyles.lineHeight || ""}
                                onChange={(e) => handleStyleChange("lineHeight", e.target.value)}
                                className="h-8 text-[10px] px-2 bg-muted/30 border-border/40 rounded-md"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Spacing</Label>
                              <Input
                                value={safeStyles.letterSpacing || ""}
                                onChange={(e) => handleStyleChange("letterSpacing", e.target.value)}
                                className="h-8 text-[10px] px-2 bg-muted/30 border-border/40 rounded-md"
                              />
                            </div>
                          </div>

                          <div className="flex items-center gap-1 p-1 bg-muted/20 rounded-xl border border-border/40">
                            <button 
                              onClick={() => handleStyleChange("textAlign", "left")}
                              className={cn("flex-1 py-2 rounded-lg flex justify-center transition-all", safeStyles.textAlign === "left" ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground")}
                            >
                              <AlignLeft className="size-3.5" />
                            </button>
                            <button 
                              onClick={() => handleStyleChange("textAlign", "center")}
                              className={cn("flex-1 py-2 rounded-lg flex justify-center transition-all", safeStyles.textAlign === "center" ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground")}
                            >
                              <AlignCenter className="size-3.5" />
                            </button>
                            <button 
                              onClick={() => handleStyleChange("textAlign", "right")}
                              className={cn("flex-1 py-2 rounded-lg flex justify-center transition-all", safeStyles.textAlign === "right" ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground")}
                            >
                              <AlignRight className="size-3.5" />
                            </button>
                          </div>
                        </div>
                      </CollapsibleSection>
                    </div>
                  )}

                  {activeTab === "layout" && (
                    <div className="space-y-8">
                      <CollapsibleSection title="Display" icon={LayoutIcon}>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Mode</Label>
                            <select
                              value={safeStyles.display || "block"}
                              onChange={(e) => handleStyleChange("display", e.target.value)}
                              className="h-8 w-28 text-[10px] bg-muted/30 border border-border/40 rounded-md px-2 outline-none focus:ring-1 ring-primary/30"
                            >
                              <option value="block">Block</option>
                              <option value="flex">Flex</option>
                              <option value="grid">Grid</option>
                            </select>
                          </div>

                          {safeStyles.display === "grid" && (
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1.5">
                                <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Columns</Label>
                                <Input
                                  value={safeStyles.gridTemplateColumns || ""}
                                  onChange={(e) =>
                                    handleStyleChange("gridTemplateColumns", e.target.value)
                                  }
                                  className="h-8 text-[10px] px-2 bg-muted/30 border-border/40 rounded-md"
                                  placeholder="repeat(2, 1fr)"
                                />
                              </div>
                              <div className="space-y-1.5">
                                <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Rows</Label>
                                <Input
                                  value={safeStyles.gridTemplateRows || ""}
                                  onChange={(e) =>
                                    handleStyleChange("gridTemplateRows", e.target.value)
                                  }
                                  className="h-8 text-[10px] px-2 bg-muted/30 border-border/40 rounded-md"
                                  placeholder="auto"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </CollapsibleSection>

                      <Separator className="opacity-30" />

                      <CollapsibleSection title="Spacing" icon={Box}>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Padding</Label>
                            <Input
                              value={safeStyles.padding || ""}
                              onChange={(e) => handleStyleChange("padding", e.target.value)}
                              className="h-8 text-[10px] px-2 bg-muted/30 border-border/40 rounded-md"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Margin</Label>
                            <Input
                              value={safeStyles.margin || ""}
                              onChange={(e) => handleStyleChange("margin", e.target.value)}
                              className="h-8 text-[10px] px-2 bg-muted/30 border-border/40 rounded-md"
                            />
                          </div>
                        </div>
                      </CollapsibleSection>

                      {safeStyles.display === "flex" && (
                        <>
                          <Separator className="opacity-30" />
                          <CollapsibleSection title="Flexbox" icon={LayoutIcon}>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Direction</Label>
                                <select 
                                  value={safeStyles.flexDirection || "row"}
                                  onChange={(e) => handleStyleChange("flexDirection", e.target.value)}
                                  className="h-8 w-28 text-[10px] bg-muted/30 border border-border/40 rounded-md px-2 outline-none focus:ring-1 ring-primary/30"
                                >
                                  <option value="row">Row</option>
                                  <option value="column">Column</option>
                                </select>
                              </div>
                              <div className="flex items-center justify-between">
                                <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Align</Label>
                                <select 
                                  value={safeStyles.alignItems || "stretch"}
                                  onChange={(e) => handleStyleChange("alignItems", e.target.value)}
                                  className="h-8 w-28 text-[10px] bg-muted/30 border border-border/40 rounded-md px-2 outline-none focus:ring-1 ring-primary/30"
                                >
                                  <option value="flex-start">Start</option>
                                  <option value="center">Center</option>
                                  <option value="flex-end">End</option>
                                  <option value="stretch">Stretch</option>
                                </select>
                              </div>
                              <div className="flex items-center justify-between">
                                <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Justify</Label>
                                <select 
                                  value={safeStyles.justifyContent || "flex-start"}
                                  onChange={(e) => handleStyleChange("justifyContent", e.target.value)}
                                  className="h-8 w-28 text-[10px] bg-muted/30 border border-border/40 rounded-md px-2 outline-none focus:ring-1 ring-primary/30"
                                >
                                  <option value="flex-start">Start</option>
                                  <option value="center">Center</option>
                                  <option value="flex-end">End</option>
                                  <option value="space-between">Between</option>
                                </select>
                              </div>
                              <div className="flex items-center justify-between">
                                <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Gap</Label>
                                <Input
                                  value={safeStyles.gap || ""}
                                  onChange={(e) => handleStyleChange("gap", e.target.value)}
                                  className="h-8 w-28 text-[10px] px-2 bg-muted/30 border-border/40 rounded-md"
                                />
                              </div>
                            </div>
                          </CollapsibleSection>
                        </>
                      )}
                    </div>
                  )}

                  {activeTab === "content" && (
                    <div className="space-y-8">
                      <CollapsibleSection title="Text Content" icon={Type}>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Value</Label>
                          <Input
                            value={text || ""}
                            onChange={(e) => handleTextChange(e.target.value)}
                            className="bg-muted/30 border-border/40 focus-visible:ring-1 ring-primary/30 text-xs h-9 rounded-lg"
                          />
                        </div>
                      </CollapsibleSection>

                      {type === "icon" && (
                        <>
                          <Separator className="opacity-30" />
                          <CollapsibleSection title="Icon Settings" icon={Smile}>
                            <div className="space-y-3">
                              <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Iconify Name</Label>
                              <div className="flex gap-2">
                                <Input
                                  value={safeAttributes.icon || ""}
                                  onChange={(e) => handleAttributeChange("icon", e.target.value)}
                                  className="bg-muted/30 border-border/40 text-xs font-mono h-9 rounded-lg"
                                  placeholder="mdi:home"
                                />
                                <div className="size-9 bg-muted/30 rounded-lg flex items-center justify-center border border-border/40 shadow-inner">
                                  {/* @ts-expect-error - iconify-icon is a custom element */}
                                  <iconify-icon icon={safeAttributes.icon} width="18"></iconify-icon>
                                </div>
                              </div>
                              <p className="text-[9px] text-muted-foreground italic opacity-70">
                                Example: mdi:home, lucide:user, ph:heart-fill
                              </p>
                            </div>
                          </CollapsibleSection>
                        </>
                      )}

                      {type === "link" && (
                        <>
                          <Separator className="opacity-30" />
                          <CollapsibleSection title="Link Settings" icon={ArrowRight}>
                            <div className="space-y-2">
                              <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">URL (href)</Label>
                              <Input
                                value={safeAttributes.href || ""}
                                onChange={(e) => handleAttributeChange("href", e.target.value)}
                                className="bg-muted/30 border-border/40 text-xs font-mono h-9 rounded-lg"
                                placeholder="#"
                              />
                            </div>
                          </CollapsibleSection>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        {selectedElement ? (
          <div className="p-4 border-t border-border/40 bg-muted/10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-70">
                Theme Presets
              </span>
            </div>
            <div className="flex gap-2.5">
              {["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"].map(
                (color) => (
                  <button
                    key={color}
                    onClick={() => handleStyleChange("backgroundColor", color)}
                    className={cn(
                      "size-7 rounded-full border border-border/60 shadow-sm hover:scale-110 transition-all",
                      safeStyles.backgroundColor === color && "ring-2 ring-primary ring-offset-2 ring-offset-background"
                    )}
                    style={{ backgroundColor: color }}
                  />
                )
              )}
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
};