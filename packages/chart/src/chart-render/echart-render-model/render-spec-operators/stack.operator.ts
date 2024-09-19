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
// import { StackType } from '../../../chart/style.types';
import type { EChartRenderSpecOperator } from '../echart-render-engine';
import { ChartAttributeBits, chartBitsUtils } from '../../../chart/constants';
import { seriesForEach, toPercentage } from './tools';

export const stackOperator: EChartRenderSpecOperator = (spec, style, config) => {
    const stacked = chartBitsUtils.has(config.type, ChartAttributeBits.Stack);
    if (!stacked) {
        return;
    }
    const percentStacked = chartBitsUtils.has(config.type, ChartAttributeBits.PercentStack);
    const totalData: number[] = [];
    seriesForEach(spec.series, (ser) => {
        if (stacked) {
            Tools.set(ser, 'stack', 'total');
        }
        if (percentStacked) {
            (ser.data as number[]).forEach((val, idx) => {
                totalData[idx] = (totalData[idx] || 0) + val;
            });
        }
    });
    if (percentStacked) {
        seriesForEach(spec.series, (ser) => {
            const values = ser.data as number[];
            ser.rawData = values.slice();
            ser.data = values.map((val, idx) => {
                return totalData[idx] <= 0 ? 0 : (val / totalData[idx] * 100);
            });
        });

        Tools.set(spec, 'tooltip.valueFormatter', (value: number) => toPercentage(value));
    }
};
