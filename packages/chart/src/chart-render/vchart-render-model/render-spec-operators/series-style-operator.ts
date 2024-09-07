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
import type { VChartRenderSpecOperator } from '../vchart-render-engine';
import type { IAllSeriesStyle, ISeriesStyle } from '../../../chart/style.types';
import { ChartBorderDashType } from '../../../chart/style.types';

const dashValues = {
    [ChartBorderDashType.Solid]: [0],
    [ChartBorderDashType.Dotted]: [3, 3],
    [ChartBorderDashType.Dashed]: [6, 2],
};

const supportedChartUnit = ['bar', 'line'] as const;

const seriesStylizers = {
    bar(seriesSpec: Record<string, any>, seriesStyle: Partial<IAllSeriesStyle & ISeriesStyle>) {
        if (seriesStyle.color) {
            Tools.set(seriesSpec, 'line.style.fill', seriesStyle.color);
        }
        if (seriesStyle.fillOpacity) {
            Tools.set(seriesSpec, 'line.style.fillOpacity', seriesStyle.fillOpacity);
        }
        const borderStyle = seriesStyle.border;
        if (borderStyle?.dashType) {
            Tools.set(seriesSpec, 'bar.style.outerBorder.lineDash', dashValues[borderStyle.dashType]);
        }
        if (borderStyle?.width) {
            Tools.set(seriesSpec, 'bar.style.outerBorder.lineWidth', borderStyle.width);
        }
        if (borderStyle?.opacity) {
            Tools.set(seriesSpec, 'bar.style.outerBorder.strokeOpacity', borderStyle.opacity);
        }
        if (borderStyle?.color) {
            Tools.set(seriesSpec, 'bar.style.outerBorder.stroke', borderStyle.color);
        }
    },
    line(seriesSpec: Record<string, any>, seriesStyle: Partial<IAllSeriesStyle & ISeriesStyle>) {
        if (seriesStyle.color) {
            Tools.set(seriesSpec, 'line.style.fill', seriesStyle.color);
        }
        if (seriesStyle.fillOpacity) {
            Tools.set(seriesSpec, 'line.style.fillOpacity', seriesStyle.fillOpacity);
        }

        const borderStyle = seriesStyle.border;

        if (borderStyle?.dashType) {
            Tools.set(seriesSpec, 'line.style.lineDash', dashValues[borderStyle.dashType]);
        }
        if (borderStyle?.width) {
            Tools.set(seriesSpec, 'line.style.lineWidth', borderStyle.width);
        }
    },
};

export const seriesStyleOperator: VChartRenderSpecOperator = (spec, style, config) => {
    const specSeriesStyle = config.series.map((series) => {
        return {
            index: series.index,
            name: String(series.index),
        };
    });
    const allSeriesStyle = style.common?.allSeriesStyle;
    const seriesStyleMap = style.common?.seriesStyleMap;

    if (allSeriesStyle?.label?.visible) {
        Tools.set(spec, 'label.visible', true);
    }

    specSeriesStyle.forEach((item) => {
        const styleItem = seriesStyleMap?.[item.index];

        const mergedStyle: Partial<IAllSeriesStyle & ISeriesStyle> = Tools.deepMerge({}, allSeriesStyle, styleItem);

        supportedChartUnit.forEach((unit) => {
            const stylizer = seriesStylizers[unit];
            stylizer(item, mergedStyle);
        });
    });
    spec.seriesStyle = specSeriesStyle;

    return spec;
};
