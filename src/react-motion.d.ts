declare module 'react-motion' {
  import { ReactNode } from 'react';

  export interface PlainStyle {
    [key: string]: number;
  }

  export interface Style {
    [key: string]: number | OpaqueConfig;
  }

  export interface OpaqueConfig {
    [key: string]: any;
  }

  export function spring(
    value: number,
    config?: { stiffness?: number; damping?: number; precision?: number; delay?: number }
  ): OpaqueConfig;

  export interface MotionProps {
    defaultStyle?: PlainStyle;
    style: Style;
    children: (style: PlainStyle) => ReactNode;
    onRest?: () => void;
  }

  export function Motion(props: MotionProps): JSX.Element;

  export interface StaggeredMotionProps {
    defaultStyles: PlainStyle[];
    styles: (prevStyle: PlainStyle[]) => Style[];
    children: (styles: PlainStyle[]) => ReactNode;
  }

  export function StaggeredMotion(props: StaggeredMotionProps): JSX.Element;

  export interface TransitionProps {
    data: any[];
    defaultKey?: (item: any) => string | number;
    defaultStyle?: (item: any) => PlainStyle;
    styles: (item: any) => Style;
    children: (interpolatedStyle: PlainStyle[], item: any) => ReactNode;
    willEnter?: (key: string) => PlainStyle;
    willLeave?: (key: string) => Style;
  }

  export function TransitionMotion(props: TransitionProps): JSX.Element;
}
