export type PaintType = 'gloss' | 'matte' | 'metallic' | 'pearl' | 'chrome' | 'carbon' | 'frozen';

export type WheelStyle = 'spoke10' | 'turbofan' | 'diamond' | 'concave' | 'beadlock';
export type TireType = 'slick' | 'street' | 'semislick';
export type CaliperColor = '#FF1E00' | '#FFD700' | '#FF5A1F' | '#00E5FF' | '#111111' | '#39FF14';

export type FrontBumperStyle = 'stock' | 'gt' | 'cyber' | 'widebody';
export type RearBumperStyle = 'stock' | 'f1' | 'extreme';
export type HoodStyle = 'stock' | 'carbon' | 'naca';
export type RoofStyle = 'body' | 'carbon' | 'panoramic';
export type SpoilerStyle = 'lip' | 'gt3' | 'speedtail' | 'clean';
export type SkirtStyle = 'stock' | 'widebody';
export type LightStyle = 'matrix' | 'cyber' | 'stealth';
export type RideHeight = 'slam' | 'track' | 'offroad';

export type SeatMaterial = 'alcantara' | 'leather_red' | 'leather_black' | 'carbon_bucket';
export type TrimMaterial = 'carbon' | 'aluminum' | 'bronze';

export interface CarConfigState {
  paintColor: string;
  paintType: PaintType;
  clearcoat: number; // 0 to 1
  roughness: number; // 0 to 1

  wheelStyle: WheelStyle;
  wheelColor: 'silver' | 'black' | 'bronze' | 'gold' | 'chrome';
  tireType: TireType;
  caliperColor: CaliperColor;

  frontBumper: FrontBumperStyle;
  rearBumper: RearBumperStyle;
  hood: HoodStyle;
  roof: RoofStyle;
  spoiler: SpoilerStyle;
  sideSkirts: SkirtStyle;
  headlightStyle: LightStyle;
  headlightsOn: boolean;
  underglowOn: boolean;
  underglowColor: string;
  rideHeight: RideHeight;

  seatMaterial: SeatMaterial;
  trimMaterial: TrimMaterial;
  interiorAmbientColor: string;

  autoRotate: boolean;
  cinematicMode: boolean;
  showStudioFloor: boolean;
}

export type ConfigCategory = 'paint' | 'body' | 'wheels' | 'lighting' | 'interior' | 'camera';
