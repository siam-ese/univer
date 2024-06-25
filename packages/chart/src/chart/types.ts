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

import type { CellValue, Nullable } from '@univerjs/core';

type DeepPartial<T, P extends keyof T = keyof T> = T extends object ? {
    [key in P]+?: DeepPartial<T[key]>;
} : T;

export interface IChartSnapshot {
    id: string;
}

export enum ChartType {
    Line = 'Line',
    Bar = 'Bar',
    Pie = 'Pie',
    BarStacked = 'LineStacked',
}
// export enum ChartRenderType {
//     Line,
//     Bar,
//     Pie,
// }
// export interface ChartType {
//     type: ChartType;
//     renderType: ChartRenderType;
// }
// export enum ChartTypeID {
//     Line = 1,
//     Bar,
//     Pie,
// }

export type ChartDataSource = Array<Array<Nullable<CellValue>>>;
export type ChartDataSourceValue = Nullable<CellValue>;

export enum DataDirection {
    Row = 'row',
    Column = 'column',
}

export interface IChartDataConfig {
    direction: DataDirection;
    // stack: boolean; // effect on both of data and render
    aggregate: boolean; // effect on both of data and render
    categoryIndex?: number;
    categoryType?: CategoryType;
    headerIndex?: number;
    seriesIndexes?: number[];
}

// export interface ChartDataSource {
//     data: ChartDataSource;
// }

/* chart style */
export interface ILabelStyle {
    content: string;
    fontSize: number;
    color: string;
    align: 'left' | 'right' | 'center';
    strikethrough: boolean;
    italic: boolean;
    underline: boolean;
}

interface IChartStyle {
    common: {
        stack: boolean;
        backgroundColor: string;
        fontSize: number;
        fontColor: string;
        borderColor: string;
        title: ILabelStyle;
        subtitle: ILabelStyle;
        xAxisTitle: ILabelStyle;
        yAxisTitle: ILabelStyle;
        dataPoints: {
            [index: number]: {};
        };
    };
    pie: {};
}

export type ChartStyle = DeepPartial<IChartStyle>;

// IChartSpec
export interface IChartConfig {
    type: ChartType;
    units: IChartUnit | IChartUnit[];
}

export interface IAxisData {
    name?: Nullable<string>;
    value: ChartDataSourceValue[];
    labelValue: string[];
}

export enum CategoryType {
    Linear = 'Linear',
    Text = 'Text',
}

export interface IChartData {
    category?: {
        index: number;
        name: string;
        type: CategoryType;
        values: ChartDataSourceValue[];
        textValues: string[];
        getValueByIndex: (index: number) => string | undefined;
    };
    series: Array<{
        index: number;
        name: string;
        values: ChartDataSourceValue[];
        textValues: string[];
    }>;
};

export interface IChartUnit {
    type: ChartType;
    data: {
        xAxis: IChartData['category'];
        yAxes: IChartData['series'];
        formatCode?: string;
    }; // for dataSource to chartConfig
}

export type IChartConfigGenerator = (chartItem: ChartType, chartData: IChartData) => IChartConfig;

