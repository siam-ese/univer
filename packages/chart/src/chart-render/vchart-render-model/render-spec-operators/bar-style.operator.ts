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

import type { IBarChartSpec, ICartesianBandAxisSpec } from '@visactor/vchart';
import type { VChartRenderSpecOperator } from '../vchart-render-engine';
import { chartBitsUtils, ChartTypeBits } from '../../../chart/constants';

export const barStyleOperator: VChartRenderSpecOperator = (_spec, style, config, instance) => {
    if (!chartBitsUtils.baseOn(config.type, ChartTypeBits.Column)) return;
    const spec = _spec as IBarChartSpec;
    // horizontal bar should switch xField and yField
    if (chartBitsUtils.baseOn(config.type, ChartTypeBits.Bar)) {
        const oldXField = spec.xField;
        const oldYField = spec.yField;
        spec.orient = 'horizontal';
        spec.xField = oldYField;
        spec.yField = oldXField;
        const bandAxis = spec.axes?.find((axis) => axis.type === 'band') as ICartesianBandAxisSpec;
        const linearAxis = spec.axes?.find((axis) => axis.type === 'linear');

        if (linearAxis) {
            linearAxis.orient = 'bottom';
        }
        if (bandAxis) {
            bandAxis.orient = 'left';
        }
    }
};
