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
import type { ISeriesSpec } from '@visactor/vchart';
import type { DeepPartial, ISeriesStyle } from '../../../../chart/style.types';
import { ChartBorderDashType } from '../../../../chart/style.types';
import { applyLabelStyle } from '../tools';
import { defaultChartStyle } from '../../../../chart/constants/default-chart-style';
import type { SeriesItemHandler } from './series-style-operator';

const dashValues = {
    [ChartBorderDashType.Solid]: [0],
    [ChartBorderDashType.Dotted]: [3, 3],
    [ChartBorderDashType.Dashed]: [6, 2],
};

const seriesStylizers = {
    bar(seriesStyleSpec: Record<string, any>, seriesStyle: DeepPartial<ISeriesStyle>) {
        if (seriesStyle.color) {
            Tools.set(seriesStyleSpec, 'line.style.fill', seriesStyle.color);
        }
        if (seriesStyle.fillOpacity) {
            Tools.set(seriesStyleSpec, 'line.style.fillOpacity', seriesStyle.fillOpacity);
        }
        const borderStyle = seriesStyle.border;
        if (borderStyle?.dashType) {
            Tools.set(seriesStyleSpec, 'bar.style.outerBorder.lineDash', dashValues[borderStyle.dashType]);
        }
        if (borderStyle?.width) {
            Tools.set(seriesStyleSpec, 'bar.style.outerBorder.lineWidth', borderStyle.width);
        }
        if (borderStyle?.opacity) {
            Tools.set(seriesStyleSpec, 'bar.style.outerBorder.strokeOpacity', borderStyle.opacity);
        }
        if (borderStyle?.color) {
            Tools.set(seriesStyleSpec, 'bar.style.outerBorder.stroke', borderStyle.color);
        }
    },
    line(seriesStyleSpec: Record<string, any>, seriesStyle: DeepPartial<ISeriesStyle>) {
        if (seriesStyle.color) {
            Tools.set(seriesStyleSpec, 'line.style.fill', seriesStyle.color);
        }
        if (seriesStyle.fillOpacity) {
            Tools.set(seriesStyleSpec, 'line.style.fillOpacity', seriesStyle.fillOpacity);
        }

        const borderStyle = seriesStyle.border;

        if (borderStyle?.dashType) {
            Tools.set(seriesStyleSpec, 'line.style.lineDash', dashValues[borderStyle.dashType]);
        }
        if (borderStyle?.width) {
            Tools.set(seriesStyleSpec, 'line.style.lineWidth', borderStyle.width);
        }
    },
};
export const seriesDataLabelHandler: SeriesItemHandler = (series, seriesStyle, style) => {
    const mergedStyle: DeepPartial<ISeriesStyle> = Tools.deepMerge({}, style.common?.allSeriesStyle, seriesStyle);

    const label = mergedStyle.label;
    if (label?.visible) {
        Tools.set(series, 'label.visible', true);
        applyLabelStyle(series as ISeriesSpec, 'label.style', {
            ...label,
            fontSize: label.fontSize ?? defaultChartStyle.textStyle.fontSize,
        });
    }

    const stylizer = seriesStylizers[series.type as 'bar' | 'line'];
    stylizer?.(series, mergedStyle);
};
