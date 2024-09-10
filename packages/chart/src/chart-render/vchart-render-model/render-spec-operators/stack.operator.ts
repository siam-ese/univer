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

import type { IBarChartSpec } from '@visactor/vchart';
import { Tools } from '@univerjs/core';
import { chartBitsUtils, ChartTypeBits } from '../../../chart/constants';
import { StackType } from '../../../chart/style.types';
import type { VChartRenderSpecOperator } from '../vchart-render-engine';
import { SpecField } from '../converters/constants';

// const stackAttributes = [ChartAttributeBits.PercentStack, ChartAttributeBits.Stack];
export const stackOperator: VChartRenderSpecOperator = (spec, style, config) => {
    // const stackType = style.stackType;

    const barLikeSpec = spec as IBarChartSpec;
    // const stacked = stackAttributes.some((attr) => chartBitsUtils.has(config.type, attr));
    const stacked = Boolean(style.stackType);
    const percentStacked = style.stackType === StackType.Percent;
    if ([
        ChartTypeBits.Column,
        ChartTypeBits.Area,
    ].some((type) => chartBitsUtils.baseOn(config.type, type))) {
        barLikeSpec.percent = percentStacked; // stackType === StackType.Percent;
        barLikeSpec.stack = stacked; // stackType === StackType.Stack;
    }

    spec.series?.forEach((ser) => {
        if (ser.type === 'bar') {
            // const stacked = Boolean(stackType);
            Tools.set(ser, 'percent', percentStacked);
            Tools.set(ser, 'stack', stacked);
            if (stacked) {
                Tools.set(ser, 'xField', SpecField.xField);
            }
        }
    });
};
