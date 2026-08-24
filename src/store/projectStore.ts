import { create } from 'zustand';
import { Project, Transcription, SubtitleStyle, AnimationStyle, BackgroundConfig, AudioConfig } from '@/types';

interface ProjectState {
  currentProject: Project | null;
  isUploading: boolean;
  isTranscribing: boolean;
  isExporting: boolean;
  exportProgress: number;
  
  // Actions
  setCurrentProject: (project: Project | null) => void;
  createProject: (title: string) => Project;
  updateProject: (updates: Partial<Project>) => void;
  setMedia: (url: string, type: 'video' | 'audio') => void;
  setTranscription: (transcription: Transcription) => void;
  updateWord: (index: number, text: string) => void;
  setSubtitleStyle: (style: Partial<SubtitleStyle>) => void;
  setAnimationStyle: (style: AnimationStyle) => void;
  setBackgroundConfig: (config: Partial<BackgroundConfig>) => void;
  setAudioConfig: (config: Partial<AudioConfig>) => void;
  setIsUploading: (value: boolean) => void;
  setIsTranscribing: (value: boolean) => void;
  setIsExporting: (value: boolean) => void;
  setExportProgress: (progress: number) => void;
}

const defaultSubtitleStyle: SubtitleStyle = {
  fontFamily: 'Inter',
  fontSize: 48,
  fontWeight: '700',
  textColor: '#ffffff',
  highlightColor: '#fbbf24',
  backgroundColor: '#000000',
  backgroundOpacity: 0.5,
  strokeWidth: 2,
  strokeColor: '#000000',
  shadowBlur: 4,
  shadowColor: '#000000',
  position: 'bottom',
  alignment: 'center',
  padding: 16,
  borderRadius: 8,
};

const defaultBackgroundConfig: BackgroundConfig = {
  type: 'color',
  color: '#000000',
};

const defaultAudioConfig: AudioConfig = {
  originalVolume: 100,
  useReplacedAudio: false,
};

export const useProjectStore = create<ProjectState>((set, get) => ({
  currentProject: null,
  isUploading: false,
  isTranscribing: false,
  isExporting: false,
  exportProgress: 0,

  setCurrentProject: (project) => set({ currentProject: project }),

  createProject: (title) => {
    const project: Project = {
      id: crypto.randomUUID(),
      title,
      status: 'draft',
      transcriptionEdited: false,
      subtitleStyle: { ...defaultSubtitleStyle },
      animationStyle: 'word-pop',
      backgroundConfig: { ...defaultBackgroundConfig },
      audioConfig: { ...defaultAudioConfig },
      aspectRatio: '16:9',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    set({ currentProject: project });
    return project;
  },

  updateProject: (updates) => {
    const { currentProject } = get();
    if (currentProject) {
      set({
        currentProject: {
          ...currentProject,
          ...updates,
          updatedAt: new Date(),
        },
      });
    }
  },

  setMedia: (url, type) => {
    const { updateProject } = get();
    if (type === 'video') {
      updateProject({ originalMediaUrl: url });
    } else {
      updateProject({ audioUrl: url });
    }
  },

  setTranscription: (transcription) => {
    const { updateProject } = get();
    updateProject({ transcription, transcriptionEdited: false });
  },

  updateWord: (index, text) => {
    const { currentProject, updateProject } = get();
    if (currentProject?.transcription) {
      const newWords = [...currentProject.transcription.words];
      newWords[index] = { ...newWords[index], text };
      updateProject({
        transcription: {
          ...currentProject.transcription,
          words: newWords,
          text: newWords.map(w => w.text).join(' '),
        },
        transcriptionEdited: true,
      });
    }
  },

  setSubtitleStyle: (style) => {
    const { currentProject, updateProject } = get();
    if (currentProject) {
      updateProject({
        subtitleStyle: { ...currentProject.subtitleStyle, ...style },
      });
    }
  },

  setAnimationStyle: (style) => {
    const { updateProject } = get();
    updateProject({ animationStyle: style });
  },

  setBackgroundConfig: (config) => {
    const { currentProject, updateProject } = get();
    if (currentProject) {
      updateProject({
        backgroundConfig: { ...currentProject.backgroundConfig, ...config },
      });
    }
  },

  setAudioConfig: (config) => {
    const { currentProject, updateProject } = get();
    if (currentProject) {
      updateProject({
        audioConfig: { ...currentProject.audioConfig, ...config },
      });
    }
  },

  setIsUploading: (value) => set({ isUploading: value }),
  setIsTranscribing: (value) => set({ isTranscribing: value }),
  setIsExporting: (value) => set({ isExporting: value }),
  setExportProgress: (progress) => set({ exportProgress: progress }),
}));
