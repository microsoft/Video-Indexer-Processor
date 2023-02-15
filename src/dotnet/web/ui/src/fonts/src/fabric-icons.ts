// Your use of the content in the files referenced here is subject to the terms of the license at https://aka.ms/fabric-assets-license

// tslint:disable:max-line-length

import { IIconOptions, IIconSubset, registerIcons } from '@uifabric/styling';

export function initializeIcons(baseUrl: string = '', options?: IIconOptions): void {
  const subset: IIconSubset = {
    style: {
      MozOsxFontSmoothing: 'grayscale',
      WebkitFontSmoothing: 'antialiased',
      fontStyle: 'normal',
      fontWeight: 'normal',
      speak: 'none',
    },
    fontFace: {
      fontFamily: `"FabricMDL2Icons"`,
      src: `url('${baseUrl}fabric-icons-0ffc5935.woff') format('woff')`,
    },
    icons: {
      IntersectShape: '\uF8FD',
      UniteShape: '\uF8FB',
    },
  };

  registerIcons(subset, options);
}
