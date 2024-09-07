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

import type { ICartesianChartSpec } from '@visactor/vchart';
import { chartBitsUtils } from '../../../chart/constants';
import type { IChartRenderSpecConverter } from '../../types';
import { SpecField } from './constants';
import { createLabelMap } from './tools';

type ExpectedSpec = ICartesianChartSpec & { seriesField: string };

export const cartesianChartConverter: IChartRenderSpecConverter<ExpectedSpec> = {
    canConvert(config) {
        // if (config.type === ChartTypeBits.Combination
        //     || config.type === ChartTypeBits.Radar
        //     || chartBitsUtils.baseOn(config.type, ChartTypeBits.Pie)
        // ) {
        return false;
        // }
        // return true;
    },
    // eslint-disable-next-line max-lines-per-function
    convert(config) {
        const { category, series } = config;

        const hasCategory = Boolean(category);

        const labelMap = createLabelMap(config);
        const { categoryNameMap, seriesNameMap } = labelMap;
        const values = series.map((ser) => {
            return ser.items.map((item, valueIndex) => {
                const xField = category?.keys[valueIndex] || valueIndex;

                return ({
                    [SpecField.seriesField]: String(ser.index),
                    [SpecField.yField]: item.value,
                    [SpecField.xField]: xField,
                    [SpecField.seriesFieldLabel]: ser.name,
                    [SpecField.categoryFieldLabel]: categoryNameMap[xField],
                });
            });
        }).flat();

        const specChartType = chartBitsUtils.chartBitToString(config.type);

        return {
            type: specChartType,
            data: {
                values,
            },
            xField: [SpecField.xField, SpecField.seriesField],
            yField: SpecField.yField,
            seriesField: SpecField.seriesFieldLabel,
            legends: [
                {
                    type: 'discrete',
                    item: {
                        label: {
                            formatMethod: (text, item, index) => {
                                return categoryNameMap[index] || text;
                            },
                        },
                    },
                },
            ],
            tooltip: {
                dimension: {
                    title: {
                        value: (datum) => seriesNameMap[datum?.[SpecField.xField]],
                        visible: hasCategory,
                    },
                },
                mark: {
                    title: {
                        visible: hasCategory,
                        value: (datum) => {
                            return datum?.[SpecField.categoryFieldLabel];
                        },
                    },
                },
            },
            axes: [
                {
                    type: 'band',
                    orient: 'bottom',
                    visible: hasCategory,
                    label: {
                        formatMethod: (text, datum) => {
                            return categoryNameMap[datum?.id];
                        },
                    },
                    bandPadding: 0.2,
                    paddingInner: 0.2,
                    paddingOuter: 0.1,
                },
                {
                    type: 'linear',
                    orient: 'left',
                    nice: true,
                },
            ],
            __extra__: labelMap,
        };
    },
};
