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

import type { ChartDataSourceValues, IChartContext, IChartData } from '../types';
import { toString } from './operators';

export function buildChartData(dataSource: ChartDataSourceValues, chartContext: IChartContext): IChartData {
    const { headers } = chartContext;

    const seriesIndexes = chartContext.seriesIndexes || [];

    const result: IChartData = {
        headers,
        series: seriesIndexes.map((index) => {
            const values = dataSource[index];
            return {
                index,
                name: toString(headers?.[index]),
                items: values.map((value) => ({
                    value,
                    label: toString(value),
                })),
            };
        }),
    };

    const categoryIndex = chartContext.categoryIndex;
    if (categoryIndex !== undefined) {
        const categoryData = dataSource[categoryIndex];

        result.category = {
            index: categoryIndex,
            name: toString(headers?.[categoryIndex]),
            type: chartContext.categoryType!,
            items: categoryData.map((value) => ({
                value,
                label: toString(value),
            })),
            keys: categoryData.map((value, index) => String(index)),
        };
    }

    return result;
}
