export enum GameScreen {
  MENU = 'MENU',
  SIMON = 'SIMON',
  MATCH = 'MATCH',
  SORT = 'SORT',
}

export interface Difficulty {
  level: number;
  speed: number;
  itemCount: number;
}

export interface FeedbackData {
  message: string;
  isPositive: boolean;
  fact?: string;
}

export interface DragItem {
  id: number;
  type: 'sunflower' | 'rose' | 'tulip';
  x: number;
  y: number;
  isDragging: boolean;
  matched: boolean;
}

export interface DropZone {
  type: 'sunflower' | 'rose' | 'tulip';
  x: number;
  y: number;
  width: number;
  height: number;
}