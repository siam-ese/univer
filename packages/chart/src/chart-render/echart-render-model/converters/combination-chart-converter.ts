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

import { ChartAttributeBits, chartBitsUtils, ChartTypeBits } from '../../../chart/constants';
import type { IChartRenderSpecConverter } from '../../types';
import { defaultChartStyle } from '../../../chart/constants/default-chart-style';
import { AxisValueType } from '../../../chart/runtime-context.types';
import type { EChartSeriesItem, EChartSpec, OptionalDataValue } from '../echart-render-engine';

const { combination } = defaultChartStyle;

interface IDataItem {
    seriesId: string;
    id: string;
    chartType: string;
    values: Array<Record<string, any>>;
}

// function createValueAxis(position: IRuntimeAxisPosition): ICartesianLinearAxisSpec {
//     return {
//         orient: position,
//         type: 'linear',
//         nice: true,
//     };
// }

// function createTextAxis(position: IRuntimeAxisPosition): ICartesianBandAxisSpec {
//     return {
//         orient: position,
//         type: 'band',
//         visible: true,
//         tick: {
//             visible: false,
//         },
//         bandPadding: 0.2,
//         paddingInner: 0.2,
//         paddingOuter: 0.1,
//     };
// }

export const combinationChartConverter: IChartRenderSpecConverter<EChartSpec> = {
    canConvert(config) {
        if (config.type === ChartTypeBits.Radar
            || chartBitsUtils.baseOn(config.type, ChartTypeBits.Pie)
        ) {
            return false;
        }
        return true;
    },

    convert(config, style): EChartSpec {
        const { category, series } = config;

        const seriesStyleMap = style.seriesStyleMap;

        const chartSeries = series.map((ser, index) => {
            const seriesId = String(ser.index);
            const seriesStyle = seriesStyleMap?.[seriesId];
            const combinationChartType = seriesStyle?.chartType ?? (index === 0 ? combination.firstChartType : combination.otherChartType);

            const seriesChartTypeBit = config.type !== ChartTypeBits.Combination
                ? config.type
                : combinationChartType;

            const seriesChartType = chartBitsUtils.chartBitToString(seriesChartTypeBit);

            const seriesItem: EChartSeriesItem = {
                type: seriesChartType as 'bar',
                seriesId,
                name: ser.name,
                data: ser.items.map((item) => item.value as OptionalDataValue),
                emphasis: {
                    focus: 'series',
                },
            };
            return seriesItem;
        });

        const axes: EChartSpec['xAxis'] = (style.runtime?.axes ?? []).map((axis) => {
            const innerAxis = axis.type === AxisValueType.Text
                ? {
                    type: 'category' as const,
                    position: axis.position,
                    data: category?.items.map((item) => item.label),
                }
                : {
                    type: 'value' as const,
                    position: axis.position,
                };

            return innerAxis;
        });

        return {
            yAxis: axes.filter((axis) => axis.position === 'left' || axis.position === 'right') as EChartSpec['yAxis'],
            xAxis: axes.filter((axis) => axis.position === 'bottom') as EChartSpec['xAxis'],
            series: chartSeries,
            tooltip: {
                trigger: chartBitsUtils.has(config.type, ChartAttributeBits.Horizontal) ? 'item' : 'axis',
                axisPointer: {
                    type: 'line',
                },
            },
        };
    },
};
