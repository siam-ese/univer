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

import { defaultChartStyle } from '../constants/default-chart-style';
import type { IChartConfigConverter } from '../types';

const { combination } = defaultChartStyle;

export const combinationConfigConverter: IChartConfigConverter = {
    canConvert(bit) {
        return false;
        // return bit === ChartTypeBits.Combination;
    },
    convert: (chartType, chartData, snapshot) => {
        // const seriesStyleMap = snapshot.seriesStyleMap;
        // return {
        //     type: chartType,
        //     category: chartData.category,
        //     series: chartData.series.map((series, seriesIndex) => {
        //         const fallbackChartType = chartType !== ChartTypeBits.Combination
        //             ? chartType
        //             : (seriesIndex === 0 ? combination.firstChartType : combination.otherChartType);

        //         const seriesStyle = seriesStyleMap?.[series.index];
        //         const innerChartType = seriesStyle?.chartType ?? fallbackChartType;

        //         return {
        //             chartType: innerChartType,
        //             rightYAxis: seriesStyle?.rightYAxis,
        //             ...series,
        //         };
        //     }),
        // };
    },
};
