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

import type { Nullable } from '@univerjs/core';
import { Tools } from '@univerjs/core';
import type { EChartRenderSpecOperator } from '../echart-render-engine';
import { defaultChartStyle } from '../../../chart/constants/default-chart-style';
import { type IAxisOptions, PieLabelPosition } from '../../../chart/style.types';
import { IRuntimeAxisPriority } from '../../../chart/runtime-context.types';
import { ChartAttributeBits, chartBitsUtils } from '../../../chart/constants';
import { applyLabelStyle, toArray } from './tools';

const { textStyle } = defaultChartStyle;

export const chartAxesOperator: EChartRenderSpecOperator = (spec, style, config, instance) => {
    const { xAxis, yAxis, rightYAxis } = style || {};

    const percentStacked = chartBitsUtils.has(config.type, ChartAttributeBits.PercentStack);
    const axes = [...toArray(spec.xAxis), ...toArray(spec.yAxis)];
    const runtimeAxes = style.runtime?.axes;
    const secondaryAxis = runtimeAxes?.find((axis) => axis.priority === IRuntimeAxisPriority.Secondary);
    const primaryAxis = runtimeAxes?.find((axis) => axis.priority === IRuntimeAxisPriority.Primary);
    // eslint-disable-next-line complexity
    function applyAxisStyle(innerAxis: NonNullable<(typeof axes)[number]>, style: Nullable<IAxisOptions>) {
        const isPrimaryAxis = innerAxis.position === primaryAxis?.position;
        const isSecondaryAxis = innerAxis.position === secondaryAxis?.position;

        /** Axis line */
        Tools.set(innerAxis, 'axisLine.show', style?.lineVisible ?? isPrimaryAxis);
        Tools.set(innerAxis, 'inverse', Boolean(style?.reverse));

        /** Axis label */
        applyLabelStyle(innerAxis, 'axisLabel', {
            // @ts-ignore
            fontSize: textStyle.fontSize,
             // @ts-ignore
            color: textStyle.color,
            ...style?.label,
            visible: style?.label.visible ?? defaultChartStyle.axis.labelVisible,
        });

        if (percentStacked) {
            Tools.set(innerAxis, 'axisLabel.formatter', (val: number) => {
                return `${(val * 100 | 0) / 100}%`;
            });
        }

        /** Grid line */
        const gridLine = style?.gridLine;

        Tools.set(innerAxis, 'splitLine.show', gridLine?.visible ?? isSecondaryAxis);
        if (gridLine?.color) {
            Tools.set(innerAxis, 'splitLine.lineStyle.color', gridLine.color);
        }
        if (gridLine?.width) {
            Tools.set(innerAxis, 'splitLine.lineStyle.width', gridLine.width);
        }

        const tickStyle = style?.tick;
        /** Tick */
        Tools.set(innerAxis, 'axisTick.show', Boolean(tickStyle?.visible));
        if (tickStyle?.lineColor) {
            Tools.set(innerAxis, 'axisTick.lineStyle.color', tickStyle.lineColor);
        }
        if (tickStyle?.lineWidth) {
            Tools.set(innerAxis, 'axisTick.lineStyle.width', tickStyle.lineWidth);
        }
        if (tickStyle?.length) {
            Tools.set(innerAxis, 'axisTick.length', tickStyle.length);
        }
        Tools.set(innerAxis, 'axisTick.inside', tickStyle?.position === PieLabelPosition.Inside);
    }

    axes.forEach((axis) => {
        if (!axis || !axis.position) return;

        switch (axis.position) {
            case 'bottom': {
                applyAxisStyle(axis, xAxis as IAxisOptions);
                break;
            }
            case 'right': {
                applyAxisStyle(axis, rightYAxis as IAxisOptions);
                break;
            }
            case 'left': {
                applyAxisStyle(axis, yAxis as IAxisOptions);
                break;
            }
        }
    });

    return spec;
};
