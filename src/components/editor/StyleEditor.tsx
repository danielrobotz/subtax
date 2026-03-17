'use client';

import { useProjectStore } from '@/store/projectStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Palette, Type, Layout } from 'lucide-react';
import { AnimationStyle } from '@/types';

const animationOptions: { value: AnimationStyle; label: string; description: string }[] = [
  { value: 'word-pop', label: 'Word Pop', description: 'Words pop in as spoken' },
  { value: 'karaoke', label: 'Karaoke Fill', description: 'Words fill with color as spoken' },
  { value: 'fade', label: 'Fade', description: 'Smooth fade in/out transitions' },
];

const fontOptions = [
  'Inter',
  'Roboto',
  'Open Sans',
  'Montserrat',
  'Poppins',
  'Bebas Neue',
  'Oswald',
  'Playfair Display',
];

const positionOptions = [
  { value: 'top', label: 'Top' },
  { value: 'center', label: 'Center' },
  { value: 'bottom', label: 'Bottom' },
];

export function StyleEditor() {
  const { currentProject, setSubtitleStyle, setAnimationStyle } = useProjectStore();
  const style = currentProject?.subtitleStyle;

  if (!style) return null;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="w-5 h-5" />
          Style & Animation
        </CardTitle>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="animation" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="animation">Animation</TabsTrigger>
            <TabsTrigger value="typography">Typography</TabsTrigger>
            <TabsTrigger value="layout">Layout</TabsTrigger>
          </TabsList>

          {/* Animation Tab */}
          <TabsContent value="animation" className="space-y-4">
            <div className="space-y-2">
              <Label>Animation Style</Label>
              <div className="grid gap-2">
                {animationOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setAnimationStyle(option.value)}
                    className={`p-3 text-left rounded-lg border transition-colors ${
                      currentProject?.animationStyle === option.value
                        ? 'border-primary bg-primary/5'
                        : 'border-muted hover:border-muted-foreground'
                    }`}
                  >
                    <div className="font-medium">{option.label}</div>
                    <div className="text-sm text-muted-foreground">{option.description}</div>
                  </button>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Typography Tab */}
          <TabsContent value="typography" className="space-y-4">
            <div className="space-y-2">
              <Label>Font Family</Label>
              <Select
                value={style.fontFamily}
                onValueChange={(value) => value && setSubtitleStyle({ fontFamily: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fontOptions.map((font) => (
                    <SelectItem key={font} value={font}>
                      {font}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Font Size: {style.fontSize}px</Label>
              <Slider
                value={[style.fontSize]}
                onValueChange={(value) => setSubtitleStyle({ fontSize: Array.isArray(value) ? value[0] : value })}
                min={12}
                max={120}
                step={1}
              />
            </div>

            <div className="space-y-2">
              <Label>Font Weight</Label>
              <Select
                value={style.fontWeight}
                onValueChange={(value) => value && setSubtitleStyle({ fontWeight: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="300">Light</SelectItem>
                  <SelectItem value="400">Regular</SelectItem>
                  <SelectItem value="500">Medium</SelectItem>
                  <SelectItem value="700">Bold</SelectItem>
                  <SelectItem value="900">Extra Bold</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Text Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={style.textColor}
                    onChange={(e) => setSubtitleStyle({ textColor: e.target.value })}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    value={style.textColor}
                    onChange={(e) => setSubtitleStyle({ textColor: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Highlight Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={style.highlightColor}
                    onChange={(e) => setSubtitleStyle({ highlightColor: e.target.value })}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    value={style.highlightColor}
                    onChange={(e) => setSubtitleStyle({ highlightColor: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Layout Tab */}
          <TabsContent value="layout" className="space-y-4">
            <div className="space-y-2">
              <Label>Position</Label>
              <Select
                value={style.position}
                onValueChange={(value: any) => setSubtitleStyle({ position: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {positionOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Background Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={style.backgroundColor}
                  onChange={(e) => setSubtitleStyle({ backgroundColor: e.target.value })}
                  className="w-12 h-10 p-1"
                />
                <Input
                  value={style.backgroundColor}
                  onChange={(e) => setSubtitleStyle({ backgroundColor: e.target.value })}
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Background Opacity: {Math.round(style.backgroundOpacity * 100)}%</Label>
              <Slider
                value={[style.backgroundOpacity * 100]}
                onValueChange={(value) => setSubtitleStyle({ backgroundOpacity: (Array.isArray(value) ? value[0] : value) / 100 })}
                min={0}
                max={100}
                step={5}
              />
            </div>

            <div className="space-y-2">
              <Label>Padding: {style.padding}px</Label>
              <Slider
                value={[style.padding]}
                onValueChange={(value) => setSubtitleStyle({ padding: Array.isArray(value) ? value[0] : value })}
                min={0}
                max={50}
                step={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Border Radius: {style.borderRadius}px</Label>
              <Slider
                value={[style.borderRadius]}
                onValueChange={(value) => setSubtitleStyle({ borderRadius: Array.isArray(value) ? value[0] : value })}
                min={0}
                max={50}
                step={2}
              />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
