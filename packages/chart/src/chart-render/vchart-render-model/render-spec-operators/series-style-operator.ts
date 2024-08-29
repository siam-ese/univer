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
import type { ISeriesStyle } from '../../../chart/style.types';
import { ChartBorderDashType } from '../../../chart/style.types';

const dashValues = {
    [ChartBorderDashType.Solid]: [0],
    [ChartBorderDashType.Dotted]: [3, 3],
    [ChartBorderDashType.Dashed]: [6, 2],
};

const supportedChartUnit = ['bar', 'line'];
export const seriesStyleOperator: VChartRenderSpecOperator = (spec, style, config) => {
    const specSeriesStyle = config.units.map((unit) => {
        return unit.data.series.map((series) => {
            return {
                index: series.index,
                name: series.name,
            };
        });
    }).flat();
    const allSeriesStyle = style.common?.allSeriesStyle;
    const seriesStyleMap = style.common?.seriesStyleMap;

    if (allSeriesStyle?.label?.visible) {
        Tools.set(spec, 'label.visible', true);
    }

    specSeriesStyle.forEach((item) => {
        const styleItem = seriesStyleMap?.[item.index];

        const applyBorderStyle: Partial<ISeriesStyle['border']> = Object.assign({}, allSeriesStyle?.border, styleItem?.border);
        // const applyLabelStyle: Partial<ISeriesStyle['label']> = Object.assign({}, allSeriesStyle?.label, styleItem?.label);

        supportedChartUnit.forEach((unit) => {
            if (applyBorderStyle?.dashType) {
                Tools.set(item, `${unit}.style.outerBorder.lineDash`, dashValues[applyBorderStyle.dashType]);
            }
            if (applyBorderStyle?.width) {
                Tools.set(item, `${unit}.style.outerBorder.lineWidth`, applyBorderStyle.width);
            }
            if (applyBorderStyle?.opacity) {
                Tools.set(item, `${unit}.style.outerBorder.strokeOpacity`, applyBorderStyle.opacity);
            }
            if (applyBorderStyle?.color) {
                Tools.set(item, `${unit}.style.outerBorder.stroke`, applyBorderStyle.color);
            }

            // if (applyLabelStyle.visible) {
            //     Tools.set(item, 'label.style.visible', applyLabelStyle.visible);
            // }
        });
    });
    spec.seriesStyle = specSeriesStyle;

    return spec;
};
