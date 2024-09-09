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

import type { VChartRenderSpecOperator, VChartSpec } from '../../vchart-render-engine';
import type { ChartStyle, DeepPartial, ISeriesStyle } from '../../../../chart/style.types';
import { SpecField } from '../../converters/constants';
import { seriesDataLabelHandler } from './series-data-label.handler';
import { stackHandler } from './stack.handler';

export type SeriesItemHandler = (seriesItem: NonNullable<VChartSpec['series']>[number], seriesStyle: DeepPartial<ISeriesStyle> | undefined, chartStyle: ChartStyle) => void;

const seriesItemHandlers: SeriesItemHandler[] = [
    seriesDataLabelHandler,
    stackHandler,
];
export const seriesStyleOperator: VChartRenderSpecOperator = (spec, style, config) => {
    const seriesStyleMap = style.common?.seriesStyleMap;
    spec.series?.forEach((series) => {
        const seriesId = (series as any)[SpecField.seriesId];
        const seriesStyle = seriesId ? seriesStyleMap?.[seriesId] : undefined;

        seriesItemHandlers.forEach((handler) => {
            handler(series, seriesStyle, style);
        });
    });
};
