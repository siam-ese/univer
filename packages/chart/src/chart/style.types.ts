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

export type DeepPartial<T, P extends keyof T = keyof T> = T extends object ? {
    [key in P]+?: DeepPartial<T[key]>;
} : T;

export interface ILabelStyle {
    visible: boolean;
    content: string;
    fontSize: number;
    color: string;
    align: 'left' | 'right' | 'center';
    bold: boolean;
    strikethrough: boolean;
    italic: boolean;
    underline: boolean;
}

export interface IDataPointStyle {
    color: string; // set to color
};

export enum ChartBorderDashType {
    Solid = 'solid',
    Dashed = 'dashed',
    Dotted = 'dotted',
}
export interface ISeriesStyle {
    color: string;
    fillOpacity: number;
    border: {
        opacity: number;
        width: number;
        color: string;
        dashType: ChartBorderDashType;
    };
    label: ILabelStyle;
    dataPoints: {
        [index: number]: IDataPointStyle;
    };
}

export interface IAllSeriesStyle {
    border: ISeriesStyle['border'];
    label: ISeriesStyle['label'];
}

export enum StackType {
    // None,
    Normal = '0',
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
    // visible: boolean;
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

export interface IChartStyle {
    common: {
        stackType: StackType;
        backgroundColor: string;
        fontSize: number;
        fontColor: string;
        borderColor: string;
        title: Omit<ILabelStyle, 'visible'>;
        subtitle: Omit< ILabelStyle, 'visible'>;
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
    pie: {};
}

/* chart style */
export type ChartStyle = DeepPartial<IChartStyle>;
