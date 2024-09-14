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
import type { EChartRenderSpecOperator } from '../echart-render-engine';
import { defaultChartStyle } from '../../../chart/constants/default-chart-style';
import { LabelAlign } from '../../../chart/style.types';
import { applyLabelStyle, toArray } from './tools';

const { textStyle } = defaultChartStyle;
export const titleStyleOperator: EChartRenderSpecOperator = (spec, style, config) => {
    const { title: titleStyle, subtitle: subTitleStyle, xAxisTitle, yAxisTitle, rightYAxisTitle } = style?.titles ?? {};

    const titleContent = titleStyle?.content ?? config.headers?.join(',');
    const subTitleContent = subTitleStyle?.content;

    Tools.set(spec, 'title.show', Boolean(titleContent || subTitleContent));
    // title
    Tools.set(spec, 'title.text', titleContent);
    Tools.set(spec, 'title.textAlign', titleStyle?.align ?? textStyle.align);
    applyLabelStyle(spec, 'title.textStyle', {
        fontSize: textStyle.titleFontSize,
        color: textStyle.color,
        ...titleStyle,
    });

    // subtitle
    Tools.set(spec, 'title.subtext', subTitleContent);
    Tools.set(spec, 'title.subtextStyle.align', subTitleStyle?.align ?? textStyle.align);
    applyLabelStyle(spec, 'title.subtextStyle', {
        fontSize: textStyle.subTitleFontSize,
        color: textStyle.color,
        ...subTitleStyle,
    });

    const axes = [...toArray(spec.xAxis), ...toArray(spec.yAxis)];

    axes.forEach((axis) => {
        if (!axis || !axis.position) return;

        const axisTitleStyle = {
            left: yAxisTitle,
            right: rightYAxisTitle,
            bottom: xAxisTitle,
            top: undefined,
        }[axis.position];

        if (axisTitleStyle) {
            axis.name = axisTitleStyle.content;

            const axisAlignPositionMap = {
                [LabelAlign.Center]: 'middle',
                [LabelAlign.Left]: 'start',
                [LabelAlign.Right]: 'end',
            };

            const alignPosition = axisTitleStyle.align ? axisAlignPositionMap[axisTitleStyle.align] : undefined;
            Tools.set(axis, 'nameLocation', alignPosition);
            applyLabelStyle(axis, 'nameTextStyle', {
                fontSize: textStyle.fontSize,
                color: textStyle.color,
                ...axisTitleStyle,
            });
        }
    });

    return spec;
};
