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

import type { IPieChartSpec } from '@visactor/vchart';
import { Tools } from '@univerjs/core';
import { chartBitsUtils, ChartTypeBits } from '../../../chart/constants';
import { defaultChartStyle } from '../../../chart/constants/default-chart-style';
import type { VChartRenderSpecOperator } from '../vchart-render-engine';
import { LabelContentType } from '../../../chart/style.types';
import { SpecField } from '../converters/constants';
import { applyLabelStyle } from './tools';

export const pieStyleOperator: VChartRenderSpecOperator = (_spec, style, config) => {
    if (!chartBitsUtils.baseOn(config.type, ChartTypeBits.Pie)) return _spec;
    const spec = _spec as IPieChartSpec;
    const isDoughnut = config.type === ChartTypeBits.Doughnut;

    const doughnutHold = style.pie?.doughnutHole ?? defaultChartStyle.pie.doughnutHole;
    spec.innerRadius = isDoughnut ? defaultChartStyle.pie.radius * doughnutHold : 0;

    Tools.set(spec, 'pie.style.stroke', style.borderColor ?? defaultChartStyle.pie.borderColor);

    Tools.set(spec, 'label.position', style.pie?.labelStyle?.position ?? defaultChartStyle.pie.labelPosition);
    Tools.set(spec, 'label.rotate', false);

    const contentType = style.pie?.labelStyle?.contentType ?? defaultChartStyle.pie.labelContentType;

    const formatter = [
        chartBitsUtils.has(contentType, LabelContentType.CategoryName) && `{${SpecField.categoryFieldLabel}}: `,
        chartBitsUtils.has(contentType, LabelContentType.Value) && `{${SpecField.valueField}}`,
        chartBitsUtils.has(contentType, LabelContentType.Percentage) && (contentType === LabelContentType.Percentage ? '{_percent_}%' : '({_percent_}%)'),
    ].filter(Boolean).join('');

    Tools.set(spec, 'label.formatter', formatter);
    // Tools.set(spec, 'label.style.type', 'text');
    applyLabelStyle(spec, 'label.style', {
        // color: defaultChartStyle.textStyle.color,
        fontSize: defaultChartStyle.textStyle.fontSize,
        ...style.pie?.labelStyle,
    });

    return spec;
};
