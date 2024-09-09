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

import type { ICommonChartSpec } from '@visactor/vchart';
import { generateRandomId } from '@univerjs/core';
import { chartBitsUtils, ChartTypeBits } from '../../../chart/constants';
import type { IChartRenderSpecConverter } from '../../types';
import { defaultChartStyle } from '../../../chart/constants/default-chart-style';
import { SpecField } from './constants';
import { createLabelMap } from './tools';

const { combination } = defaultChartStyle;

interface IDataItem {
    [SpecField.seriesId]: string;
    id: string;
    chartType: string;
    values: Array<Record<string, any>>;
}

export const combinationChartConverter: IChartRenderSpecConverter<ICommonChartSpec> = {
    canConvert(config) {
        if (config.type === ChartTypeBits.Radar
            || chartBitsUtils.baseOn(config.type, ChartTypeBits.Pie)
        ) {
            return false;
        }
        return true;
    },
    // eslint-disable-next-line max-lines-per-function
    convert(config, style) {
        const { category, series } = config;
        const hasCategory = Boolean(category);

        const { seriesNameMap, categoryNameMap } = createLabelMap(config);
        const leftSeriesId = new Set<string>();
        const rightSeriesId = new Set<string>();

        const chartData: Array<IDataItem> = [];

        const seriesStyleMap = style.common?.seriesStyleMap;

        // const randomSeriesGroupIdMap = new Map<string, string>();

        // function ensureGroupId(key: string) {
        //     if (!randomSeriesGroupIdMap.has(key)) {
        //         randomSeriesGroupIdMap.set(key, `${generateRandomId()}&${key}`);
        //     }
        //     return randomSeriesGroupIdMap.get(key)!;
        // }

        // function ensureChartDataItem(id: string, seriesId: string) {
        //     let item = chartData.find((item) => item.id === id);
        //     if (!item) {
        //         item = {
        //             id,
        //             [SpecField.seriesId]: seriesId,
        //             chartType: '',
        //             values: [],
        //         };
        //         chartData.push(item);
        //     }
        //     return item;
        // }

        series.forEach((ser, seriesIndex) => {
            const seriesId = String(ser.index);

            const seriesChartTypeBit = config.type !== ChartTypeBits.Combination
                ? config.type
                : seriesIndex === 0 ? combination.firstChartType : combination.otherChartType;

            const seriesChartType = chartBitsUtils.chartBitToString(seriesChartTypeBit);

            const seriesStyle = seriesStyleMap?.[seriesId];

            const uniqueId = generateRandomId();

            if (seriesStyle?.rightYAxis) {
                rightSeriesId.add(uniqueId);
            } else {
                leftSeriesId.add(uniqueId);
            }

            const item: IDataItem = {
                id: uniqueId,
                [SpecField.seriesId]: seriesId,
                chartType: seriesChartType,
                values: [],
            };
            // let item = chartData.find((item) => item.id === uniqueId);
            // if (!item) {
            //     item = {
            //         id: uniqueId,
            //         [SpecField.seriesId]: seriesId,
            //         chartType: seriesChartType,
            //         values: [],
            //     };
            chartData.push(item);
            // }
            // const item = ensureChartDataItem(uniqueId);
            // item[SpecField.seriesIds].add(seriesId);

            const values = ser.items.map((item, valueIndex) => {
                const xField = category?.keys[valueIndex] || valueIndex;
                return {
                    [SpecField.seriesIndex]: seriesIndex,
                    [SpecField.seriesField]: seriesId,
                    [SpecField.yField]: item.value,
                    [SpecField.xField]: xField,
                    [SpecField.seriesFieldLabel]: ser.name,
                    [SpecField.categoryFieldLabel]: categoryNameMap[xField],
                };
            });

            item.values = item.values.concat(values);
        });

        const axes: ICommonChartSpec['axes'] = [
            {
                type: 'linear',
                orient: 'left',
                seriesId: Array.from(leftSeriesId),
                nice: true,
            },
            {
                type: 'linear',
                orient: 'right',
                seriesId: Array.from(rightSeriesId),
                nice: true,
            },
            {
                type: 'band',
                orient: 'bottom',
                visible: hasCategory,
                label: {
                    formatMethod: (text, datum) => {
                        return categoryNameMap[datum?.id];
                    },
                },
                tick: {
                    visible: false,
                },
                bandPadding: 0.2,
                paddingInner: 0.2,
                paddingOuter: 0.1,
            },
        ];

        const chartSeries = chartData.map((item, index) => {
            return {
                type: item.chartType as 'line' | 'bar' | 'area',
                id: item.id,
                dataIndex: index,
                xField: item.chartType === 'bar' ? [SpecField.xField, SpecField.seriesField] : SpecField.xField,
                yField: SpecField.yField,
                seriesField: SpecField.seriesField,
                [SpecField.seriesId]: item[SpecField.seriesId],
            };
        });

        return {
            type: 'common',
            data: chartData,
            series: chartSeries,
            axes: axes.filter((axis) => {
                const seriesId = axis.seriesId;
                return Array.isArray(seriesId) ? seriesId.length > 0 : true;
            }) as ICommonChartSpec['axes'],
            tooltip: {
                dimension: {
                    visible: true,
                    title: {
                        value: (datum) => {
                            return datum?.[SpecField.categoryFieldLabel];
                        },
                        visible: hasCategory,
                    },
                    content: {
                        key: (datum) => datum?.[SpecField.seriesFieldLabel],
                        value: (datum) => datum?.[SpecField.yField],
                    },
                },
                mark: {
                    visible: true,
                    title: {
                        value: (datum) => {
                            return datum?.[SpecField.categoryFieldLabel];
                        },
                        visible: hasCategory,
                    },
                    content: {
                        key: (datum) => datum?.[SpecField.seriesFieldLabel],
                        value: (datum) => datum?.[SpecField.yField],
                    },
                },
            },
            crosshair: {
                xField: {
                    visible: chartSeries.some((series) => ['line', 'area'].includes(series.type)),
                    line: {
                        type: 'line',
                        visible: true,
                        style: {
                            lineWidth: 1,
                            stroke: '#333',
                            lineDash: [0],
                        },
                    },
                },
            },
            legends: [
                {
                    type: 'discrete',
                    item: {
                        label: {
                            formatMethod: (text, item, index) => {
                                return item.id ? seriesNameMap[item.id] : text;
                            },
                        },
                    },
                },
            ],
        }; ;
    },
};
