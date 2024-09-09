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
import type { IChartRenderSpecConverter } from '../../types';
import { ChartTypeBits } from '../../../chart/constants';
import { defaultChartStyle } from '../../../chart/constants/default-chart-style';
import { SpecField } from './constants';
import { createLabelMap } from './tools';

export const radarChartConverter: IChartRenderSpecConverter<IRadarChartSpec> = {
    canConvert(config) {
        return config.type === ChartTypeBits.Radar;
    },
    // eslint-disable-next-line max-lines-per-function
    convert(config) {
        const { category, series } = config;

        const { categoryNameMap, seriesNameMap } = createLabelMap(config);
        const values = series.map((ser) => {
            return ser.items.map((item, valueIndex) => {
                const categoryKey = category?.keys[valueIndex] ?? `Category ${String(valueIndex + 1)}`;

                return {
                    [SpecField.categoryField]: categoryKey,
                    [SpecField.categoryFieldLabel]: category?.items[valueIndex].label,
                    [SpecField.seriesField]: String(ser.index),
                    [SpecField.seriesFieldLabel]: ser.name,
                    [SpecField.valueField]: item.value,
                }; ;
            });
        }).flat();
        return {
            type: 'radar',
            data: {
                values,
            },
            legends: [
                {
                    type: 'discrete',
                    item: {
                        label: {
                            formatMethod: (text, item) => {
                                return item.id ? seriesNameMap[item.id] : '';
                            },
                        },
                    },
                },
            ],
            tooltip: {
                mark: {
                    title: {
                        value: (datum) => {
                            return datum ? datum[SpecField.categoryFieldLabel] : '';
                        },
                        valueStyle: {
                            fontSize: defaultChartStyle.textStyle.fontSize,
                        },
                    },
                    content: {
                        key: (datum) => {
                            if (!datum) {
                                return '';
                            }

                            return datum[SpecField.categoryFieldLabel] ?? datum[SpecField.seriesFieldLabel];
                        },
                        keyStyle: {
                            fontSize: defaultChartStyle.textStyle.fontSize,
                        },
                        value: (datum) => {
                            return datum ? datum[SpecField.valueField] : '';
                        },
                        valueStyle: {
                            fontSize: defaultChartStyle.textStyle.fontSize,
                        },
                    },
                },
                dimension: {
                    content: {
                        key: (datum) => {
                            return datum ? datum[SpecField.seriesFieldLabel] : '';
                        },
                        value: (datum) => {
                            return datum ? datum[SpecField.valueField] : '';
                        },
                        keyStyle: {
                            fontSize: defaultChartStyle.textStyle.fontSize,
                        },
                        valueStyle: {
                            fontSize: defaultChartStyle.textStyle.fontSize,
                        },
                    },
                },
            },
            label: {
                visible: true,
            },
            axes: [
                {
                    orient: 'angle', // 角度轴配置
                    tick: {
                        visible: false,
                    },
                    label: {
                        visible: true,
                        formatMethod: (text, datum) => {
                            const label = datum?.label;
                            if (label) {
                                return label;
                            }

                            return datum?.id ? categoryNameMap[datum.id] : '';
                        },
                    },
                    grid: {
                        style: {
                            lineDash: [0],
                        },
                    },
                },
                {
                    orient: 'radius', // 半径轴配置
                    grid: {
                        smooth: true, // 平滑的网格线
                        style: {
                            lineDash: [0],
                        },
                    //   alternateColor: '#f5f5f5' // 配置栅格线间的背景色
                    },
                },
            ],
            crosshair: {
                categoryField: {
                    visible: true,
                    line: {
                        style: {
                            lineDash: [0],
                            lineWidth: 1,
                        },
                    },
                },

            },
            animation: false,
            outerRadius: defaultChartStyle.pie.radius,
            seriesField: SpecField.seriesField,
            valueField: SpecField.valueField,
            categoryField: SpecField.categoryField,
        };
    },
};
