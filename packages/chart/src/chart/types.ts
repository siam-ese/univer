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

export type ChartDataSource = Array<Array<Nullable<CellValue>>>;
export type ChartDataSourceValue = Nullable<CellValue>;

export interface IChartDataConfig {
    defaultDirection?: DataDirection;
    direction?: DataDirection;
    aggregate?: boolean; // effect on both of data and render
    categoryIndex?: number;
    categoryType?: CategoryType;
    categoryResourceIndexes?: number[];
    headers?: string[];
    firstRowAsHeader?: boolean;
    seriesIndexes?: number[];
    seriesResourceIndexes?: number[];
}

export interface IChartData {
    category?: {
        index: number;
        name: string;
        type: CategoryType;
        items: Array<{
            value: ChartDataSourceValue;
            label: string;
        }>;
        keys: string[];
    };
    series: Array<{
        index: number;
        name: string;
        items: Array<{
            value: ChartDataSourceValue;
            label: string;
        }>;
    }>;
};

export interface IChartConfig {
    type: ChartTypeBits;
    category: IChartData['category'];
    series: IChartData['series'];
    // units: IChartUnit[];
}

export interface IChartUnit {
    type: ChartTypeBits;
    data: {
        category: IChartData['category'];
        series: IChartData['series'];
        formatCode?: string;
    }; // for dataSource to chartConfig
}

export interface IChartConfigConverter {
    canConvert(type: ChartTypeBits): boolean;
    convert(type: ChartTypeBits, data: IChartData): IChartConfig;
}

