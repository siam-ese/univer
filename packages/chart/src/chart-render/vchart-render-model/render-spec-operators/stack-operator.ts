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
import { chartBitsUtils, ChartTypeBits } from '../../../chart/constants';
import { StackType } from '../../../chart/style.types';
import type { VChartRenderSpecOperator } from '../vchart-render-engine';

export const stackOperator: VChartRenderSpecOperator = (spec, style, config) => {
    const stackType = style.common?.stackType;

    const barLikeSpec = spec as IBarChartSpec;

    if ([
        ChartTypeBits.Column,
        ChartTypeBits.Area,
    ].some((type) => chartBitsUtils.baseOn(config.type, type))) {
        barLikeSpec.percent = stackType === StackType.Percent;
        barLikeSpec.stack = Boolean(stackType);
    }

    return barLikeSpec;
};
