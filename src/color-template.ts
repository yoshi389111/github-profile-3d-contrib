import * as type from './type';

export const NormalSettings: type.NormalColorSettings = {
    type: 'normal',
    backgroundColor: '#ffffff',
    foregroundColor: '#00000f',
    strongColor: '#111133',
    weakColor: 'gray',
    radarColor: '#47a042',
    contribColors: ['#efefef', '#d8e887', '#8cc569', '#47a042', '#1d6a23'],
};

export const HalloweenSettings: type.NormalColorSettings = {
    type: 'normal',
    backgroundColor: '#ffffff',
    foregroundColor: '#00000f',
    strongColor: '#111133',
    weakColor: 'gray',
    radarColor: '#47a042',
    contribColors: ['#efefef', '#ffed4a', '#ffc402', '#fe9400', '#fa6100'],
};

// Northern hemisphere
export const NorthSeasonSettings: type.SeasonColorSettings = {
    type: 'season',
    backgroundColor: '#ffffff',
    foregroundColor: '#00000f',
    strongColor: '#111133',
    weakColor: 'gray',
    radarColor: '#47a042',
    contribColors1: ['#efefef', '#ffe7ff', '#edaeda', '#e492ca', '#ba7aad'], // spring
    contribColors2: ['#efefef', '#d8e887', '#8cc569', '#47a042', '#1d6a23'], // summer
    contribColors3: ['#efefef', '#ffed4a', '#ffc402', '#fe9400', '#fa6100'], // autumn
    contribColors4: ['#efefef', '#999999', '#cccccc', '#dddddd', '#eeeeee'], // winter
};

// Southern hemisphere
export const SouthSeasonSettings: type.SeasonColorSettings = {
    type: 'season',
    backgroundColor: '#ffffff',
    foregroundColor: '#00000f',
    strongColor: '#111133',
    weakColor: 'gray',
    radarColor: '#47a042',
    contribColors1: ['#efefef', '#ffed4a', '#ffc402', '#fe9400', '#fa6100'], // autumn
    contribColors2: ['#efefef', '#999999', '#cccccc', '#dddddd', '#eeeeee'], // winter
    contribColors3: ['#efefef', '#ffe7ff', '#edaeda', '#e492ca', '#ba7aad'], // spring
    contribColors4: ['#efefef', '#d8e887', '#8cc569', '#47a042', '#1d6a23'], // summer
};

export const NightViewSettings: type.NormalColorSettings = {
    type: 'normal',
    backgroundColor: 'black',
    foregroundColor: '#eeeeff',
    strongColor: 'rgb(255,200,55)',
    weakColor: '#aaaaaa',
    radarColor: 'rgb(255,200,55)',
    contribColors: [
        'rgb(25,60,130)',
        'rgb(25,90,210)',
        'rgb(25,120,220)',
        'rgb(25,150,230)',
        'rgb(25,165,240)',
    ],
};

export const NightGreenSettings: type.NormalColorSettings = {
    type: 'normal',
    backgroundColor: 'black',
    foregroundColor: '#eeeeff',
    strongColor: 'rgb(255,200,55)',
    weakColor: '#aaaaaa',
    radarColor: '#47a042',
    contribColors: ['#444444', '#1B7D28', '#24A736', '#2DD143', '#57DA69'],
};

export const NightRainbowSettings: type.RainbowColorSettings = {
    type: 'rainbow',
    backgroundColor: 'black',
    foregroundColor: '#eeeeff',
    strongColor: 'rgb(255,200,55)',
    weakColor: '#aaaaaa',
    radarColor: 'rgb(255,200,55)',
    saturation: 50,
    contribLightness: ['20%', '30%', '35%', '40%', '50%'],
    duration: '10s',
    hueRatio: -7,
};
