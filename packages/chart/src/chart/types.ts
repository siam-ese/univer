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
import type { Observable } from 'rxjs';
import type { CategoryType, ChartTypeBits, DataOrientation } from './constants';
import type { ChartStyle } from './style.types';

/** Chart resource snapshot */
export interface IChartSnapshot {
    id: string;
    chartType: ChartTypeBits;
    orient?: DataOrientation;
    context?: Pick<IChartContext, 'categoryIndex' | 'seriesIndexes' | 'transform'>;
    style?: ChartStyle;
    dataAggregation?: IChartDataAggregation;
}

export type ChartDataSourceValue = Nullable<CellValue>;
export type ChartDataSourceValues = Array<Array<ChartDataSourceValue>>;

export interface IChartDataSource {
    data$: Observable<ChartDataSourceValues>;
    data: ChartDataSourceValues;
    orient$: Observable<DataOrientation>;
    rebuild$: Observable<void>;
    setOrient(orient: DataOrientation): void;
}

export interface IChartDataAggregation {
    aggregate?: boolean;
    topN?: number;
}

export interface IChartContext {
    headers?: string[];
    categoryType?: CategoryType;
    categoryIndex?: number;
    categoryResourceIndexes?: number[];
    seriesIndexes?: number[];
    seriesResourceIndexes?: number[];
    transform?: {
        categoryIndex?: number;
        seriesIndexes?: number[];
    };
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
    headers?: string[];
    series: IChartDataSeries[];
};

export interface IChartConfig extends IChartData {
    type: ChartTypeBits;
}

export interface IChartConfigConverter {
    canConvert(type: ChartTypeBits): boolean;
    convert(type: ChartTypeBits, data: IChartData): IChartConfig;
}
