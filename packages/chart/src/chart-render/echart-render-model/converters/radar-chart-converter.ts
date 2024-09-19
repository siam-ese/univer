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

import type { IChartRenderSpecConverter } from '../../types';
import { ChartTypeBits } from '../../../chart/constants';
import { defaultChartStyle } from '../../../chart/constants/default-chart-style';
import type { EChartSpec, OptionalDataValue } from '../echart-render-engine';
import { SpecField } from './constants';
import { createLabelMap } from './tools';

export const radarChartConverter: IChartRenderSpecConverter<EChartSpec> = {
    canConvert(config) {
        return config.type === ChartTypeBits.Radar;
    },
    // eslint-disable-next-line max-lines-per-function
    convert(config): EChartSpec {
        const { category, series } = config;

        const { categoryNameMap, seriesNameMap } = createLabelMap(config);
        const indicator = category?.items.map((item) => item.label ?? '');

        const data = series.map((ser) => {
            return {
                name: ser.name,
                seriesId: String(ser.index),
                value: ser.items.map((item) => item.value as OptionalDataValue),
            };
        });

        return {
            // backgroundColor: '#fff',
            tooltip: {} as EChartSpec['tooltip'],
            radar: {
                radius: '65%',
                indicator: indicator?.map((name) => ({ name })),
            },
            series: [
                {
                    name: 'data',
                    type: 'radar',
                    data,
                },
            ],
        };

        // console.log('category', category);
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
                            if (!datum) {
                                return '';
                            }
                            return datum ? datum[SpecField.CategoryFieldLabel] : '';
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

                            return datum[SpecField.CategoryFieldLabel] || datum[SpecField.SeriesFieldLabel];
                        },
                        keyStyle: {
                            fontSize: defaultChartStyle.textStyle.fontSize,
                        },
                        value: (datum) => {
                            return datum ? datum[SpecField.ValueField] : '';
                        },
                        valueStyle: {
                            fontSize: defaultChartStyle.textStyle.fontSize,
                        },
                    },
                },
                dimension: {
                    title: {
                        value: (datum) => {
                            if (!datum) {
                                return '';
                            }

                            return datum[SpecField.CategoryFieldLabel];
                        },
                    },
                    content: {
                        key: (datum) => {
                            return datum ? datum[SpecField.SeriesFieldLabel] : '';
                        },
                        value: (datum) => {
                            return datum ? datum[SpecField.ValueField] : '';
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
            seriesField: SpecField.SeriesField,
            valueField: SpecField.ValueField,
            categoryField: SpecField.CategoryField,
        };
    },
};
