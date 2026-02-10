export type RoomTypeKey =
  | 'bedroom'
  | 'kitchen'
  | 'bathroom'
  | 'wc'
  | 'living_room';

export interface RoomDimensions {
  width: number;
  length: number;
  height: number;
  unit: 'm';
}

export interface RoomTypeDefinition {
  key: RoomTypeKey;
  label: string;
  description: string;
  defaultDimensions: RoomDimensions;
  safetyNotes?: string[];
}

export type RoomObstacleCategory = 'furniture' | 'opening' | 'fixture';

export interface RoomObstacleDefinition {
  id: string;
  label: string;
  category: RoomObstacleCategory;
  width: number;
  height: number;
  depth: number;
  // Normalized placement inside the room (from -0.45 to 0.45)
  placement: {
    x: number;
    z: number;
  };
  blocksLight?: boolean;
}

export const ROOM_TYPES: RoomTypeDefinition[] = [
  {
    key: 'bedroom',
    label: 'Bedroom',
    description: 'Relaxing spaces focused on comfort and calm lighting.',
    defaultDimensions: { width: 4.2, length: 5.2, height: 2.7, unit: 'm' },
  },
  {
    key: 'kitchen',
    label: 'Kitchen',
    description: 'Task-driven spaces that need layered lighting.',
    defaultDimensions: { width: 3.6, length: 4.4, height: 2.7, unit: 'm' },
  },
  {
    key: 'bathroom',
    label: 'Bathroom',
    description: 'Humidity-aware lighting zones with strict safety rules.',
    defaultDimensions: { width: 2.6, length: 3.4, height: 2.6, unit: 'm' },
    safetyNotes: [
      'Wet areas must use appropriate IP-rated fixtures.',
      'Hammam/sauna zones require 24V installations.',
    ],
  },
  {
    key: 'wc',
    label: 'WC',
    description: 'Compact sanitary rooms with focused lighting.',
    defaultDimensions: { width: 1.8, length: 2.2, height: 2.5, unit: 'm' },
  },
  {
    key: 'living_room',
    label: 'Living room',
    description: 'Multi-purpose rooms with layered ambient lighting.',
    defaultDimensions: { width: 5.4, length: 6.2, height: 2.8, unit: 'm' },
  },
];

export const ROOM_OBSTACLES: Record<RoomTypeKey, RoomObstacleDefinition[]> = {
  bedroom: [
    {
      id: 'bed',
      label: 'Bed',
      category: 'furniture',
      width: 2.0,
      depth: 2.1,
      height: 0.55,
      placement: { x: -0.2, z: 0.15 },
      blocksLight: true,
    },
    {
      id: 'closet',
      label: 'Closet',
      category: 'furniture',
      width: 1.6,
      depth: 0.65,
      height: 2.2,
      placement: { x: 0.35, z: -0.3 },
      blocksLight: true,
    },
    {
      id: 'tv-stand',
      label: 'TV stand',
      category: 'furniture',
      width: 1.4,
      depth: 0.45,
      height: 0.6,
      placement: { x: 0.25, z: 0.35 },
      blocksLight: true,
    },
    {
      id: 'window',
      label: 'Window',
      category: 'opening',
      width: 1.3,
      depth: 0.15,
      height: 1.1,
      placement: { x: -0.35, z: -0.42 },
      blocksLight: false,
    },
    {
      id: 'door',
      label: 'Door',
      category: 'opening',
      width: 0.9,
      depth: 0.15,
      height: 2.1,
      placement: { x: 0.45, z: -0.4 },
      blocksLight: false,
    },
    {
      id: 'wall-lamps',
      label: 'Wall lamps',
      category: 'fixture',
      width: 0.4,
      depth: 0.2,
      height: 0.3,
      placement: { x: -0.42, z: 0.1 },
    },
    {
      id: 'hidden-lights',
      label: 'Hidden lights',
      category: 'fixture',
      width: 2.0,
      depth: 0.2,
      height: 0.15,
      placement: { x: 0.0, z: -0.2 },
    },
  ],
  kitchen: [
    {
      id: 'kitchen-cabinets',
      label: 'Kitchen elements',
      category: 'furniture',
      width: 2.6,
      depth: 0.7,
      height: 2.2,
      placement: { x: -0.35, z: -0.35 },
      blocksLight: true,
    },
    {
      id: 'table',
      label: 'Table',
      category: 'furniture',
      width: 1.2,
      depth: 0.8,
      height: 0.75,
      placement: { x: 0.15, z: 0.2 },
      blocksLight: true,
    },
    {
      id: 'window',
      label: 'Window',
      category: 'opening',
      width: 1.2,
      depth: 0.15,
      height: 1.0,
      placement: { x: 0.4, z: -0.4 },
      blocksLight: false,
    },
    {
      id: 'door',
      label: 'Door',
      category: 'opening',
      width: 0.9,
      depth: 0.15,
      height: 2.1,
      placement: { x: -0.45, z: 0.35 },
      blocksLight: false,
    },
  ],
  bathroom: [
    {
      id: 'vanity',
      label: 'Vanity',
      category: 'furniture',
      width: 1.0,
      depth: 0.5,
      height: 0.85,
      placement: { x: -0.2, z: 0.35 },
      blocksLight: true,
    },
    {
      id: 'shower',
      label: 'Shower / Hammam zone',
      category: 'furniture',
      width: 1.0,
      depth: 1.0,
      height: 2.2,
      placement: { x: 0.35, z: -0.1 },
      blocksLight: true,
    },
    {
      id: 'mirror',
      label: 'Mirror',
      category: 'fixture',
      width: 0.8,
      depth: 0.1,
      height: 0.8,
      placement: { x: -0.2, z: 0.45 },
      blocksLight: false,
    },
    {
      id: 'window',
      label: 'Window',
      category: 'opening',
      width: 0.8,
      depth: 0.15,
      height: 0.6,
      placement: { x: 0.42, z: 0.4 },
      blocksLight: false,
    },
    {
      id: 'door',
      label: 'Door',
      category: 'opening',
      width: 0.8,
      depth: 0.15,
      height: 2.0,
      placement: { x: -0.45, z: -0.4 },
      blocksLight: false,
    },
  ],
  wc: [
    {
      id: 'toilet',
      label: 'Toilet',
      category: 'furniture',
      width: 0.6,
      depth: 0.7,
      height: 0.8,
      placement: { x: 0.1, z: 0.25 },
      blocksLight: true,
    },
    {
      id: 'sink',
      label: 'Sink',
      category: 'furniture',
      width: 0.5,
      depth: 0.4,
      height: 0.85,
      placement: { x: -0.2, z: -0.1 },
      blocksLight: true,
    },
    {
      id: 'mirror',
      label: 'Mirror',
      category: 'fixture',
      width: 0.5,
      depth: 0.1,
      height: 0.6,
      placement: { x: -0.2, z: -0.35 },
      blocksLight: false,
    },
    {
      id: 'door',
      label: 'Door',
      category: 'opening',
      width: 0.75,
      depth: 0.15,
      height: 2.0,
      placement: { x: 0.45, z: -0.4 },
      blocksLight: false,
    },
  ],
  living_room: [
    {
      id: 'sofa',
      label: 'Couch',
      category: 'furniture',
      width: 2.4,
      depth: 1.0,
      height: 0.9,
      placement: { x: -0.25, z: 0.2 },
      blocksLight: true,
    },
    {
      id: 'coffee-table',
      label: 'Table',
      category: 'furniture',
      width: 1.2,
      depth: 0.7,
      height: 0.45,
      placement: { x: 0.0, z: 0.05 },
      blocksLight: true,
    },
    {
      id: 'tv-stand',
      label: 'TV stand',
      category: 'furniture',
      width: 1.6,
      depth: 0.45,
      height: 0.6,
      placement: { x: 0.3, z: -0.2 },
      blocksLight: true,
    },
    {
      id: 'wall-lamps',
      label: 'Wall lamps',
      category: 'fixture',
      width: 0.5,
      depth: 0.2,
      height: 0.3,
      placement: { x: -0.42, z: -0.1 },
    },
    {
      id: 'hidden-lights',
      label: 'Hidden lights',
      category: 'fixture',
      width: 2.4,
      depth: 0.2,
      height: 0.15,
      placement: { x: 0.1, z: 0.4 },
    },
    {
      id: 'ceiling-light',
      label: 'Ceiling lights',
      category: 'fixture',
      width: 0.6,
      depth: 0.6,
      height: 0.25,
      placement: { x: 0.0, z: -0.35 },
    },
  ],
};
