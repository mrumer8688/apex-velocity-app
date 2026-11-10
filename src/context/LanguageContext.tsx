import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { triggerHaptic } from '../utils/haptics';

export type SupportedLanguage = 'en' | 'ur' | 'de' | 'ar' | 'it' | 'fr' | 'ja';

export interface LanguageInfo {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
  dir: 'ltr' | 'rtl';
}

export const LANGUAGES: LanguageInfo[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧', dir: 'ltr' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', flag: '🇵🇰', dir: 'rtl' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', dir: 'ltr' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇦🇪', dir: 'rtl' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹', dir: 'ltr' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', dir: 'ltr' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', dir: 'ltr' },
];

const TRANSLATIONS: Record<SupportedLanguage, Record<string, string>> = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.about': 'About',
    'nav.fleet': 'Fleet',
    'nav.experience': 'Experience',
    'nav.global': 'Global',
    'nav.pulse': 'Pulse',
    'nav.contact': 'Contact',
    'nav.search': 'Search',
    'nav.compare': 'Compare',
    'nav.testDrive': 'Test Drive',
    'nav.menu': 'Menu',

    // AR & Color Picker
    'ar.title': 'AR Hypercar Studio',
    'ar.cameraLive': 'AR CAMERA LIVE',
    'ar.studioLive': 'AR STUDIO VIEW',
    'ar.paintFinish': 'Paint & Finish Lab',
    'ar.colorFinishLab': 'Apex Bespoke Color Lab',
    'ar.finishType': 'Finish Type',
    'ar.customColor': 'Custom Hex / Palette',
    'ar.presetBespoke': 'Curated Bespoke Shades',
    'ar.metallic': 'Metallic',
    'ar.matte': 'Matte',
    'ar.pearl': 'Pearl',
    'ar.chrome': 'Chrome',
    'ar.carbon': 'Carbon',
    'ar.frozen': 'Frozen',
    'ar.clearcoat': 'Clearcoat Specular',
    'ar.roughness': 'Surface Roughness',
    'ar.dragHint': 'Drag to Rotate • Pinch to Scale',
    'ar.capture': 'Capture Photo',
    'ar.saved': 'AR Snapshot Saved to Gallery',
    'ar.deskScale': 'Desk (1:10)',
    'ar.fullScale': '1:1 Scale',
    'ar.hudOn': 'HUD ON',
    'ar.hudOff': 'HUD',
    'ar.reset': 'Reset',
    'ar.close': 'Close',

    // Telemetry HUD
    'telemetry.title': 'TELEMETRY & LAP TIMER',
    'telemetry.speedTraps': 'SPEED TRAPS',
    'telemetry.predicted': 'PREDICTED',
    'telemetry.lateralMargin': 'LATERAL MARGIN',
    'telemetry.holdToAccel': 'HOLD TO ACCEL',
    'telemetry.pulling': 'PULLING...',
    'telemetry.launchControl': 'LC',
    'telemetry.chassisRadar': 'CHASSIS G-RADAR',
    'telemetry.velocity': 'VELOCITY DYNAMICS',
    'telemetry.torque': 'TORQUE VECTORING',
    'telemetry.gear': 'GEAR',
    'telemetry.radius': 'RADIUS',
    'telemetry.straight': 'STRAIGHT',
    'telemetry.deltaToBest': 'DELTA TO BEST',

    // Themes & General
    'theme.midnight': 'Midnight',
    'theme.sunset': 'Sunset',
    'theme.lighting': 'Ambient Lighting',
    'lang.language': 'Language',
    'lang.selectLanguage': 'Select Language',
    'common.hp': 'HP',
    'common.topSpeed': 'Top Speed',
    'common.acceleration': '0-60 mph',
  },

  ur: {
    // Navigation (اردو)
    'nav.home': 'ہوم',
    'nav.about': 'ہمارے متعلق',
    'nav.fleet': 'گاڑیاں (فلیٹ)',
    'nav.experience': 'تجربہ',
    'nav.global': 'عالمی موجودگی',
    'nav.pulse': 'پلس کمیونٹی',
    'nav.contact': 'رابطہ',
    'nav.search': 'تلاش',
    'nav.compare': 'موازنہ',
    'nav.testDrive': 'ٹیسٹ ڈرائیو',
    'nav.menu': 'مینو',

    // AR & Color Picker
    'ar.title': 'اے آر ہائپرکار سٹوڈیو',
    'ar.cameraLive': 'اے آر کیمرہ لائیو',
    'ar.studioLive': 'اے آر سٹوڈیو ویو',
    'ar.paintFinish': 'رنگ اور فنش لیب',
    'ar.colorFinishLab': 'ایپیکس کلر سٹوڈیو',
    'ar.finishType': 'فنش کی قسم',
    'ar.customColor': 'اپنی پسند کا رنگ (Hex)',
    'ar.presetBespoke': 'منتخب شاہکار رنگ',
    'ar.metallic': 'میٹالک (چمکیلا)',
    'ar.matte': 'میٹ (دھندلا)',
    'ar.pearl': 'پرل (موتی چمک)',
    'ar.chrome': 'کروم (آئینہ)',
    'ar.carbon': 'کاربن فائبر',
    'ar.frozen': 'فروزن (ٹھنڈا)',
    'ar.clearcoat': 'شائننگ کوٹنگ',
    'ar.roughness': 'کھردرا پن',
    'ar.dragHint': 'گھمانے کے لیے ڈریگ کریں • سکیل کے لیے پنچ کریں',
    'ar.capture': 'تصویر کھینچیں',
    'ar.saved': 'اے آر تصویر محفوظ ہو گئی',
    'ar.deskScale': 'ڈیسک (1:10)',
    'ar.fullScale': 'اصل سائز (1:1)',
    'ar.hudOn': 'ایچ یو ڈی آن',
    'ar.hudOff': 'ایچ یو ڈی',
    'ar.reset': 'ری سیٹ',
    'ar.close': 'بند کریں',

    // Telemetry HUD
    'telemetry.title': 'ٹیلی میٹری اور لیپ ٹائمر',
    'telemetry.speedTraps': 'سپیڈ ٹریپس',
    'telemetry.predicted': 'پیشن گوئی جی فورس',
    'telemetry.lateralMargin': 'گرپ کی حد',
    'telemetry.holdToAccel': 'ریس دبائے رکھیں',
    'telemetry.pulling': 'کھینچ رہا ہے...',
    'telemetry.launchControl': 'لانچ کنٹرول',
    'telemetry.chassisRadar': 'چیسیس جی ریڈار',
    'telemetry.velocity': 'رفتار ڈائنامکس',
    'telemetry.torque': 'ٹارک ویکٹرنگ',
    'telemetry.gear': 'گیئر',
    'telemetry.radius': 'موڑ کا رداس',
    'telemetry.straight': 'سیدھا ٹریک',
    'telemetry.deltaToBest': 'بہترین وقت کا فرق',

    // Themes & General
    'theme.midnight': 'مڈ نائٹ (ڈارک)',
    'theme.sunset': 'سن سیٹ (گولڈن)',
    'theme.lighting': 'ماحولیاتی لائٹنگ',
    'lang.language': 'زبان',
    'lang.selectLanguage': 'زبان منتخب کریں',
    'common.hp': 'ہارس پاور',
    'common.topSpeed': 'انتہائی رفتار',
    'common.acceleration': '0 تا 60 میل/گھنٹہ',
  },

  de: {
    // German (Deutsch)
    'nav.home': 'Startseite',
    'nav.about': 'Über Uns',
    'nav.fleet': 'Flotte',
    'nav.experience': 'Erlebnis',
    'nav.global': 'Global',
    'nav.pulse': 'Community',
    'nav.contact': 'Kontakt',
    'nav.search': 'Suche',
    'nav.compare': 'Vergleich',
    'nav.testDrive': 'Probefahrt',
    'nav.menu': 'Menü',

    'ar.title': 'AR Hypercar Studio',
    'ar.cameraLive': 'AR KAMERA LIVE',
    'ar.studioLive': 'AR ATELIER ANSICHT',
    'ar.paintFinish': 'Lackierung & Finish Lab',
    'ar.colorFinishLab': 'Apex Bespoke Farblabor',
    'ar.finishType': 'Oberflächen-Finish',
    'ar.customColor': 'Individuelle Farbe (Hex)',
    'ar.presetBespoke': 'Kuratierte Farbtöne',
    'ar.metallic': 'Metallic',
    'ar.matte': 'Matt',
    'ar.pearl': 'Perleffekt',
    'ar.chrome': 'Chrom',
    'ar.carbon': 'Kohlefaser',
    'ar.frozen': 'Gefroren Matt',
    'ar.clearcoat': 'Klarlack-Glanz',
    'ar.roughness': 'Oberflächenrauheit',
    'ar.dragHint': 'Ziehen zum Drehen • Skalieren',
    'ar.capture': 'Foto aufnehmen',
    'ar.saved': 'AR Schnappschuss gespeichert',
    'ar.deskScale': 'Schreibtisch (1:10)',
    'ar.fullScale': '1:1 Maßstab',
    'ar.hudOn': 'HUD AN',
    'ar.hudOff': 'HUD',
    'ar.reset': 'Zurücksetzen',
    'ar.close': 'Schließen',

    'telemetry.title': 'TELEMETRIE & RUNDENZEIT',
    'telemetry.speedTraps': 'GESCHWINDIGKEITSMESSUNG',
    'telemetry.predicted': 'PROGNOSTIZIERT',
    'telemetry.lateralMargin': 'QUERBESCHLEUNIGUNGSMARGE',
    'telemetry.holdToAccel': 'GAS GEBEN HALTEN',
    'telemetry.pulling': 'BESCHLEUNIGT...',
    'telemetry.launchControl': 'LC',
    'telemetry.chassisRadar': 'CHASSIS G-RADAR',
    'telemetry.velocity': 'GESCHWINDIGKEITS-DYNAMIK',
    'telemetry.torque': 'DREHMOMENT-VEKTORING',
    'telemetry.gear': 'GANG',
    'telemetry.radius': 'RADIUS',
    'telemetry.straight': 'GERADE',
    'telemetry.deltaToBest': 'DELTA ZUR BESTZEIT',

    'theme.midnight': 'Mitternacht',
    'theme.sunset': 'Sonnenuntergang',
    'theme.lighting': 'Ambiente-Beleuchtung',
    'lang.language': 'Sprache',
    'lang.selectLanguage': 'Sprache wählen',
    'common.hp': 'PS',
    'common.topSpeed': 'Höchstgeschwindigkeit',
    'common.acceleration': '0-100 km/h',
  },

  ar: {
    // Arabic (العربية)
    'nav.home': 'الرئيسية',
    'nav.about': 'نبذة عنا',
    'nav.fleet': 'الأسطول الفائق',
    'nav.experience': 'التجربة',
    'nav.global': 'الانتشار العالمي',
    'nav.pulse': 'المجتمع',
    'nav.contact': 'اتصل بنا',
    'nav.search': 'بحث',
    'nav.compare': 'مقارنة',
    'nav.testDrive': 'تجربة القيادة',
    'nav.menu': 'القائمة',

    'ar.title': 'استوديو الواقع المعزز',
    'ar.cameraLive': 'كاميرا الواقع المعزز مباشرة',
    'ar.studioLive': 'معاينة الاستوديو',
    'ar.paintFinish': 'مختبر ألوان الطلاء واللمسات',
    'ar.colorFinishLab': 'مختبر ألوان أبيكس الحصري',
    'ar.finishType': 'نوع اللمسة النهائية',
    'ar.customColor': 'لون مخصص (Hex)',
    'ar.presetBespoke': 'مجموعة الألوان الملكية',
    'ar.metallic': 'ميتاليك معدني',
    'ar.matte': 'مطفي (مات)',
    'ar.pearl': 'لؤلؤي براق',
    'ar.chrome': 'كروم عاكس',
    'ar.carbon': 'ألياف الكربون',
    'ar.frozen': 'مثلج فاخر',
    'ar.clearcoat': 'طبقة الحماية اللامعة',
    'ar.roughness': 'خشونة السطح',
    'ar.dragHint': 'اسحب للتدوير • باعد للتحجيم',
    'ar.capture': 'التقاط صورة',
    'ar.saved': 'تم حفظ لقطة الواقع المعزز',
    'ar.deskScale': 'مكتبي (1:10)',
    'ar.fullScale': 'حجم حقيقي (1:1)',
    'ar.hudOn': 'شاشة العرض تعمل',
    'ar.hudOff': 'شاشة العرض',
    'ar.reset': 'إعادة ضبط',
    'ar.close': 'إغلاق',

    'telemetry.title': 'القياس عن بُعد وتوقيت اللفة',
    'telemetry.speedTraps': 'فخاخ السرعة',
    'telemetry.predicted': 'قوة G المتوقعة',
    'telemetry.lateralMargin': 'هامش التماسك الجانبي',
    'telemetry.holdToAccel': 'اضغط مطولاً للتسارع',
    'telemetry.pulling': 'تسارع نشط...',
    'telemetry.launchControl': 'التحكم بالانطلاق',
    'telemetry.chassisRadar': 'رادار قوى الهيكل',
    'telemetry.velocity': 'ديناميكيات السرعة',
    'telemetry.torque': 'توزيع عزم الدوران',
    'telemetry.gear': 'السرعة',
    'telemetry.radius': 'نصف القطر',
    'telemetry.straight': 'مستقيم',
    'telemetry.deltaToBest': 'الفارق عن أفضل زمن',

    'theme.midnight': 'منتصف الليل',
    'theme.sunset': 'الغروب الذهبي',
    'theme.lighting': 'الإضاءة المحيطة',
    'lang.language': 'اللغة',
    'lang.selectLanguage': 'اختر اللغة',
    'common.hp': 'حصان',
    'common.topSpeed': 'السرعة القصوى',
    'common.acceleration': '0-100 كم/س',
  },

  it: {
    // Italian (Italiano)
    'nav.home': 'Home',
    'nav.about': 'Chi Siamo',
    'nav.fleet': 'Flotta Hypercar',
    'nav.experience': 'Esperienza',
    'nav.global': 'Globale',
    'nav.pulse': 'Community',
    'nav.contact': 'Contatti',
    'nav.search': 'Cerca',
    'nav.compare': 'Confronta',
    'nav.testDrive': 'Test Drive',
    'nav.menu': 'Menu',

    'ar.title': 'Studio Hypercar AR',
    'ar.cameraLive': 'FOTOCAMERA AR LIVE',
    'ar.studioLive': 'VISTA ATELIER AR',
    'ar.paintFinish': 'Laboratorio Vernici & Finiture',
    'ar.colorFinishLab': 'Apex Atelier Colori Su Misura',
    'ar.finishType': 'Finitura Vernice',
    'ar.customColor': 'Colore Personalizzato (Hex)',
    'ar.presetBespoke': 'Tonalità Iconiche Apex',
    'ar.metallic': 'Metallizzato',
    'ar.matte': 'Opaco (Matte)',
    'ar.pearl': 'Perlato',
    'ar.chrome': 'Cromo Specchiato',
    'ar.carbon': 'Fibra di Carbonio',
    'ar.frozen': 'Frozen Ghiaccio',
    'ar.clearcoat': 'Trasparente Lucido',
    'ar.roughness': 'Ruvidità Superficie',
    'ar.dragHint': 'Trascina per ruotare • Pizzica per scalare',
    'ar.capture': 'Scatta Foto',
    'ar.saved': 'Istantanea AR Salvata',
    'ar.deskScale': 'Tavolo (1:10)',
    'ar.fullScale': 'Scala Reale 1:1',
    'ar.hudOn': 'HUD ATTIVO',
    'ar.hudOff': 'HUD',
    'ar.reset': 'Ripristina',
    'ar.close': 'Chiudi',

    'telemetry.title': 'TELEMETRIA & TEMPI SUL GIRO',
    'telemetry.speedTraps': 'TRAPPOLE DI VELOCITÀ',
    'telemetry.predicted': 'G-FORCE PREVISTA',
    'telemetry.lateralMargin': 'MARGINE ADERENZA LATERALE',
    'telemetry.holdToAccel': 'TIENI PREMUTO PER ACCELERARE',
    'telemetry.pulling': 'SPINTA ATTIVA...',
    'telemetry.launchControl': 'LC',
    'telemetry.chassisRadar': 'RADAR G DEL TELAIO',
    'telemetry.velocity': 'DINAMICA DI VELOCITÀ',
    'telemetry.torque': 'VETTORIZZAZIONE DI COPPIA',
    'telemetry.gear': 'MARCIA',
    'telemetry.radius': 'RAGGIO',
    'telemetry.straight': 'RETTILINEO',
    'telemetry.deltaToBest': 'DELTA DAL MIGLIOR GIRO',

    'theme.midnight': 'Mezzanotte',
    'theme.sunset': 'Tramonto',
    'theme.lighting': 'Illuminazione Ambientale',
    'lang.language': 'Lingua',
    'lang.selectLanguage': 'Seleziona Lingua',
    'common.hp': 'CV',
    'common.topSpeed': 'Velocità Max',
    'common.acceleration': '0-100 km/h',
  },

  fr: {
    // French (Français)
    'nav.home': 'Accueil',
    'nav.about': 'À Propos',
    'nav.fleet': 'Flotte Hypercar',
    'nav.experience': 'Expérience',
    'nav.global': 'Présence Globale',
    'nav.pulse': 'Communauté',
    'nav.contact': 'Contact',
    'nav.search': 'Recherche',
    'nav.compare': 'Comparer',
    'nav.testDrive': 'Essai Routier',
    'nav.menu': 'Menu',

    'ar.title': 'Studio Hypercar AR',
    'ar.cameraLive': 'CAMÉRA AR EN DIRECT',
    'ar.studioLive': 'VUE ATELIER AR',
    'ar.paintFinish': 'Atelier Peintures & Finitions',
    'ar.colorFinishLab': 'Apex Laboratoire Couleurs',
    'ar.finishType': 'Type de Finition',
    'ar.customColor': 'Couleur Sur-Mesure (Hex)',
    'ar.presetBespoke': 'Nuances Exclusives Apex',
    'ar.metallic': 'Métallisé',
    'ar.matte': 'Mat Satiné',
    'ar.pearl': 'Nacré Perlé',
    'ar.chrome': 'Chrome Miroir',
    'ar.carbon': 'Fibre de Carbone',
    'ar.frozen': 'Frozen Givré',
    'ar.clearcoat': 'Vernis Brillant',
    'ar.roughness': 'Rugosité',
    'ar.dragHint': 'Glisser pour pivoter • Pincer pour zoomer',
    'ar.capture': 'Capturer Photo',
    'ar.saved': 'Photo AR enregistrée',
    'ar.deskScale': 'Bureau (1:10)',
    'ar.fullScale': 'Échelle Réelle 1:1',
    'ar.hudOn': 'HUD ACTIF',
    'ar.hudOff': 'HUD',
    'ar.reset': 'Réinitialiser',
    'ar.close': 'Fermer',

    'telemetry.title': 'TÉLÉMÉTRIE & CHRONO AU TOUR',
    'telemetry.speedTraps': 'RADARS DE VITESSE',
    'telemetry.predicted': 'G-LATÉRAL PRÉDIT',
    'telemetry.lateralMargin': 'MARGE D’ADHÉRENCE',
    'telemetry.holdToAccel': 'MAINTENIR POUR ACCÉLÉRER',
    'telemetry.pulling': 'ACCÉLÉRATION...',
    'telemetry.launchControl': 'LC',
    'telemetry.chassisRadar': 'RADAR G DU CHÂSSIS',
    'telemetry.velocity': 'DYNAMIQUE DE VITESSE',
    'telemetry.torque': 'VECTORISATION DE COUPLE',
    'telemetry.gear': 'RAPPORT',
    'telemetry.radius': 'RAYON',
    'telemetry.straight': 'LIGNE DROITE',
    'telemetry.deltaToBest': 'DELTA DU MEILLEUR TOUR',

    'theme.midnight': 'Minuit',
    'theme.sunset': 'Coucher de Soleil',
    'theme.lighting': 'Éclairage Ambiant',
    'lang.language': 'Langue',
    'lang.selectLanguage': 'Sélectionner la Langue',
    'common.hp': 'CH',
    'common.topSpeed': 'Vitesse Max',
    'common.acceleration': '0-100 km/h',
  },

  ja: {
    // Japanese (日本語)
    'nav.home': 'ホーム',
    'nav.about': '企業情報',
    'nav.fleet': 'ハイパーカー艦隊',
    'nav.experience': 'エクスペリエンス',
    'nav.global': 'グローバル拠点',
    'nav.pulse': 'コミュニティ',
    'nav.contact': 'お問い合わせ',
    'nav.search': '検索',
    'nav.compare': '車両比較',
    'nav.testDrive': '試乗予約',
    'nav.menu': 'メニュー',

    'ar.title': 'AR ハイパーカースタジオ',
    'ar.cameraLive': 'ARカメラ ライブ',
    'ar.studioLive': 'ARスタジオ ビュー',
    'ar.paintFinish': 'ペイント＆フィニッシュ ラボ',
    'ar.colorFinishLab': 'アペックス・ビスポーク カラーラボ',
    'ar.finishType': '塗装フィニッシュ',
    'ar.customColor': 'カスタムカラー (Hex)',
    'ar.presetBespoke': '厳選ビスポークシェード',
    'ar.metallic': 'メタリック',
    'ar.matte': 'マット',
    'ar.pearl': 'パール',
    'ar.chrome': 'クローム',
    'ar.carbon': 'カーボンファイバー',
    'ar.frozen': 'フローズン',
    'ar.clearcoat': 'クリアコート光沢',
    'ar.roughness': '表面粗さ',
    'ar.dragHint': 'ドラッグで回転 • ピンチでスケール',
    'ar.capture': 'フォト撮影',
    'ar.saved': 'ARスナップショットを保存しました',
    'ar.deskScale': 'デスク (1:10)',
    'ar.fullScale': '実車 1:1 スケール',
    'ar.hudOn': 'HUD オン',
    'ar.hudOff': 'HUD',
    'ar.reset': 'リセット',
    'ar.close': '閉じる',

    'telemetry.title': 'テレメトリー＆ラップタイマー',
    'telemetry.speedTraps': 'スピードトラップ',
    'telemetry.predicted': '予測Gフォース',
    'telemetry.lateralMargin': 'グリップ限界マージン',
    'telemetry.holdToAccel': '長押しで加速',
    'telemetry.pulling': '加速中...',
    'telemetry.launchControl': 'LC',
    'telemetry.chassisRadar': 'シャシー Gレーダー',
    'telemetry.velocity': 'ベロシティ・ダイナミクス',
    'telemetry.torque': 'トルクベクタリング',
    'telemetry.gear': 'ギア',
    'telemetry.radius': 'コーナー半径',
    'telemetry.straight': 'ストレート',
    'telemetry.deltaToBest': 'ベストラップ差',

    'theme.midnight': 'ミッドナイト',
    'theme.sunset': 'サンセット',
    'theme.lighting': '環境ライティング',
    'lang.language': '言語',
    'lang.selectLanguage': '言語を選択',
    'common.hp': '馬力',
    'common.topSpeed': '最高速度',
    'common.acceleration': '0-100 km/h',
  },
};

interface LanguageContextType {
  language: SupportedLanguage;
  currentLanguageInfo: LanguageInfo;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: string, fallback?: string) => string;
  isRTL: boolean;
  languages: LanguageInfo[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANG_STORAGE_KEY = 'apex_velocity_lang';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(LANG_STORAGE_KEY) as SupportedLanguage;
        if (saved && TRANSLATIONS[saved]) {
          return saved;
        }
      } catch {
        // Ignore localStorage error
      }
    }
    return 'en';
  });

  const currentLanguageInfo = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];
  const isRTL = currentLanguageInfo.dir === 'rtl';

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
      document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    }
    try {
      localStorage.setItem(LANG_STORAGE_KEY, language);
    } catch {
      // Ignore
    }
  }, [language, isRTL]);

  const setLanguage = useCallback((newLang: SupportedLanguage) => {
    if (TRANSLATIONS[newLang]) {
      setLanguageState(newLang);
      triggerHaptic('light');
    }
  }, []);

  const t = useCallback(
    (key: string, fallback?: string): string => {
      const activeDict = TRANSLATIONS[language];
      if (activeDict && activeDict[key]) {
        return activeDict[key];
      }
      const fallbackDict = TRANSLATIONS.en;
      if (fallbackDict && fallbackDict[key]) {
        return fallbackDict[key];
      }
      return fallback || key;
    },
    [language]
  );

  return (
    <LanguageContext.Provider
      value={{
        language,
        currentLanguageInfo,
        setLanguage,
        t,
        isRTL,
        languages: LANGUAGES,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
