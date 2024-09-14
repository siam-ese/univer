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

import type { IBarChartSpec, IBarSeriesSpec } from '@visactor/vchart';
import type { EChartRenderSpecOperator } from '../echart-render-engine';
import { chartBitsUtils, ChartTypeBits } from '../../../chart/constants';

// function toArray<T = unknown>(value: T | T[]) {
//     if (Array.isArray(value)) return value;
//     return [value];
// }

export const toHorizontalOperator: EChartRenderSpecOperator = (_spec, style, config, instance) => {
    if (!chartBitsUtils.baseOn(config.type, ChartTypeBits.Column)) return;

    const spec = _spec as IBarChartSpec;
    // horizontal bar should switch xField and yField
    if (chartBitsUtils.baseOn(config.type, ChartTypeBits.Bar)) {
        // const bottomAxis = spec.axes?.find((axis) => axis.orient === 'bottom') as ICartesianBandAxisSpec;
        // const leftAxis = spec.axes?.find((axis) => axis.orient === 'left');
        // const leftSeriesId = leftAxis?.seriesId || [];
        // const rightSeriesId = spec.axes?.find((axis) => axis.orient === 'right')?.seriesId || [];

        // if (leftAxis) {
        //     leftAxis.orient = 'bottom';
        //     leftAxis.seriesId = [...toArray(leftSeriesId), ...toArray(rightSeriesId)];
        // }
        // if (bottomAxis) {
        //     bottomAxis.orient = 'left';
        // }

        // spec.axes = (spec.axes ?? []).filter((axis) => axis.orient !== 'right');
        spec.series?.forEach((_ser) => {
            const ser = _ser as IBarSeriesSpec;
            const oldXField = ser.xField;
            const oldYField = ser.yField;

            ser.direction = 'horizontal';
            ser.xField = oldYField;
            ser.yField = oldXField;
        });
    }
};
