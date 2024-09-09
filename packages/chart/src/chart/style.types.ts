/**
 * Copyright 2023-present DreamNum Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { ChartTypeBits } from './constants';

export type DeepPartial<T> = T extends Record<string, any>
    ? T extends any[]
        ? T
        : { [key in keyof T]+?: DeepPartial<T[key]>; }
    : T;

export enum SeriesLabelPosition {
    Auto = 'auto',
    Top = 'top',
    Bottom = 'bottom',
    Center = 'left',
    Outside = 'outside',
}

export enum PieLabelPosition {
    Inside = 'inside',
    Outside = 'outside',
}

export enum RadarShape {
    Polygon = 'polygon',
    Circle = 'circle',
}

export enum LabelContentType {
    Empty = 0,
    CategoryName = 1 << 1,
    SeriesName = 1 << 2,
    Value = 1 << 3,
    Percentage = 1 << 4,
}

export const labelContentTypeList = [
    LabelContentType.CategoryName,
    LabelContentType.SeriesName,
    LabelContentType.Value,
    LabelContentType.Percentage,
];

export enum LabelAlign {
    Left = 'left',
    Right = 'right',
    Center = 'center',
}

export interface ILabelStyle {
    visible: boolean;
    content: string;
    fontSize: number;
    color: string;
    align: LabelAlign;
    bold: boolean;
    strikethrough: boolean;
    italic: boolean;
    underline: boolean;
}

export interface ISeriesLabelStyle extends ILabelStyle {
    contentType: number;
    position: SeriesLabelPosition;
}

export interface IPieLabelStyle extends Omit<ILabelStyle, 'align' | 'content' > {
    contentType: number;
    position: PieLabelPosition;
}

export interface IDataPointStyle {
    color: string; // set to color
};

export enum LinePointShape {
    Circle = 'circle',
    Square = 'square',
    Triangle = 'triangle',
    Diamond = 'diamond',
}
export interface ILinePointStyle {
    shape: LinePointShape;
    size: number;
    color: string;
}

export enum ChartBorderDashType {
    Solid = 'solid',
    Dashed = 'dashed',
    Dotted = 'dotted',
}

export enum ChartCartesianAxisPosition {
    Left = 'left',
    Right = 'right',
}
export interface ISeriesStyle {
    chartType?: ChartTypeBits.Line | ChartTypeBits.Column | ChartTypeBits.Area;
    rightYAxis?: boolean;
    color: string;
    fillOpacity: number;
    border: {
        opacity: number;
        width: number;
        color: string;
        dashType: ChartBorderDashType;
    };
    label: ISeriesLabelStyle;
    linePoint: ILinePointStyle;
    dataPoints: {
        [index: number]: IDataPointStyle;
    };
}

export interface IAllSeriesStyle extends Pick<ISeriesStyle, 'chartType' | 'border' | 'label' | 'rightYAxis' | 'linePoint'> {

}

export enum StackType {
    Stacked = '0',
    Percent = '1',
}

export enum LegendPosition {
    Top = 'top',
    Left = 'left',
    Right = 'right',
    Bottom = 'bottom',
    Hide = 'hide',
}
export interface ILegendStyle {
    position: LegendPosition;
    label: Omit<ILabelStyle, 'visible' | 'align' | 'content' >;
}

export interface IGridLineStyle {
    visible: boolean;
    color: string;
    width: number;
}

export interface IXAxisOptions {
    labelVisible: boolean;
    lineVisible: boolean;
    reverse: boolean;
    label: Omit<ILabelStyle, 'visible' | 'align' | 'content' >;
    gridLine: IGridLineStyle;
}

export interface IYAxisOptions {
    labelVisible: boolean;
    lineVisible: boolean;
    label: Omit<ILabelStyle, 'visible' | 'align' | 'content' >;
    gridLine: IGridLineStyle;
    min: number;
    max: number;
}

export enum AreaLineStyle {
    Line = 'line',
    Smooth = 'smooth',
    Step = 'step',
}

export enum InvalidValueType {
    Zero = 'zero',
    Break = 'break',
    Link = 'link',
}
export interface IChartStyle {
    runtime: {
        themeColors: string[];
    };
    common: {
        theme: string;
        stackType: StackType;
        invalidValueType: InvalidValueType;
        gradientFill: boolean;
        backgroundColor: string;
        titleFontSize: number;
        fontSize: number;
        fontColor: string;
        borderColor: string;
        title: Omit<ILabelStyle, 'visible'>;
        subtitle: Omit<ILabelStyle, 'visible'>;
        xAxisTitle: Omit<ILabelStyle, 'visible'>;
        yAxisTitle: Omit<ILabelStyle, 'visible'>;
        allSeriesStyle: IAllSeriesStyle;
        legend: ILegendStyle;
        xAxis: IXAxisOptions;
        yAxis: IYAxisOptions;
        seriesStyleMap: {
            [id: string]: ISeriesStyle;
        };
    };
    pie: {
        doughnutHole: number;
        labelStyle: IPieLabelStyle;
    };
    area: {
        lineStyle: AreaLineStyle;
    };
    radar: {
        shape: RadarShape;
        fill: boolean;
    };
}

/* chart style */
export type ChartStyle = DeepPartial<IChartStyle>;
