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
  Smile
} from "lucide-react";
import { cn } from "@/lib/utils";
import Script from "next/script";

type TabType = "design" | "layout" | "content";

export const EditingSidebar = ({ isEditMode }: { isEditMode: boolean }) => {
  const { selectedElement, setSelectedElement, updateElement } = useCanvas();
  const [activeTab, setActiveTab] = useState<TabType>("design");
  const [panelMode, setPanelMode] = useState<"simple" | "advanced">("simple");

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

  const TabButton = ({ id, label, icon: Icon }: { id: TabType, label: string, icon: any }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={cn(
        "flex-1 flex flex-col items-center gap-1 py-2 text-[10px] font-medium transition-all border-b-2",
        activeTab === id 
          ? "border-primary text-primary bg-primary/5" 
          : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
      )}
    >
      <Icon className="size-3.5" />
      {label}
    </button>
  );

  return (
    <>
      <Script src="https://code.iconify.design/iconify-icon/3.0.0/iconify-icon.min.js" strategy="afterInteractive" />
      <div className="fixed right-0 top-0 h-screen w-80 bg-background border-l shadow-2xl z-[60] flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between bg-muted/30">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Settings2 className="size-4 text-primary" />
            </div>
            <div>
              <h2 className="font-bold text-sm leading-none">Properties</h2>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1 font-bold">
                {selectedElement ? type || tagName : "No selection"}
              </p>
            </div>
          </div>
          <button
            onClick={() => setSelectedElement(null)}
            className="p-2 hover:bg-muted rounded-full transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Mode Toggle */}
        <div className="flex items-center gap-2 px-4 py-3 border-b bg-background">
          <button
            onClick={() => setPanelMode("simple")}
            className={cn(
              "flex-1 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
              panelMode === "simple"
                ? "border-primary bg-primary/10 text-primary"
                : "border-border/60 text-muted-foreground hover:text-foreground"
            )}
          >
            Simple
          </button>
          <button
            onClick={() => setPanelMode("advanced")}
            className={cn(
              "flex-1 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
              panelMode === "advanced"
                ? "border-primary bg-primary/10 text-primary"
                : "border-border/60 text-muted-foreground hover:text-foreground"
            )}
          >
            Advanced
          </button>
        </div>

        {/* Tabs */}
        {panelMode === "advanced" && (
          <div className="flex border-b bg-muted/10">
            <TabButton id="design" label="Design" icon={Palette} />
            <TabButton id="layout" label="Layout" icon={LayoutIcon} />
            <TabButton id="content" label="Content" icon={Type} />
          </div>
        )}

        <ScrollArea className="flex-1">
          {!selectedElement ? (
            <div className="p-6">
              <div className="rounded-2xl border border-dashed bg-muted/20 p-6 text-center">
                <MousePointer2 className="mx-auto size-5 text-muted-foreground" />
                <p className="mt-3 text-sm font-medium">Select an element</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Click any element inside the frame to edit its design, layout,
                  or content.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-5 space-y-6">
              {panelMode === "simple" ? (
                <div className="space-y-6">
                  <section className="space-y-3">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Type className="size-3.5" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Content</span>
                    </div>
                    <Input
                      value={text || ""}
                      onChange={(e) => handleTextChange(e.target.value)}
                      className="bg-muted/50 border-none focus-visible:ring-1 ring-primary text-xs"
                      placeholder="Edit text..."
                    />
                    {type === "link" && (
                      <Input
                        value={safeAttributes.href || ""}
                        onChange={(e) => handleAttributeChange("href", e.target.value)}
                        className="bg-muted/50 border-none text-xs font-mono"
                        placeholder="Link URL"
                      />
                    )}
                  </section>

                  <Separator className="opacity-50" />

                  <section className="space-y-3">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Palette className="size-3.5" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Colors</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-[11px] text-muted-foreground">Background</Label>
                      <Input
                        value={safeStyles.backgroundColor || ""}
                        onChange={(e) => handleStyleChange("backgroundColor", e.target.value)}
                        className="h-7 w-32 text-[10px] font-mono px-2 bg-muted/50 border-none"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-[11px] text-muted-foreground">Text</Label>
                      <Input
                        value={safeStyles.color || ""}
                        onChange={(e) => handleStyleChange("color", e.target.value)}
                        className="h-7 w-32 text-[10px] font-mono px-2 bg-muted/50 border-none"
                      />
                    </div>
                  </section>

                  <Separator className="opacity-50" />

                  <section className="space-y-3">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Box className="size-3.5" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Spacing</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-[11px] text-muted-foreground">Padding</Label>
                      <Input
                        value={safeStyles.padding || ""}
                        onChange={(e) => handleStyleChange("padding", e.target.value)}
                        className="h-7 w-24 text-[10px] px-2 bg-muted/50 border-none"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-[11px] text-muted-foreground">Radius</Label>
                      <Input
                        value={safeStyles.borderRadius || ""}
                        onChange={(e) => handleStyleChange("borderRadius", e.target.value)}
                        className="h-7 w-24 text-[10px] px-2 bg-muted/50 border-none"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-[11px] text-muted-foreground">Font Size</Label>
                      <Input
                        value={safeStyles.fontSize || ""}
                        onChange={(e) => handleStyleChange("fontSize", e.target.value)}
                        className="h-7 w-24 text-[10px] px-2 bg-muted/50 border-none"
                      />
                    </div>
                  </section>
                </div>
              ) : (
              <>
              {activeTab === "design" && (
              <>
                {/* Appearance Section */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Palette className="size-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Appearance</span>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-[11px] text-muted-foreground">Background</Label>
                      <div className="flex items-center gap-2">
                        <div 
                          className="size-5 rounded border shadow-sm cursor-pointer" 
                          style={{ backgroundColor: safeStyles.backgroundColor }}
                        />
                        <Input
                          value={safeStyles.backgroundColor || ""}
                          onChange={(e) => handleStyleChange("backgroundColor", e.target.value)}
                          className="h-7 w-24 text-[10px] font-mono px-2 bg-muted/50 border-none"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <Label className="text-[11px] text-muted-foreground">Text Color</Label>
                      <div className="flex items-center gap-2">
                        <div 
                          className="size-5 rounded border shadow-sm cursor-pointer" 
                          style={{ backgroundColor: safeStyles.color }}
                        />
                        <Input
                          value={safeStyles.color || ""}
                          onChange={(e) => handleStyleChange("color", e.target.value)}
                          className="h-7 w-24 text-[10px] font-mono px-2 bg-muted/50 border-none"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <Label className="text-[11px] text-muted-foreground">Radius</Label>
                      <Input
                        value={safeStyles.borderRadius || ""}
                        onChange={(e) => handleStyleChange("borderRadius", e.target.value)}
                        className="h-7 w-24 text-[10px] px-2 bg-muted/50 border-none"
                      />
                    </div>
                  </div>
                </section>

                <Separator className="opacity-50" />

                {/* Typography Section */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Type className="size-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Typography</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] text-muted-foreground">Size</Label>
                      <Input
                        value={safeStyles.fontSize || ""}
                        onChange={(e) => handleStyleChange("fontSize", e.target.value)}
                        className="h-7 text-[10px] px-2 bg-muted/50 border-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] text-muted-foreground">Weight</Label>
                      <Input
                        value={safeStyles.fontWeight || ""}
                        onChange={(e) => handleStyleChange("fontWeight", e.target.value)}
                        className="h-7 text-[10px] px-2 bg-muted/50 border-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] text-muted-foreground">Line Height</Label>
                      <Input
                        value={safeStyles.lineHeight || ""}
                        onChange={(e) => handleStyleChange("lineHeight", e.target.value)}
                        className="h-7 text-[10px] px-2 bg-muted/50 border-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] text-muted-foreground">Spacing</Label>
                      <Input
                        value={safeStyles.letterSpacing || ""}
                        onChange={(e) => handleStyleChange("letterSpacing", e.target.value)}
                        className="h-7 text-[10px] px-2 bg-muted/50 border-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-1 p-1 bg-muted/30 rounded-lg">
                    <button 
                      onClick={() => handleStyleChange("textAlign", "left")}
                      className={cn("flex-1 py-1.5 rounded flex justify-center", safeStyles.textAlign === "left" && "bg-background shadow-sm")}
                    >
                      <AlignLeft className="size-3" />
                    </button>
                    <button 
                      onClick={() => handleStyleChange("textAlign", "center")}
                      className={cn("flex-1 py-1.5 rounded flex justify-center", safeStyles.textAlign === "center" && "bg-background shadow-sm")}
                    >
                      <AlignCenter className="size-3" />
                    </button>
                    <button 
                      onClick={() => handleStyleChange("textAlign", "right")}
                      className={cn("flex-1 py-1.5 rounded flex justify-center", safeStyles.textAlign === "right" && "bg-background shadow-sm")}
                    >
                      <AlignRight className="size-3" />
                    </button>
                  </div>
                </section>
              </>
              )}

              {activeTab === "layout" && (
              <>
                {/* Display Section */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <LayoutIcon className="size-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Display</span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-[11px] text-muted-foreground">Mode</Label>
                      <select
                        value={safeStyles.display || "block"}
                        onChange={(e) => handleStyleChange("display", e.target.value)}
                        className="h-7 w-24 text-[10px] bg-muted/50 border-none rounded px-1"
                      >
                        <option value="block">Block</option>
                        <option value="flex">Flex</option>
                        <option value="grid">Grid</option>
                      </select>
                    </div>

                    {safeStyles.display === "grid" && (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label className="text-[10px] text-muted-foreground">Columns</Label>
                          <Input
                            value={safeStyles.gridTemplateColumns || ""}
                            onChange={(e) =>
                              handleStyleChange("gridTemplateColumns", e.target.value)
                            }
                            className="h-7 text-[10px] px-2 bg-muted/50 border-none"
                            placeholder="repeat(2, 1fr)"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-[10px] text-muted-foreground">Rows</Label>
                          <Input
                            value={safeStyles.gridTemplateRows || ""}
                            onChange={(e) =>
                              handleStyleChange("gridTemplateRows", e.target.value)
                            }
                            className="h-7 text-[10px] px-2 bg-muted/50 border-none"
                            placeholder="auto"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </section>

                <Separator className="opacity-50" />

                {/* Spacing Section */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Box className="size-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Spacing</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] text-muted-foreground">Padding</Label>
                      <Input
                        value={safeStyles.padding || ""}
                        onChange={(e) => handleStyleChange("padding", e.target.value)}
                        className="h-7 text-[10px] px-2 bg-muted/50 border-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] text-muted-foreground">Margin</Label>
                      <Input
                        value={safeStyles.margin || ""}
                        onChange={(e) => handleStyleChange("margin", e.target.value)}
                        className="h-7 text-[10px] px-2 bg-muted/50 border-none"
                      />
                    </div>
                  </div>
                </section>

                <Separator className="opacity-50" />

                {/* Flexbox Section */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <LayoutIcon className="size-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Flexbox</span>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-[11px] text-muted-foreground">Direction</Label>
                      <select 
                        value={safeStyles.flexDirection || "row"}
                        onChange={(e) => handleStyleChange("flexDirection", e.target.value)}
                        className="h-7 w-24 text-[10px] bg-muted/50 border-none rounded px-1"
                      >
                        <option value="row">Row</option>
                        <option value="column">Column</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-[11px] text-muted-foreground">Align</Label>
                      <select 
                        value={safeStyles.alignItems || "stretch"}
                        onChange={(e) => handleStyleChange("alignItems", e.target.value)}
                        className="h-7 w-24 text-[10px] bg-muted/50 border-none rounded px-1"
                      >
                        <option value="flex-start">Start</option>
                        <option value="center">Center</option>
                        <option value="flex-end">End</option>
                        <option value="stretch">Stretch</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-[11px] text-muted-foreground">Justify</Label>
                      <select 
                        value={safeStyles.justifyContent || "flex-start"}
                        onChange={(e) => handleStyleChange("justifyContent", e.target.value)}
                        className="h-7 w-24 text-[10px] bg-muted/50 border-none rounded px-1"
                      >
                        <option value="flex-start">Start</option>
                        <option value="center">Center</option>
                        <option value="flex-end">End</option>
                        <option value="space-between">Between</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-[11px] text-muted-foreground">Gap</Label>
                      <Input
                        value={safeStyles.gap || ""}
                        onChange={(e) => handleStyleChange("gap", e.target.value)}
                        className="h-7 w-24 text-[10px] px-2 bg-muted/50 border-none"
                      />
                    </div>
                  </div>
                </section>
              </>
              )}

              {activeTab === "content" && (
              <>
                {/* Text Content */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Type className="size-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Text</span>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[11px] text-muted-foreground">Value</Label>
                    <Input
                      value={text || ""}
                      onChange={(e) => handleTextChange(e.target.value)}
                      className="bg-muted/50 border-none focus-visible:ring-1 ring-primary text-xs"
                    />
                  </div>
                </section>

                {/* Icon Specific */}
                {type === "icon" && (
                  <>
                    <Separator className="opacity-50" />
                    <section className="space-y-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Smile className="size-3.5" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Icon Settings</span>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[11px] text-muted-foreground">Iconify Name</Label>
                        <div className="flex gap-2">
                          <Input
                            value={safeAttributes.icon || ""}
                            onChange={(e) => handleAttributeChange("icon", e.target.value)}
                            className="bg-muted/50 border-none text-xs font-mono"
                            placeholder="mdi:home"
                          />
                          <div className="size-8 bg-muted/50 rounded flex items-center justify-center border">
                            <iconify-icon icon={safeAttributes.icon} width="16"></iconify-icon>
                          </div>
                        </div>
                        <p className="text-[9px] text-muted-foreground">
                          Example: mdi:home, lucide:user, ph:heart-fill
                        </p>
                      </div>
                    </section>
                  </>
                )}

                {/* Link Specific */}
                {type === "link" && (
                  <>
                    <Separator className="opacity-50" />
                    <section className="space-y-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <ArrowRight className="size-3.5" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Link Settings</span>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[11px] text-muted-foreground">URL (href)</Label>
                        <Input
                          value={safeAttributes.href || ""}
                          onChange={(e) => handleAttributeChange("href", e.target.value)}
                          className="bg-muted/50 border-none text-xs font-mono"
                          placeholder="#"
                        />
                      </div>
                    </section>
                  </>
                )}
              </>
              )}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        {selectedElement ? (
          <div className="p-4 border-t bg-muted/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">
                Theme Presets
              </span>
            </div>
            <div className="flex gap-2">
              {["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"].map(
                (color) => (
                  <button
                    key={color}
                    onClick={() => handleStyleChange("backgroundColor", color)}
                    className="size-6 rounded-full border shadow-sm hover:scale-110 transition-transform"
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
