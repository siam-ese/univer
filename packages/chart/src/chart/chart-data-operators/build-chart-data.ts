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

import type { ChartDataSource, IChartData, IChartDataContext } from '../types';
import { toString } from './operators';

export type IChartDataPipelineOperator = (ctx: IChartDataPipelineContext) => void;
export interface IChartDataPipelineContext {
    dataSource: ChartDataSource;
    dataContext: IChartDataContext;
}

export function buildChartData(dataSource: ChartDataSource, dataContext: IChartDataContext): IChartData {
    const { headers } = dataContext;

    const seriesIndexes = dataContext.seriesIndexes || [];

    const result: IChartData = {
        series: seriesIndexes.map((index) => {
            const values = dataSource[index];
            return {
                index,
                name: toString(headers?.[index]) || `系列 ${index}`,
                items: values.map((value) => ({
                    value,
                    label: toString(value),
                })),
            };
        }),
    };

    const categoryIndex = dataContext.categoryIndex;
    if (categoryIndex !== undefined) {
        const categoryData = dataSource[categoryIndex];

        result.category = {
            index: categoryIndex,
            name: toString(headers?.[categoryIndex]),
            type: dataContext.categoryType!,
            items: categoryData.map((value) => ({
                value,
                label: toString(value),
            })),
            keys: categoryData.map((value, index) => `${index}_${value}`),
        };
    }

    return result;
}
