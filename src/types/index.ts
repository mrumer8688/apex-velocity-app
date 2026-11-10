export interface CarModel {
  id: string;
  name: string;
  subtitle: string;
  category: 'Hypercar' | 'Electric GT' | 'Cyber-Coupe' | 'Concept' | 'Track Edition';
  price: string;
  acceleration: string; // e.g. "2.1s 0-60mph"
  topSpeed: string; // e.g. "260 mph"
  power: string; // e.g. "1,450 HP"
  range?: string; // e.g. "420 miles"
  image: string;
  gallery: string[];
  description: string;
  features: string[];
  specs: {
    engine: string;
    drivetrain: string;
    chassis: string;
    weight: string;
    batteryCapacity?: string;
    chargingTime?: string;
  };
}

export interface FeatureItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  highlight: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: string;
  image: string;
  aspectRatio: 'square' | 'wide' | 'tall';
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  avatar: string;
  comment: string;
  rating: number;
  location: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export interface TimelineEvent {
  year: string;
  title: string;
  description: string;
  achievement: string;
}

export interface TestDriveFormData {
  fullName: string;
  email: string;
  phone: string;
  modelId: string;
  preferredDate: string;
  preferredLocation: string;
  comments?: string;
}
