import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Settings2 } from "lucide-react";
import { useTextToSpeech } from "@/contexts/TTSContext";

interface TTSControlsProps {
  className?: string;
}

const TTSControls = ({ className = "" }: TTSControlsProps) => {
  const { voices, settings, updateSettings } = useTextToSpeech();
  const [open, setOpen] = useState(false);

  // Organize voices by language with priority for Indian languages
  const organizedVoices = () => {
    const languageGroups: { [key: string]: SpeechSynthesisVoice[] } = {};
    
    // Priority languages mapping
    const priorityLanguages = {
      'hi': 'Hindi',
      'mr': 'Marathi', 
      'en': 'English',
      'ta': 'Tamil',
      'te': 'Telugu',
      'gu': 'Gujarati',
      'bn': 'Bengali',
      'kn': 'Kannada',
      'ml': 'Malayalam',
      'pa': 'Punjabi',
      'or': 'Odia',
      'as': 'Assamese'
    };

    voices.forEach(voice => {
      const langCode = voice.lang.split('-')[0].toLowerCase();
      const langName = priorityLanguages[langCode] || voice.lang;
      
      if (!languageGroups[langName]) {
        languageGroups[langName] = [];
      }
      languageGroups[langName].push(voice);
    });

    // Sort languages with Indian languages first
    const indianLanguages = ['Hindi', 'Marathi', 'Tamil', 'Telugu', 'Gujarati', 'Bengali', 'Kannada', 'Malayalam', 'Punjabi', 'Odia', 'Assamese'];
    const sortedGroups: { [key: string]: SpeechSynthesisVoice[] } = {};
    
    // Add Indian languages first
    indianLanguages.forEach(lang => {
      if (languageGroups[lang]) {
        sortedGroups[lang] = languageGroups[lang];
      }
    });
    
    // Add English
    if (languageGroups['English']) {
      sortedGroups['English'] = languageGroups['English'];
    }
    
    // Add other languages
    Object.keys(languageGroups).forEach(lang => {
      if (!sortedGroups[lang]) {
        sortedGroups[lang] = languageGroups[lang];
      }
    });

    return sortedGroups;
  };

  const voiceGroups = organizedVoices();

  return (
        <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
            
            <Button
            variant="ghost"
            size="sm"
            className={`hover:bg-surface-chat/60 rounded-md h-7 px-2 ${className}`}
            title="Text-to-Speech settings"
            >
            <Settings2 className="w-4 h-4 text-foreground/70" />
            <span className="text-xs text-foreground/90 ml-1.5">TTS Settings</span>
            </Button>

        </PopoverTrigger>
        <PopoverContent className="w-96 bg-surface-elevated border-border/50 shadow-xl backdrop-blur-sm" side="top">
            <div className="space-y-5 p-1">
            <div className="space-y-1 pb-2 border-b border-border/30">
                <h4 className="font-semibold text-sm text-foreground flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-primary" />
                Text-to-Speech Settings
                </h4>
                <p className="text-xs text-muted-foreground">Configure voice and playback options</p>
            </div>

            {/* Voice Selection */}
            <div className="space-y-2">
                <Label htmlFor="voice" className="text-xs text-foreground/80">Voice</Label>
                <Select
                value={settings.voice?.name || ""}
                onValueChange={(value) => {
                    const selectedVoice = voices.find(v => v.name === value);
                    if (selectedVoice) {
                    updateSettings({ voice: selectedVoice });
                    }
                }}
                >
                <SelectTrigger id="voice" className="h-9 text-xs bg-background/50 hover:bg-background/80 transition-colors">
                    <SelectValue placeholder="🎤 Select a voice...">
                    {settings.voice && (
                        <div className="flex items-center gap-2 truncate">
                        <span className="text-xs font-medium truncate">
                            {settings.voice.name.includes(' - ') 
                            ? settings.voice.name.split(' - ')[1] || settings.voice.name.split(' - ')[0]
                            : settings.voice.name.replace(/Microsoft\s+/, '')
                            }
                        </span>
                        <span className="text-[10px] text-muted-foreground bg-muted/60 px-1 py-0.5 rounded-sm">
                            {settings.voice.lang}
                        </span>
                        </div>
                    )}
                    </SelectValue>
                </SelectTrigger>
                <SelectContent className="max-h-80 w-100 p-0 overflow-hidden">
                    <div className="max-h-72 overflow-y-auto overflow-x-hidden">
                    {Object.entries(voiceGroups).map(([language, languageVoices], groupIndex) => (
                        <div key={language}>
                        {/* Language Header - Fixed positioning */}
                        <div className="px-2 mx-2 py-2 text-xs font-semibold text-primary bg-primary/15 border border-rounded relative">
                        <div className="flex items-center justify-between">
                          <span className="text-primary">{language}</span>
                          <span className="text-[11px] text-muted-foreground bg-muted/90 px-2  py-1 rounded-full border border-muted-foreground/20 flex-shrink-0 font-medium">
                            {languageVoices.length}
                          </span>
                            </div>
                        </div>
                        {/* Voices for this language */}
                        <div className="pb-2 mx-3">
                            {languageVoices.map((voice, index) => (
                            <SelectItem 
                                key={voice.name} 
                                value={voice.name} 
                            className={`mx-1 my-1 rounded-md text-xs pl-3 pr-3 py-2.5 transition-all duration-200 border border-border/30 overflow-hidden
                              hover:bg-accent/50 hover:border-accent-foreground/40 hover:shadow-sm
                              focus:bg-accent/60 focus:border-accent-foreground/60 focus:shadow-sm
                              data-[state=checked]:bg-primary/15 data-[state=checked]:border-primary/60 data-[state=checked]:text-primary data-[state=checked]:pl-7 data-[state=checked]:shadow-sm
                                ${index === languageVoices.length - 1 ? 'mb-2' : ''}
                                `}
                            >
                                <div className="flex flex-col space-y-1 w-full overflow-hidden">
                                <span className="font-medium leading-tight">
                                    {voice.name.includes(' - ') 
                                    ? voice.name.split(' - ')[1] || voice.name.split(' - ')[0]
                                    : voice.name.replace(/Microsoft\s+/, '')
                                    }
                                </span>
                                <div className="flex items-center gap-2 overflow-hidden">
                                    <span className="text-[10px] text-muted-foreground bg-muted/70 px-2 py-0.5 rounded-md font-medium flex-shrink-0">
                                    {voice.name.includes('Microsoft') ? 'Microsoft' : voice.localService ? 'System' : 'Online'}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground opacity-75">
                                    {voice.lang}
                                    </span>
                                </div>
                                </div>
                            </SelectItem>
                            ))}
                        </div>
                        </div>
                    ))}
                    {Object.keys(voiceGroups).length === 0 && (
                        <div className="px-4 py-8 text-xs text-muted-foreground text-center">
                        <div className="space-y-2">
                            <div className="text-lg">🎤</div>
                            <div>No voices available</div>
                            <div className="text-[10px]">Please check your browser settings</div>
                        </div>
                        </div>
                    )}
                    </div>
                </SelectContent>
                </Select>
            </div>

            {/* Speed Control */}
            <div className="space-y-3 bg-muted/20 rounded-lg p-3">
                <div className="flex items-center justify-between">
                <Label htmlFor="speed" className="text-xs text-foreground/80 font-medium flex items-center gap-1">
                    ⚡ Speed
                </Label>
                <span className="text-xs font-mono bg-primary/20 text-primary px-2 py-1 rounded-md">
                    {settings.rate.toFixed(1)}x
                </span>
                </div>
                <Slider
                id="speed"
                min={0.5}
                max={2}
                step={0.1}
                value={[settings.rate]}
                onValueChange={([value]) => updateSettings({ rate: value })}
                className="w-full"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground px-1">
                <span>🐌 Slow</span>
                <span>⚡ Normal</span>
                <span>🚀 Fast</span>
                </div>
            </div>

            {/* Pitch Control */}
            <div className="space-y-3 bg-muted/20 rounded-lg p-3">
                <div className="flex items-center justify-between">
                <Label htmlFor="pitch" className="text-xs text-foreground/80 font-medium flex items-center gap-1">
                    🎵 Pitch
                </Label>
                <span className="text-xs font-mono bg-accent/20 text-accent px-2 py-1 rounded-md">
                    {settings.pitch.toFixed(1)}
                </span>
                </div>
                <Slider
                id="pitch"
                min={0.5}
                max={2}
                step={0.1}
                value={[settings.pitch]}
                onValueChange={([value]) => updateSettings({ pitch: value })}
                className="w-full"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground px-1">
                <span>🔽 Low</span>
                <span>🎵 Normal</span>
                <span>🔼 High</span>
                </div>
            </div>
            </div>
        </PopoverContent>
        </Popover>
    );
};

export default TTSControls;
