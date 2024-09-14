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
import type { EChartRenderSpecOperator } from '../echart-render-engine';
import { defaultChartStyle } from '../../../chart/constants/default-chart-style';
import { AreaLineStyle } from '../../../chart/style.types';
import { chartBitsUtils, ChartTypeBits } from '../../../chart/constants';
import { seriesForEach, toArray } from './tools';

// handle style between line and area
export const lineLikeStyleOperator: EChartRenderSpecOperator = (spec, style, config, instance) => {
    const isArea = chartBitsUtils.baseOn(config.type, ChartTypeBits.Area);
    const lineOrArea = isArea || config.type === ChartTypeBits.Line;
    if (!lineOrArea) return;

    const { xAxis } = spec;
    if (xAxis) {
        const bottomAxis = toArray(xAxis).find((axis) => axis.position === 'bottom');
        if (bottomAxis) {
            (bottomAxis as any).boundaryGap = false;
        }
    }

    const lineStyle = style.area?.lineStyle ?? defaultChartStyle.area.lineStyle;

    seriesForEach(spec.series, (series) => {
        if (series.type === 'line') {
            if (isArea) {
                if (!('areaStyle' in series)) {
                    series.areaStyle = {};
                }
            }
            if (lineStyle === AreaLineStyle.Step) {
                Tools.set(series, 'step', true);
            }
            if (lineStyle === AreaLineStyle.Smooth) {
                series.smooth = true;
            }
        }
    });
};
