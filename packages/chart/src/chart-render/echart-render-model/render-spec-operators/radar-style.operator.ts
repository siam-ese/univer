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
import { ChartTypeBits } from '../../../chart/constants';
import type { EChartRenderSpecOperator } from '../echart-render-engine';
import { RadarShape } from '../../../chart/style.types';
import { defaultChartStyle } from '../../../chart/constants/default-chart-style';
import { applyLabelStyle, seriesForEach } from './tools';
// import { toArray } from 'rxjs';

const { textStyle } = defaultChartStyle;

export const radarStyleOperator: EChartRenderSpecOperator = (spec, style, config) => {
    if (config.type !== ChartTypeBits.Radar) return;
    // const spec = _spec as IRadarChartSpec;
    // const radiusAxis = spec.axes?.find((axis) => axis.orient === 'radius');

    if (style.radar?.shape === RadarShape.Circle) {
        Tools.set(spec, 'radar.shape', 'circle');
    }
    // _spec.radar.shape = 'circle';
    // if (radiusAxis) {
        // Tools.set(radiusAxis, 'grid.smooth', style.radar?.shape === RadarShape.Circle);
        // }
    const { seriesStyleMap, allSeriesStyle } = style;
    seriesForEach(spec.series, (series) => {
        if (series.type === 'radar') {
            if (style.radar?.fill) {
                series.areaStyle = {};
            }
            series.data?.forEach((dataItem) => {
                const seriesId = (dataItem as any).seriesId;
                applyLabelStyle(
                    dataItem,
                    'label',
                    Object.assign({ fontSize: textStyle.fontSize }, allSeriesStyle?.label, seriesStyleMap?.[seriesId]?.label));
            });
        }
    });
    // if (spec.series) {
    //     toArray(spec.series).forEach((series) => {
    //         if (series.type === 'radar') {
    //             if (style.radar?.fill) {
    //                 series.areaStyle = {};
    //             }
    //             series.data?.forEach((dataItem) => {
    //                 const seriesId = (dataItem as any).seriesId;
    //                 applyLabelStyle(
    //                     dataItem,
    //                     'label',
    //                     Object.assign({ fontSize: textStyle.fontSize }, allSeriesStyle?.label, seriesStyleMap?.[seriesId]?.label));
    //             });
    //         }
    //     });
    // }
    // spec.series?.forEach((series) => {
    //     if ()
    // })
    // Tools.set(spec, 'areaStyle', style.radar?.fill);

    // const seriesStyleMap = style.seriesStyleMap;
    // const allSeriesStyle = style.allSeriesStyle;

    // const seriesLabelStyleCache = new Map<string, Partial<ILabelStyle>>();

    // Tools.set(spec, 'label.dataFilter', (labelItem: any[]) => {
    //     return labelItem.map((item) => {
    //         const seriesId = item.data[SpecField.SeriesField];
    //         if (!seriesLabelStyleCache.has(seriesId)) {
    //             seriesLabelStyleCache.set(seriesId, Object.assign({ fontSize: defaultChartStyle.textStyle.fontSize }, allSeriesStyle?.label, seriesStyleMap?.[seriesId]?.label));
    //         }
    //         const seriesStyle = seriesLabelStyleCache.get(seriesId)!;

    //         return applyLabelStyle(item, '', seriesStyle);
    //     });
    // });
};
