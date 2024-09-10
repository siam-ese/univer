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

import type { IRadarChartSpec } from '@visactor/vchart';
import { Tools } from '@univerjs/core';
import { ChartTypeBits } from '../../../chart/constants';
import type { VChartRenderSpecOperator } from '../vchart-render-engine';
import type { ILabelStyle } from '../../../chart/style.types';
import { RadarShape } from '../../../chart/style.types';
import { SpecField } from '../converters/constants';
import { defaultChartStyle } from '../../../chart/constants/default-chart-style';
import { applyLabelStyle } from './tools';

export const radarStyleOperator: VChartRenderSpecOperator = (_spec, style, config) => {
    if (config.type !== ChartTypeBits.Radar) return;
    const spec = _spec as IRadarChartSpec;
    const radiusAxis = spec.axes?.find((axis) => axis.orient === 'radius');

    if (radiusAxis) {
        Tools.set(radiusAxis, 'grid.smooth', style.radar?.shape === RadarShape.Circle);
    }
    Tools.set(spec, 'area.visible', style.radar?.fill);

    const seriesStyleMap = style.seriesStyleMap;
    const allSeriesStyle = style.allSeriesStyle;

    const seriesLabelStyleCache = new Map<string, Partial<ILabelStyle>>();

    Tools.set(spec, 'label.dataFilter', (labelItem: any[]) => {
        return labelItem.map((item) => {
            const seriesId = item.data[SpecField.seriesField];
            if (!seriesLabelStyleCache.has(seriesId)) {
                seriesLabelStyleCache.set(seriesId, Object.assign({ fontSize: defaultChartStyle.textStyle.fontSize }, allSeriesStyle?.label, seriesStyleMap?.[seriesId]?.label));
            }
            const seriesStyle = seriesLabelStyleCache.get(seriesId)!;

            return applyLabelStyle(item, '', seriesStyle);
        });
    });
};
