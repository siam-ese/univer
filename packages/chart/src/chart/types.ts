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
import type { CategoryType, ChartTypeBits, DataDirection } from './constants';

/** Snapshot */
export interface IChartSnapshot {
    id: string;
}

export type ChartDataSourceValue = Nullable<CellValue>;
export type ChartDataSource = Array<Array<ChartDataSourceValue>>;

export interface IChartDataTransformConfig {
    defaultDirection?: DataDirection;
    direction: DataDirection;
    aggregate?: boolean; // effect on both of data and render
    topN?: number;
}

export interface IChartDataContext {
    // defaultDirection?: DataDirection;
    // direction?: DataDirection;
    // aggregate?: boolean; // effect on both of data and render
    headers?: string[];
    // firstRowAsHeader?: boolean;
    categoryIndex?: number;
    categoryType?: CategoryType;
    categoryResourceIndexes?: number[];
    seriesIndexes?: number[];
    seriesResourceIndexes?: number[];
}

interface IChartDataItem {
    value: ChartDataSourceValue;
    label: string;
}
interface IChartDataCategory {
    index: number;
    name: string;
    type: CategoryType;
    items: IChartDataItem[];
    keys: string[];
}

interface IChartDataSeries {
    index: number;
    name: string;
    items: IChartDataItem[];
}

export interface IChartData {
    category?: IChartDataCategory;
    series: IChartDataSeries[];
};

// export interface IChartConfigSeries extends IChartDataSeries {
//     chartType: ChartTypeBits;
//     rightYAxis?: boolean;
// }

export interface IChartConfig {
    type: ChartTypeBits;
    category: IChartData['category'];
    series: IChartData['series'];
}

export interface IChartConfigConverter {
    canConvert(type: ChartTypeBits): boolean;
    convert(type: ChartTypeBits, data: IChartData): IChartConfig;
}
