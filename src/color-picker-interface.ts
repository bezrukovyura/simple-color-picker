export interface IColorPicker {

    new(idWrapper: string, colorDefault: string, colorsForPallet: string[]): IColorPicker;
  
    value: () => void | string;
  
    addEventListener: (eventName: string, callBack: (e: any)=> void) => void;
  
  }