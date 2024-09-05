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
import { chartBitsUtils, ChartTypeBits } from '../../../chart/constants';
import type { VChartRenderSpecOperator } from '../vchart-render-engine';

const gradientFillConfig = {
    gradient: 'linear',
    x0: 0.5,
    y0: 1,
    x1: 0.5,
    y1: 0.3,
    stops: [
        {
            offset: 0,
            opacity: 0.4,
        },
        {
            offset: 1,
            opacity: 1,
        },
    ],
};

export const fillOperator: VChartRenderSpecOperator = (spec, style, config, instance) => {
    const gradientFill = style.common?.gradientFill;
    if (!gradientFill) return spec;

    if (chartBitsUtils.baseOn(config.type, ChartTypeBits.Column)) {
        Tools.set(spec, 'bar.style.fill', gradientFillConfig);
    }

    if (chartBitsUtils.baseOn(config.type, ChartTypeBits.Area)) {
        Tools.set(spec, 'line.style.fill', gradientFillConfig);
    }

    // instance.setBorderColor(style.common?.borderColor);

    return spec;
};
