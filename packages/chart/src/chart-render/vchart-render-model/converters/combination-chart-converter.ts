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
import { ChartTypeBits } from '../../../chart/constants';
import type { IChartRenderSpecConverter } from '../../types';
import { SpecField } from './constants';
import { createLabelMap } from './tools';

export const combinationChartConverter: IChartRenderSpecConverter<ICommonChartSpec> = {
    canConvert(config) {
        return config.type === ChartTypeBits.Combination;
    },

    convert(config) {
        const { category, series } = config;
        const hasCategory = Boolean(category);

        const { categoryNameMap } = createLabelMap(config);
        const seriesIndexes: number[] = [];

        const values = series.map((ser, seriesIndex) => {
            seriesIndexes.push(seriesIndex);

            return ser.items.map((item, valueIndex) => {
                const xField = category?.keys[valueIndex] || valueIndex;
                return {
                    [SpecField.seriesIndex]: seriesIndex,
                    [SpecField.seriesField]: String(ser.index),
                    [SpecField.yField]: item.value,
                    [SpecField.xField]: xField,
                    [SpecField.seriesFieldLabel]: ser.name,
                };
            });
        }).flat();

        return {
            type: 'common',
            data: {
                id: 'combination',
                values,
            },
            axes: [
                { orient: 'left', seriesIndex: seriesIndexes },
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
            ],
            tooltip: {
                dimension: {
                    title: {
                        value: (datum) => categoryNameMap[datum?.[SpecField.xField]],
                        visible: hasCategory,
                    },
                },
                mark: {
                    title: {
                        value: (datum) => categoryNameMap[datum?.[SpecField.xField]],
                    },
                },
            },
            legends: {
                visible: true,
            },
        }; ;
    },
};
