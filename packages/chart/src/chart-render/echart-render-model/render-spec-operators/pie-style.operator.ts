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
import { defaultChartStyle } from '../../../chart/constants/default-chart-style';
import type { EChartRenderSpecOperator } from '../echart-render-engine';
import { LabelContentType } from '../../../chart/style.types';
import { applyLabelStyle, seriesForEach } from './tools';

const defaultPie = defaultChartStyle.pie;
export const pieStyleOperator: EChartRenderSpecOperator = (spec, style, config) => {
    if (!chartBitsUtils.baseOn(config.type, ChartTypeBits.Pie)) return spec;

    const contentType = style.pie?.labelStyle?.contentType ?? defaultPie.labelContentType;

    const formatter = [
        chartBitsUtils.has(contentType, LabelContentType.CategoryName) && (contentType === LabelContentType.CategoryName ? '{b}' : '{b}: '),
        chartBitsUtils.has(contentType, LabelContentType.Value) && '{c}',
        chartBitsUtils.has(contentType, LabelContentType.Percentage) && (contentType === LabelContentType.Percentage ? '{d}%' : '({d}%)'),
    ].filter(Boolean).join('');

    seriesForEach(spec.series, (series) => {
        if (series.type === 'pie') {
            Tools.set(series, 'itemStyle.borderColor', style.pie?.borderColor ?? '#fff');
            Tools.set(series, 'label.formatter', formatter);
            const isInsideLabelPosition = style.pie?.labelStyle?.position === 'inside';
            Tools.set(series, 'label.position', style.pie?.labelStyle?.position ?? defaultPie.labelPosition);

            applyLabelStyle(series, 'label', {
                visible: true,
                fontSize: defaultChartStyle.textStyle.fontSize,
                color: isInsideLabelPosition ? defaultChartStyle.textStyle.color : 'inherit',
                ...style.pie?.labelStyle,
            });

            if (config.type === ChartTypeBits.Doughnut) {
                const doughnutHole = style.pie?.doughnutHole ?? defaultPie.doughnutHole;

                series.radius = [`${doughnutHole * 0.55 * 100}%`, '55%'];
            }
        }
    });

    return spec;
};
