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

import { chartBitsUtils } from '../../../../chart/constants';
import { defaultChartStyle } from '../../../../chart/constants/default-chart-style';
import type { DeepPartial, ISeriesStyle } from '../../../../chart/style.types';
import { LabelContentType, SeriesLabelPosition, StackType } from '../../../../chart/style.types';
import { applyLabelStyle, toPercentage } from '../tools';
import type { SeriesItemHandler } from './series-style-operator';

export const seriesDataLabelHandler: SeriesItemHandler = (ctx) => {
    const { seriesStyle, seriesItem, chartStyle } = ctx;

    const mergedStyle: DeepPartial<ISeriesStyle> = Tools.deepMerge({}, chartStyle.allSeriesStyle, seriesStyle);
    const labelStyle = mergedStyle?.label;
    if (!labelStyle?.visible) return;

    Tools.set(seriesItem, 'label.show', true);

    if (labelStyle?.position && labelStyle.position !== SeriesLabelPosition.Auto) {
        Tools.set(seriesItem, 'label.position', labelStyle?.position);
    }
    applyLabelStyle(seriesItem, 'label', {
        ...labelStyle,
        fontSize: labelStyle.fontSize ?? defaultChartStyle.textStyle.fontSize,
    });
    const contentType = labelStyle?.contentType;
    if (contentType) {
        const percentStacked = chartStyle.stackType === StackType.Percent;

        if (percentStacked) {
            Tools.set(seriesItem, 'label.formatter', (params: {
                seriesName: string;
                dataIndex: number;
                name: string;
                data: number;
            }) => {
                const { seriesName,
                        dataIndex,
                        name,
                        data } = params;
                const labels = [
                    chartBitsUtils.has(contentType, LabelContentType.SeriesName) && seriesName,
                    chartBitsUtils.has(contentType, LabelContentType.CategoryName) && name,
                    chartBitsUtils.has(contentType, LabelContentType.Value) && seriesItem.rawData?.[dataIndex],
                    chartBitsUtils.has(contentType, LabelContentType.Percentage) && toPercentage(data),
                ].filter(Boolean).join(',');

                return labels;
            });
        } else {
            const formatter = [
                chartBitsUtils.has(contentType, LabelContentType.SeriesName) && '{a}',
                chartBitsUtils.has(contentType, LabelContentType.CategoryName) && '{b}',
                chartBitsUtils.has(contentType, LabelContentType.Value) && '{c}',
            ].filter(Boolean).join(',');

            Tools.set(seriesItem, 'label.formatter', formatter);
        }
    }
};
