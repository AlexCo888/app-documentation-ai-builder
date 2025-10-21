'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { DesignPattern, DesignCustomization, ColorScheme, BorderRadius, ShadowStyle, AnimationStyle, TypographyStyle } from '@/lib/types';
import { Check, Heart, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { patternOptions, type PatternOption } from './pattern-definitions';

export function DesignPatternShowcase({
  selected,
  onChange,
  onCustomizationChange,
  theme = 'light',
  colorScheme,
  borderRadius,
  shadowStyle,
  animationStyle,
  typography,
  spacing,
  onColorSchemeChange,
  onBorderRadiusChange,
  onShadowStyleChange,
  onAnimationStyleChange,
  onTypographyChange,
  onSpacingChange
}: {
  selected?: DesignPattern;
  onChange: (pattern: DesignPattern) => void;
  onCustomizationChange: (customization: DesignCustomization) => void;
  theme?: 'light' | 'dark';
  colorScheme: ColorScheme;
  borderRadius: BorderRadius;
  shadowStyle: ShadowStyle;
  animationStyle: AnimationStyle;
  typography: TypographyStyle;
  spacing: 'compact' | 'comfortable' | 'spacious';
  onColorSchemeChange: (value: ColorScheme) => void;
  onBorderRadiusChange: (value: BorderRadius) => void;
  onShadowStyleChange: (value: ShadowStyle) => void;
  onAnimationStyleChange: (value: AnimationStyle) => void;
  onTypographyChange: (value: TypographyStyle) => void;
  onSpacingChange: (value: 'compact' | 'comfortable' | 'spacious') => void;
}) {
  const [customization, setCustomization] = useState<DesignCustomization | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);

  const selectedOption = patternOptions.find((p: PatternOption) => p.value === selected);
  const defaultCustomization = selectedOption ? 
    (theme === 'dark' ? selectedOption.darkCustomization : selectedOption.lightCustomization) : 
    null;
  const activeCustomization = customization || defaultCustomization;

  const handlePatternSelect = (pattern: DesignPattern) => {
    const option = patternOptions.find((p: PatternOption) => p.value === pattern);
    if (option) {
      onChange(pattern);
      const newCustomization = theme === 'dark' ? option.darkCustomization : option.lightCustomization;
      setCustomization(newCustomization);
      onCustomizationChange(newCustomization);
      setShowSidebar(true);
    }
  };

  const handleCustomizationUpdate = (updates: Partial<DesignCustomization>) => {
    if (activeCustomization) {
      const newCustomization = { ...activeCustomization, ...updates };
      setCustomization(newCustomization);
      onCustomizationChange(newCustomization);
    }
  };

  return (
    <div className="flex gap-6">
      <div className={cn("flex-1 transition-all duration-300", showSidebar && "lg:w-2/3")}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {patternOptions.map((option: PatternOption) => {
            const isSelected = selected === option.value;
            const currentCustomization = isSelected && activeCustomization ? 
              activeCustomization : 
              (theme === 'dark' ? option.darkCustomization : option.lightCustomization);
            
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handlePatternSelect(option.value)}
                className={cn(
                  'group relative flex flex-col gap-3 rounded-2xl border-2 p-4 text-left transition-all duration-300 hover:-translate-y-1',
                  isSelected
                    ? 'border-[hsl(var(--color-primary))] bg-[hsl(var(--color-primary)/0.08)] shadow-[0_20px_40px_-25px_hsl(var(--color-primary))]'
                    : 'border-[hsl(var(--color-border)/0.5)] bg-[hsl(var(--color-card)/0.6)] hover:border-[hsl(var(--color-primary)/0.4)]',
                  theme === 'dark' && 'bg-gray-950'
                )}
              >
                {isSelected && (
                  <div className="absolute -right-2 -top-2 flex size-7 items-center justify-center rounded-full bg-[hsl(var(--color-primary))] text-white shadow-lg">
                    <Check className="size-4" />
                  </div>
                )}
                
                <div>
                  <h4 className={cn('text-sm font-semibold', theme === 'dark' ? 'text-white' : 'text-[hsl(var(--color-foreground))]')}>
                    {option.label}
                  </h4>
                  <p className={cn('text-xs', theme === 'dark' ? 'text-gray-400' : 'text-[hsl(var(--color-muted-foreground))]')}>
                    {option.description}
                  </p>
                </div>

                <PreviewCard customization={currentCustomization} isDark={theme === 'dark'} />
              </button>
            );
          })}
        </div>
      </div>

      {showSidebar && selected && activeCustomization && (
        <div className="hidden lg:block w-80 xl:w-96">
          <CustomizationSidebar
            customization={activeCustomization}
            onChange={handleCustomizationUpdate}
            onClose={() => setShowSidebar(false)}
            colorScheme={colorScheme}
            borderRadius={borderRadius}
            shadowStyle={shadowStyle}
            animationStyle={animationStyle}
            typography={typography}
            spacing={spacing}
            onColorSchemeChange={onColorSchemeChange}
            onBorderRadiusChange={onBorderRadiusChange}
            onShadowStyleChange={onShadowStyleChange}
            onAnimationStyleChange={onAnimationStyleChange}
            onTypographyChange={onTypographyChange}
            onSpacingChange={onSpacingChange}
          />
        </div>
      )}
    </div>
  );
}

function getContrastColor(hexColor: string): string {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#ffffff';
}

function PreviewCard({ customization, isDark }: { customization: DesignCustomization; isDark: boolean }) {
  const textColor = getContrastColor(customization.secondaryColor);
  const mutedTextColor = isDark ? '#94a3b8' : '#64748b';

  return (
    <Card style={{
      backgroundColor: customization.secondaryColor,
      borderRadius: `${customization.borderRadiusValue}rem`,
      boxShadow: `${customization.shadowXOffset}px ${customization.shadowYOffset}px ${customization.shadowBlur}px ${customization.shadowSpread}px ${customization.shadowColor}`,
      border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`
    }} className="border-0 overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600" />
          <div style={{
            backgroundColor: customization.accentColor,
            color: getContrastColor(customization.accentColor),
            borderRadius: `${customization.borderRadiusValue * 0.75}rem`
          }} className="px-2 py-0.5 text-[0.65rem] font-medium">New</div>
        </div>
        <CardTitle className="text-sm mt-2" style={{ color: textColor }}>Product Card</CardTitle>
        <CardDescription className="text-xs" style={{ color: mutedTextColor }}>Beautiful component preview</CardDescription>
      </CardHeader>
      <CardContent className="pb-3">
        <Input placeholder="Input field..." className="h-7 text-xs border" style={{ 
          borderRadius: `${customization.borderRadiusValue * 0.75}rem`,
          backgroundColor: isDark ? '#00000020' : '#ffffff',
          borderColor: isDark ? '#475569' : '#cbd5e1',
          color: textColor
        }} />
      </CardContent>
      <CardFooter className="pt-3 flex gap-2">
        <div style={{
          backgroundColor: customization.primaryColor,
          color: getContrastColor(customization.primaryColor),
          borderRadius: `${customization.borderRadiusValue}rem`
        }} className="flex-1 px-3 py-1.5 text-xs font-medium transition-opacity hover:opacity-90 flex items-center justify-center">Action</div>
        <div className="px-2 py-1.5 text-xs flex items-center justify-center" style={{ borderRadius: `${customization.borderRadiusValue}rem`, color: mutedTextColor }}>
          <Heart className="h-3 w-3" />
        </div>
      </CardFooter>
    </Card>
  );
}

function CustomizationSidebar({ 
  customization, 
  onChange, 
  onClose,
  colorScheme,
  borderRadius,
  shadowStyle,
  animationStyle,
  typography,
  spacing,
  onColorSchemeChange,
  onBorderRadiusChange,
  onShadowStyleChange,
  onAnimationStyleChange,
  onTypographyChange,
  onSpacingChange
}: {
  customization: DesignCustomization;
  onChange: (updates: Partial<DesignCustomization>) => void;
  onClose: () => void;
  colorScheme: ColorScheme;
  borderRadius: BorderRadius;
  shadowStyle: ShadowStyle;
  animationStyle: AnimationStyle;
  typography: TypographyStyle;
  spacing: 'compact' | 'comfortable' | 'spacious';
  onColorSchemeChange: (value: ColorScheme) => void;
  onBorderRadiusChange: (value: BorderRadius) => void;
  onShadowStyleChange: (value: ShadowStyle) => void;
  onAnimationStyleChange: (value: AnimationStyle) => void;
  onTypographyChange: (value: TypographyStyle) => void;
  onSpacingChange: (value: 'compact' | 'comfortable' | 'spacious') => void;
}) {
  return (
    <Card className="sticky top-4 border-[hsl(var(--color-border)/0.5)]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings2 className="h-4 w-4 text-[hsl(var(--color-primary))]" />
            <CardTitle className="text-base">Customize Design</CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">×</Button>
        </div>
        <CardDescription className="text-xs">Adjust colors, shadows, and design system</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <ScrollArea className="h-[calc(100vh-16rem)] pr-4">
          <div className="space-y-4">
            {['primary', 'secondary', 'accent'].map((type) => (
              <div key={type} className="space-y-2">
                <Label className="text-xs font-semibold capitalize">{type} Color</Label>
                <div className="flex gap-2">
                  <Input type="color" value={customization[`${type}Color` as keyof DesignCustomization] as string}
                    onChange={(e) => onChange({ [`${type}Color`]: e.target.value } as Partial<DesignCustomization>)} className="h-9 w-16 cursor-pointer" />
                  <Input type="text" value={customization[`${type}Color` as keyof DesignCustomization] as string}
                    onChange={(e) => onChange({ [`${type}Color`]: e.target.value } as Partial<DesignCustomization>)} className="flex-1 h-9 text-xs font-mono" />
                </div>
              </div>
            ))}
          </div>
          
          <div className="space-y-2 pt-4 border-t mt-4">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold">Border Radius</Label>
              <span className="text-xs font-mono">{customization.borderRadiusValue.toFixed(3)} rem</span>
            </div>
            <Slider value={[customization.borderRadiusValue]} onValueChange={([v]) => onChange({ borderRadiusValue: v })} min={0} max={2} step={0.125} />
          </div>
          
          <div className="space-y-4 pt-4 border-t mt-4">
            <Label className="text-xs font-semibold">Shadow</Label>
            {[
              { key: 'shadowXOffset', label: 'X Offset', min: -20, max: 20 },
              { key: 'shadowYOffset', label: 'Y Offset', min: -20, max: 20 },
              { key: 'shadowBlur', label: 'Blur', min: 0, max: 40 },
              { key: 'shadowSpread', label: 'Spread', min: -10, max: 10 }
            ].map(({ key, label, min, max }) => (
              <div key={key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">{label}</Label>
                  <span className="text-xs font-mono">{customization[key as keyof DesignCustomization]} px</span>
                </div>
                <Slider value={[customization[key as keyof DesignCustomization] as number]}
                  onValueChange={([v]) => onChange({ [key]: v } as Partial<DesignCustomization>)} min={min} max={max} step={1} />
              </div>
            ))}
          </div>

          {/* Design System Settings */}
          <div className="space-y-4 pt-4 border-t mt-4">
            <Label className="text-xs font-semibold">Design System</Label>
            
            <div className="space-y-2">
              <Label className="text-xs">Color Scheme</Label>
              <p className="text-[0.65rem] text-muted-foreground">Overall color palette intensity</p>
              <Select value={colorScheme} onValueChange={onColorSchemeChange}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vibrant">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-0.5">
                        <div className="w-3 h-3 rounded-sm bg-red-500" />
                        <div className="w-3 h-3 rounded-sm bg-blue-500" />
                        <div className="w-3 h-3 rounded-sm bg-green-500" />
                      </div>
                      <span>Vibrant</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="muted">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-0.5">
                        <div className="w-3 h-3 rounded-sm bg-red-300" />
                        <div className="w-3 h-3 rounded-sm bg-blue-300" />
                        <div className="w-3 h-3 rounded-sm bg-green-300" />
                      </div>
                      <span>Muted</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="monochrome">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-0.5">
                        <div className="w-3 h-3 rounded-sm bg-gray-800" />
                        <div className="w-3 h-3 rounded-sm bg-gray-500" />
                        <div className="w-3 h-3 rounded-sm bg-gray-300" />
                      </div>
                      <span>Monochrome</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="pastel">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-0.5">
                        <div className="w-3 h-3 rounded-sm bg-pink-200" />
                        <div className="w-3 h-3 rounded-sm bg-blue-200" />
                        <div className="w-3 h-3 rounded-sm bg-green-200" />
                      </div>
                      <span>Pastel</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="dark">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-0.5">
                        <div className="w-3 h-3 rounded-sm bg-gray-900 border border-gray-700" />
                        <div className="w-3 h-3 rounded-sm bg-gray-800 border border-gray-700" />
                        <div className="w-3 h-3 rounded-sm bg-gray-700 border border-gray-600" />
                      </div>
                      <span>Dark</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Border Radius Style</Label>
              <p className="text-[0.65rem] text-muted-foreground">Corner roundness of elements</p>
              <Select value={borderRadius} onValueChange={onBorderRadiusChange}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sharp">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-primary" />
                      <span>Sharp (0px)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="rounded">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-primary rounded" />
                      <span>Rounded (8px)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="pill">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-primary rounded-full" />
                      <span>Pill (999px)</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Shadow Style</Label>
              <p className="text-[0.65rem] text-muted-foreground">Depth and elevation effect</p>
              <Select value={shadowStyle} onValueChange={onShadowStyleChange}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-primary rounded" />
                      <span>None</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="soft">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-primary rounded shadow-sm" />
                      <span>Soft</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="medium">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-primary rounded shadow-md" />
                      <span>Medium</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="dramatic">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-primary rounded shadow-xl" />
                      <span>Dramatic</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Animations</Label>
              <p className="text-[0.65rem] text-muted-foreground">Motion and transition speed</p>
              <Select value={animationStyle} onValueChange={onAnimationStyleChange}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None - Instant changes</SelectItem>
                  <SelectItem value="subtle">Subtle - Quick (150ms)</SelectItem>
                  <SelectItem value="smooth">Smooth - Standard (300ms)</SelectItem>
                  <SelectItem value="playful">Playful - Bouncy (500ms)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Typography</Label>
              <p className="text-[0.65rem] text-muted-foreground">Font family style</p>
              <Select value={typography} onValueChange={onTypographyChange}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="modern-sans">
                    <span className="font-sans">Modern Sans-serif</span>
                  </SelectItem>
                  <SelectItem value="classic-serif">
                    <span className="font-serif">Classic Serif</span>
                  </SelectItem>
                  <SelectItem value="tech-mono">
                    <span className="font-mono">Tech Monospace</span>
                  </SelectItem>
                  <SelectItem value="humanist">
                    <span style={{ fontFamily: 'system-ui' }}>Humanist</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Spacing</Label>
              <p className="text-[0.65rem] text-muted-foreground">Padding and gap between elements</p>
              <Select value={spacing} onValueChange={onSpacingChange}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="compact">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-0.5">
                        <div className="w-2 h-4 bg-primary rounded-sm" />
                        <div className="w-2 h-4 bg-primary rounded-sm" />
                        <div className="w-2 h-4 bg-primary rounded-sm" />
                      </div>
                      <span>Compact - Dense</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="comfortable">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-4 bg-primary rounded-sm" />
                        <div className="w-2 h-4 bg-primary rounded-sm" />
                        <div className="w-2 h-4 bg-primary rounded-sm" />
                      </div>
                      <span>Comfortable - Balanced</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="spacious">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-2">
                        <div className="w-2 h-4 bg-primary rounded-sm" />
                        <div className="w-2 h-4 bg-primary rounded-sm" />
                        <div className="w-2 h-4 bg-primary rounded-sm" />
                      </div>
                      <span>Spacious - Airy</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
