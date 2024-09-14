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

import { Tools } from '@univerjs/core';
import type { EChartRenderSpecOperator, EChartSeriesItem } from '../../echart-render-engine';
import type { ChartStyle, DeepPartial, ISeriesStyle } from '../../../../chart/style.types';
import { seriesForEach } from '../tools';
import type { ChartTypeBits } from '../../../../chart/constants';
import { seriesDataLabelHandler } from './series-data-label.handler';
import { seriesChartStyleHandler } from './series-chart-style.handler';
// import { stackHandler } from './stack.handler';

export interface ISeriesStyleHandlerContext {
    seriesItem: EChartSeriesItem;
    seriesIndex: number;
    seriesStyle: DeepPartial<ISeriesStyle> | undefined;
    chartStyle: ChartStyle;
    chartType: ChartTypeBits;
}

export type SeriesItemHandler = (context: ISeriesStyleHandlerContext) => void;

const seriesItemHandlers: SeriesItemHandler[] = [
    seriesDataLabelHandler,
    // stackHandler,
    seriesChartStyleHandler,
];

export const seriesStyleOperator: EChartRenderSpecOperator = (spec, style, config) => {
    const seriesStyleMap = style.seriesStyleMap;

    seriesForEach(spec.series, (series, seriesIndex) => {
        const seriesStyle = seriesStyleMap?.[series.seriesId];

        const context: ISeriesStyleHandlerContext = {
            seriesStyle: Tools.deepMerge({}, style.allSeriesStyle, seriesStyle),
            seriesIndex,
            seriesItem: series,
            chartStyle: style,
            chartType: config.type,
        };

        seriesItemHandlers.forEach((handler) => {
            handler(context);
        });
    });
};
