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
import type { IChartRenderSpecConverter } from '../types';
import { ChartType } from '../../chart/constants';
import { SpecField } from './constants';

export const lineConverter: IChartRenderSpecConverter<ICartesianChartSpec & { seriesField: string }> = {
    canConvert(config) {
        return config.type !== ChartType.Pie;
    },
    convert(config) {
        const unit = Array.isArray(config.units) ? config.units[0] : config.units;
        const { category, series } = unit.data;
        // const hasXField = Boolean(category);
        // console.log(category, 'category');
        const hasCategory = Boolean(category);

        const xFieldLabelMap: Record<string, string> = {};
        const values = series.map((ser, seriesIndex) => {
            return ser.items.map((item, valueIndex) => {
                const xField = category?.keys[valueIndex] || seriesIndex;
                const xFieldLabel = category?.items[valueIndex].label || '';
                xFieldLabelMap[xField] = xFieldLabel;
                return ({
                    [SpecField.seriesIndex]: seriesIndex,
                    [SpecField.yField]: item.value,
                    // [SpecField.xFieldId]: xFieldId,
                    [SpecField.xField]: xField,
                    [SpecField.seriesField]: ser.name,
                });
            });
        }).flat();

        // console.log(Boolean(category), 'Boolean(category)');

        return {
            type: config.type.toLowerCase(),
            data: {
                values,
            },
            xField: SpecField.xField,
            yField: SpecField.yField,
            seriesField: SpecField.seriesField,
            tooltip: {
                dimension: {
                    title: {
                        visible: hasCategory,
                    },
                },
                mark: {
                    title: {
                        visible: hasCategory,
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
                            return xFieldLabelMap[datum?.id];
                        },
                    },
                },
            ],
        };
    },
};
