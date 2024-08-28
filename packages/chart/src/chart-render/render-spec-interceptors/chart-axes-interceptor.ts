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

import type { ICartesianAxisSpec } from '@visactor/vchart';
import { Tools } from '@univerjs/core';
import type { VChartRenderSpecInterceptor } from '../render-engine';
import { defaultChartStyle } from '../../chart/constants/default-chart-style';

const { axis: defaultAxis } = defaultChartStyle;

// eslint-disable-next-line complexity
export const chartAxesInterceptor: VChartRenderSpecInterceptor = (spec, style, config, instance) => {
    const { xAxis, yAxis } = style.common || {};
    const specXAxisIndex = spec.axes?.findIndex((axis) => (axis as ICartesianAxisSpec).orient === 'bottom');
    const specYAxisIndex = spec.axes?.findIndex((axis) => (axis as ICartesianAxisSpec).orient === 'left');
    if (specXAxisIndex !== -1) {
        const { label: xAxisLabel, gridLine: xAxisGridLine } = xAxis || {};

        Tools.set(spec, `axes.${specXAxisIndex}.label.visible`, xAxis?.labelVisible ?? defaultAxis.labelVisible);
        Tools.set(spec, `axes.${specXAxisIndex}.domainLine.visible`, xAxis?.lineVisible ?? defaultAxis.lineVisible);
        Tools.set(spec, `axes.${specXAxisIndex}.inverse`, xAxis?.reverse ?? defaultAxis.reverse);
        Tools.set(spec, `axes.${specXAxisIndex}.label.style.fill`, xAxisLabel?.color ?? defaultChartStyle.textStyle.color);
        Tools.set(spec, `axes.${specXAxisIndex}.label.style.fontSize`, xAxisLabel?.fontSize ?? defaultChartStyle.textStyle.fontSize);
        Tools.set(spec, `axes.${specXAxisIndex}.label.style.fontStyle`, xAxisLabel?.italic ? 'italic' : 'normal');
        Tools.set(spec, `axes.${specXAxisIndex}.label.style.fontWeight`, xAxisLabel?.bold ? 'bold' : 'normal');
        Tools.set(spec, `axes.${specXAxisIndex}.label.style.underline`, Boolean(xAxisLabel?.underline));
        Tools.set(spec, `axes.${specXAxisIndex}.label.style.lineThrough`, Boolean(xAxisLabel?.strikethrough));

        Tools.set(spec, `axes.${specXAxisIndex}.grid.visible`, xAxisGridLine?.visible ?? defaultAxis.gridLineVisible);
        if (xAxisGridLine?.color) {
            Tools.set(spec, `axes.${specXAxisIndex}.grid.style.stroke`, xAxisGridLine.color);
        }
        if (xAxisGridLine?.width) {
            Tools.set(spec, `axes.${specXAxisIndex}.grid.style.lineWidth`, xAxisGridLine.width);
        }
    }

    if (specYAxisIndex !== -1) {
        const { label: yAxisLabel, gridLine: yAxisGridLine } = yAxis || {};
        if (yAxis?.max !== undefined) {
            Tools.set(spec, `axes.${specYAxisIndex}.max`, yAxis.max);
        }
        if (yAxis?.min !== undefined) {
            Tools.set(spec, `axes.${specYAxisIndex}.min`, yAxis.min);
        }
        Tools.set(spec, `axes.${specYAxisIndex}.label.visible`, yAxis?.labelVisible ?? defaultAxis.labelVisible);
        Tools.set(spec, `axes.${specYAxisIndex}.domainLine.visible`, yAxis?.lineVisible ?? defaultAxis.lineVisible);

        Tools.set(spec, `axes.${specYAxisIndex}.label.style.fill`, yAxisLabel?.color ?? defaultChartStyle.textStyle.color);
        Tools.set(spec, `axes.${specYAxisIndex}.label.style.fontSize`, yAxisLabel?.fontSize ?? defaultChartStyle.textStyle.fontSize);
        Tools.set(spec, `axes.${specYAxisIndex}.label.style.fontStyle`, yAxisLabel?.italic ? 'italic' : 'normal');
        Tools.set(spec, `axes.${specYAxisIndex}.label.style.fontWeight`, yAxisLabel?.bold ? 'bold' : 'normal');
        Tools.set(spec, `axes.${specYAxisIndex}.label.style.underline`, Boolean(yAxisLabel?.underline));
        Tools.set(spec, `axes.${specYAxisIndex}.label.style.lineThrough`, Boolean(yAxisLabel?.strikethrough));

        Tools.set(spec, `axes.${specYAxisIndex}.grid.visible`, yAxisGridLine?.visible ?? defaultAxis.gridLineVisible);
        if (yAxisGridLine?.color) {
            Tools.set(spec, `axes.${specYAxisIndex}.grid.style.stroke`, yAxisGridLine.color);
        }
        if (yAxisGridLine?.width) {
            Tools.set(spec, `axes.${specYAxisIndex}.grid.style.lineWidth`, yAxisGridLine.width);
        }
    }

    return spec;
};
