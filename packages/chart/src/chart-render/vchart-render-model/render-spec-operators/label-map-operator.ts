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
import type { IAreaChartSpec, ICartesianBandAxisSpec } from '@visactor/vchart';
import type { VChartRenderSpecOperator } from '../vchart-render-engine';
import { defaultChartStyle } from '../../../chart/constants/default-chart-style';
import { AreaLineStyle } from '../../../chart/style.types';
import { chartBitsUtils, ChartTypeBits } from '../../../chart/constants';
import { SpecField } from '../converters/constants';

export const labelMapOperator: VChartRenderSpecOperator = (_spec, style, config, instance) => {
    if (!chartBitsUtils.baseOn(config.type, ChartTypeBits.Area)) return _spec;
    const spec = _spec as IAreaChartSpec;
    // @ts-ignore
    const bottomAxis = spec.axes?.find((axis) => axis.orient === 'bottom' && axis.type === 'band');
    if (bottomAxis) {
        (bottomAxis as ICartesianBandAxisSpec).trimPadding = true;
    }

    Tools.set(spec, 'xField', SpecField.xField);
    const lineStyle = style.area?.lineStyle ?? defaultChartStyle.area.lineStyle;
    const curveType = {
        [AreaLineStyle.Line]: undefined,
        [AreaLineStyle.Smooth]: 'monotone',
        [AreaLineStyle.Step]: 'step',
    }[lineStyle];
    Tools.set(spec, 'line.style.curveType', curveType);

    return spec;
};
