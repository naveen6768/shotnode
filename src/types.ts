/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface EditorFeatureState {
  beatSync: boolean;
  smartReframe: boolean;
  autoCaptions: boolean;
  motionDna: boolean;
}

export interface WaitlistEnrollment {
  email: string;
  platform: string;
  isRegistered: boolean;
  queueNumber?: number;
}

export interface PricingPlan {
  id: string;
  name: string;
  priceMonthly: number;
  priceYearly: number;
  period: string;
  features: string[];
  ctaText: string;
  isPopular?: boolean;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface TimelineClip {
  id: string;
  name: string;
  duration: string;
  type: string;
  thumbnail: string;
  waveformHeight: number[];
}
