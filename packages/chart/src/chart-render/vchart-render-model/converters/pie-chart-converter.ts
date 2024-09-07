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

import type { IPieChartSpec } from '@visactor/vchart';
import type { IChartRenderSpecConverter } from '../../types';
import { chartBitsUtils, ChartTypeBits } from '../../../chart/constants';
import { defaultChartStyle } from '../../../chart/constants/default-chart-style';
import { SpecField } from './constants';
import { createLabelMap } from './tools';

export const pieChartConverter: IChartRenderSpecConverter<IPieChartSpec> = {
    canConvert(config) {
        return chartBitsUtils.baseOn(config.type, ChartTypeBits.Pie);
    },

    convert(config) {
        const { category, series } = config;
        const { categoryNameMap } = createLabelMap(config);
        const values = series[0]?.items.map((item, valueIndex) => {
            const categoryKey = category?.keys[valueIndex];
            return {
                [SpecField.categoryField]: categoryKey,
                [SpecField.categoryFieldLabel]: category?.items[valueIndex].label,
                [SpecField.valueField]: item.value,
            };
        });

        return {
            type: 'pie',
            data: {
                values,
            },
            pie: {
                style: {
                    lineWidth: 1.5,
                },
                // state: {
                //     hover: {
                //         outerRadius: 0.85,
                //         outerBorder: {
                //             distance: 1,
                //             lineWidth: 1,
                //             stroke: '#4e83fd',
                //         },
                //     },
                // },
            },
            legends: [
                {
                    type: 'discrete',
                    item: {
                        label: {
                            formatMethod: (text, item) => {
                                return item.id ? categoryNameMap[item.id] : '';
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
                            return datum ? datum[SpecField.categoryFieldLabel] : '';
                        },
                        keyStyle: {
                            fontSize: defaultChartStyle.textStyle.fontSize,
                        },
                        value: (datum) => {
                            return datum ? `${datum[SpecField.valueField]}(${datum._percent_}%)` : '';
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
            animation: false,
            outerRadius: defaultChartStyle.pie.radius,
            valueField: SpecField.valueField,
            categoryField: SpecField.categoryField,
        };
    },
};
